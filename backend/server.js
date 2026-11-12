import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in backend/.env');
  process.exit(1);
}

// 1. Client for verifying user tokens (Auth)
const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);

// 2. Admin client for secure database operations (bypasses RLS for trusted backend server)
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
    const { cafe_name, neighborhood, visit_date, item_type, rating, tasting_notes, photo_url, tags } = req.body;

    if (!cafe_name || !visit_date) {
      return res.status(400).json({ error: 'Cafe name and visit date are required.' });
    }

    // 1. Check if café already exists for this user (or globally)
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

    // 2. Insert the entry record linked to the authenticated user
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
      }])
      .select()
      .single();

    if (entryErr) throw entryErr;

    // 3. Insert tags if provided
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

// DELETE an entry (ensuring it belongs to the authenticated user)
app.delete('/api/entries/:id', requireAuth, async (req, res) => {
  try {
    const entryId = req.params.id;

    // Verify ownership
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CafeStamp backend running on port ${PORT}`);
});