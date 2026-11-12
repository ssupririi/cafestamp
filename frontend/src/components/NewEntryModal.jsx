import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { BeanRating } from './Bean';
import { FLAVOR_TAGS, ITEM_TYPES, toDateKey } from '../constants';
import { createEntry, errorMessage } from '../services/api';

export default function NewEntryModal({ open, onClose, onCreate }) {
  const [cafeName, setCafeName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [visitDate, setVisitDate] = useState(toDateKey(new Date()));
  const [itemType, setItemType] = useState('Coffee');
  const [rating, setRating] = useState(5);
  const [tastingNotes, setTastingNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const addTag = (t) => {
    if (t && !tags.includes(t)) setTags([...tags, t]);
  };

  const removeTag = (t) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cafeName.trim()) {
      setError('Please enter a café name.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onCreate({
        cafe_name: cafeName.trim(),
        neighborhood: neighborhood.trim(),
        visit_date: visitDate,
        item_type: itemType,
        rating,
        tasting_notes: tastingNotes.trim(),
        photo_url: photoUrl.trim(),
        tags,
      });

      setCafeName('');
      setNeighborhood('');
      setTastingNotes('');
      setPhotoUrl('');
      setTags([]);
      setRating(5);

      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border-4 border-espresso bg-parchment p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-md p-1 text-espresso hover:bg-roast/20"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-2xl font-bold text-espresso">Stamp New Visit</h2>
        <p className="font-type text-xs text-mocha">Record your tasting notes and add a new stamp to your passport.</p>

        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-sakura bg-blush/50 p-3 text-xs text-espresso">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-type text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cafe-name" className="block text-xs font-bold text-espresso">Café name *</label>
              <input
                id="cafe-name"
                type="text"
                required
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                placeholder="e.g., Wildflour"
                className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="neighborhood" className="block text-xs font-bold text-espresso">Neighborhood</label>
              <input
                id="neighborhood"
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g., BGC, Taguig"
                className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="visit-date" className="block text-xs font-bold text-espresso">Visit date *</label>
              <input
                id="visit-date"
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="item-type" className="block text-xs font-bold text-espresso">Primary treat *</label>
              <select
                id="item-type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-espresso">Rating (Coffee beans)</span>
            <div className="mt-1.5">
              <BeanRating value={rating} onChange={setRating} size={22} />
            </div>
          </div>

          <div>
            <label htmlFor="tasting-notes" className="block text-xs font-bold text-espresso">Tasting notes</label>
            <textarea
              id="tasting-notes"
              rows="3"
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
              placeholder="Flaky pastry layers, rich dark chocolate notes..."
              className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="photo-url" className="block text-xs font-bold text-espresso">Photo URL</label>
            <input
              id="photo-url"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="mt-1 w-full rounded-md border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-xs font-bold text-espresso">Flavor tags</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FLAVOR_TAGS.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => (active ? removeTag(t) : addTag(t))}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      active ? 'border-sakura bg-sakura text-espresso font-bold' : 'border-vintage bg-white text-roast hover:border-gold'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                className="w-full rounded-md border border-vintage bg-white px-3 py-1.5 text-xs text-espresso focus:border-sakura focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customTag.trim()) {
                    addTag(customTag.trim());
                    setCustomTag('');
                  }
                }}
                className="rounded-md bg-roast px-3 py-1.5 text-xs text-parchment hover:bg-espresso"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-mist px-2 py-0.5 text-xs text-roast">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-vintage">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-vintage px-4 py-2 text-xs font-medium text-roast hover:bg-mist"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-espresso px-5 py-2 text-xs font-medium text-parchment hover:bg-roast disabled:opacity-50"
            >
              {submitting ? 'Stamping...' : 'Stamp Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}