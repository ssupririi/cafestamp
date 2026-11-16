import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Upload, Plus, Check } from 'lucide-react';
import { ITEM_TYPES, FLAVOR_TAGS, toDateKey } from '../constants';
import { Bean } from './Bean';

function compressVisitPhoto(file, maxDim = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('');
    };
    img.src = url;
  });
}

export default function EditEntryModal({ open, entry, onClose, onUpdate }) {
  const [cafeName, setCafeName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [visitDate, setVisitDate] = useState(toDateKey(new Date()));
  const [itemType, setItemType] = useState('Coffee');
  const [rating, setRating] = useState(5);
  const [price, setPrice] = useState('');
  const [tastingNotes, setTastingNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (entry) {
      setCafeName(entry.cafes?.name || entry.cafe_name || '');
      setNeighborhood(entry.cafes?.neighborhood || '');
      setVisitDate(entry.visit_date || toDateKey(new Date()));
      setItemType(entry.item_type || 'Coffee');
      setRating(entry.rating || 5);
      setPrice(entry.price !== null && entry.price !== undefined ? entry.price : '');
      setTastingNotes(entry.tasting_notes || '');
      setPhotoUrl(entry.photo_url || '');
      setSelectedTags(entry.entry_tags ? entry.entry_tags.map((t) => t.tag_name) : []);
    }
  }, [entry]);

  if (!open || !entry) return null;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const trimmed = customTagInput.trim().replace(/^#/, '');
      if (trimmed && !selectedTags.includes(trimmed)) {
        setSelectedTags((prev) => [...prev, trimmed]);
        setCustomTagInput('');
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressVisitPhoto(file);
    if (compressed) setPhotoUrl(compressed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cafeName.trim()) return;

    setSubmitting(true);
    try {
      await onUpdate(entry.id, {
        cafe_name: cafeName.trim(),
        neighborhood: neighborhood.trim(),
        visit_date: visitDate,
        item_type: itemType,
        rating,
        price: price === '' ? null : Number(price),
        tasting_notes: tastingNotes.trim(),
        photo_url: photoUrl.trim(),
        tags: selectedTags,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const customSelectedTags = selectedTags.filter((t) => !FLAVOR_TAGS.includes(t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/45 p-3 sm:p-4 backdrop-blur-xs">
      {/* Added max-h-[90vh] and overflow-y-auto so small screens can scroll cleanly */}
      <div className="relative flex w-full max-w-lg max-h-[90vh] flex-col overflow-y-auto rounded-2xl border-4 border-espresso bg-[#fdfbf7] p-4 sm:p-5 text-espresso shadow-2xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-espresso/20 pb-2.5">
          <div className="flex items-center gap-2 text-espresso">
            <Sparkles className="h-5 w-5 text-sakura" />
            <h2 className="font-display text-base font-bold">Edit Stamp Visit</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-espresso hover:bg-espresso/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form - Single Column Stack */}
        <form onSubmit={handleSubmit} className="space-y-3 font-type text-xs text-espresso">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-espresso mb-1">Café Name *</label>
              <input
                type="text"
                required
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-espresso mb-1">Neighborhood / City</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-espresso mb-1">Visit Date</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full rounded border border-vintage bg-white px-2.5 py-2 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-espresso mb-1">Treat Type</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full rounded border border-vintage bg-white px-2.5 py-2 text-espresso focus:border-sakura focus:outline-none"
              >
                {ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-espresso mb-1">Price (₱)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded border border-vintage bg-white px-2.5 py-2 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-espresso mb-1">Bean Rating (1-5)</label>
            <div className="flex items-center gap-1.5 rounded border border-vintage/60 bg-white/50 px-3 py-1.5">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(num)}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                >
                  <Bean filled={num <= rating} size={24} />
                </button>
              ))}
              <span className="ml-2 font-bold text-espresso">{rating} / 5 Beans</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-espresso mb-1">Flavor Tags</label>
            <div className="flex flex-wrap gap-1 rounded border border-vintage/60 bg-white/50 p-2">
              {FLAVOR_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded border px-2 py-0.5 text-[10px] transition-colors ${
                      active
                        ? 'border-sakura bg-sakura/30 font-bold text-espresso'
                        : 'border-vintage bg-white text-espresso hover:border-mocha'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {customSelectedTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center gap-1 rounded border border-espresso bg-espresso px-2 py-0.5 text-[10px] font-bold text-parchment hover:bg-roast"
                  title="Click to remove custom tag"
                >
                  #{tag} <X className="h-2.5 w-2.5" />
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="mt-1.5 flex gap-1.5">
              <input
                type="text"
                placeholder="Add custom tag (e.g. cozy, matcha)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="w-full rounded border border-vintage bg-white px-2.5 py-1.5 text-xs text-espresso focus:border-sakura focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="inline-flex items-center gap-1 rounded border border-vintage bg-paper px-3 py-1.5 text-xs font-bold text-espresso hover:bg-mist"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-espresso mb-1">Visit Photo</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const compressed = await compressVisitPhoto(file);
                  if (compressed) setPhotoUrl(compressed);
                }
              }}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-vintage bg-white p-3 text-center cursor-pointer hover:border-sakura transition-colors"
            >
              {photoUrl ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold py-1">
                  <Check className="h-4 w-4" />
                  <span>Photo loaded! Click to replace</span>
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 text-mocha mb-0.5" />
                  <p className="text-xs text-roast">
                    Drag & drop your photo here, or <span className="font-bold text-espresso underline">browse</span>
                  </p>
                  <p className="text-[10px] text-latte mt-0.5">Supports PNG, JPG, WebM</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-espresso mb-1">Tasting Notes</label>
            <textarea
              rows={2}
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
              placeholder="Notes on aroma, flavor profile..."
              className="w-full rounded border border-vintage bg-white px-3 py-2 text-espresso focus:border-sakura focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 border-t border-vintage/60 pt-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-vintage px-4 py-1.5 font-medium text-espresso hover:bg-espresso/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-espresso px-5 py-1.5 font-medium text-parchment hover:bg-roast disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}