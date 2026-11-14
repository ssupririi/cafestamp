import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in backend/.env');
  process.exit(1);
}

// Client for verifying user tokens (Auth)
const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for secure database operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Auth Middleware: Extracts and verifies user from Bearer token
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token.' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session token.' });
  }

  req.user = user;
  next();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'cafestamp-backend' });
});

// GET all entries for the authenticated user
app.get('/api/entries', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select(`
        id,
        user_id,
        cafe_id,
        visit_date,
        item_type,
        rating,
        price,
        tasting_notes,
        photo_url,
        created_at,
        cafes ( id, name, neighborhood ),
        entry_tags ( id, tag_name )
      `)
      .eq('user_id', req.user.id)
      .order('visit_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new entry and its tags for the authenticated user
app.post('/api/entries', requireAuth, async (req, res) => {
  try {
    const { cafe_name, neighborhood, visit_date, item_type, rating, price, tasting_notes, photo_url, tags } = req.body;

    if (!cafe_name || !visit_date) {
      return res.status(400).json({ error: 'Cafe name and visit date are required.' });
    }

    let cafeId;
    const { data: existingCafes } = await supabase
      .from('cafes')
      .select('id')
      .ilike('name', cafe_name.trim())
      .limit(1);

    if (existingCafes && existingCafes.length > 0) {
      cafeId = existingCafes[0].id;
    } else {
      const { data: newCafe, error: cafeErr } = await supabase
        .from('cafes')
        .insert([{ name: cafe_name.trim(), neighborhood: neighborhood?.trim() || '' }])
        .select()
        .single();
      if (cafeErr) throw cafeErr;
      cafeId = newCafe.id;
    }

    const { data: entry, error: entryErr } = await supabase
      .from('entries')
      .insert([{
        user_id: req.user.id,
        cafe_id: cafeId,
        visit_date,
        item_type: item_type || 'Coffee',
        rating: rating || 5,
        tasting_notes: tasting_notes || '',
        photo_url: photo_url || '',
        price: price !== null && price !== undefined && price !== '' ? parseFloat(price) : null,
      }])
      .select()
      .single();

    if (entryErr) throw entryErr;

    if (tags && tags.length > 0) {
      const tagRows = tags.map((t) => ({ entry_id: entry.id, tag_name: t.trim() }));
      const { error: tagErr } = await supabase.from('entry_tags').insert(tagRows);
      if (tagErr) throw tagErr;
    }

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (Update) an existing entry and its tags
app.put('/api/entries/:id', requireAuth, async (req, res) => {
  try {
    const entryId = req.params.id;
    const { cafe_name, neighborhood, visit_date, item_type, rating, price, tasting_notes, photo_url, tags } = req.body;

    if (!cafe_name || !visit_date) {
      return res.status(400).json({ error: 'Cafe name and visit date are required.' });
    }

    const { data: target } = await supabase
      .from('entries')
      .select('user_id')
      .eq('id', entryId)
      .single();

    if (!target) return res.status(404).json({ error: 'Entry not found.' });
    if (target.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this stamp entry.' });
    }

    let cafeId;
    const { data: existingCafes } = await supabase
      .from('cafes')
      .select('id')
      .ilike('name', cafe_name.trim())
      .limit(1);

    if (existingCafes && existingCafes.length > 0) {
      cafeId = existingCafes[0].id;
    } else {
      const { data: newCafe, error: cafeErr } = await supabase
        .from('cafes')
        .insert([{ name: cafe_name.trim(), neighborhood: neighborhood?.trim() || '' }])
        .select()
        .single();
      if (cafeErr) throw cafeErr;
      cafeId = newCafe.id;
    }

    const { data: updatedEntry, error: entryErr } = await supabase
      .from('entries')
      .update({
        cafe_id: cafeId,
        visit_date,
        item_type: item_type || 'Coffee',
        rating: rating || 5,
        tasting_notes: tasting_notes || '',
        photo_url: photo_url || '',
        price: price !== null && price !== undefined && price !== '' ? parseFloat(price) : null,
      })
      .eq('id', entryId)
      .select()
      .single();

    if (entryErr) throw entryErr;

    await supabase.from('entry_tags').delete().eq('entry_id', entryId);
    if (tags && tags.length > 0) {
      const tagRows = tags.map((t) => ({ entry_id: entryId, tag_name: t.trim() }));
      const { error: tagErr } = await supabase.from('entry_tags').insert(tagRows);
      if (tagErr) throw tagErr;
    }

    res.json(updatedEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an entry
app.delete('/api/entries/:id', requireAuth, async (req, res) => {
  try {
    const entryId = req.params.id;

    const { data: target } = await supabase
      .from('entries')
      .select('user_id')
      .eq('id', entryId)
      .single();

    if (!target) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    if (target.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this stamp entry.' });
    }

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    res.json({ success: true, message: 'Stamp deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer({ maxHeaderSize: 32 * 1024 }, app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`CafeStamp backend running on port ${PORT}`);
});