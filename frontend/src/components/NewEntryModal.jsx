import { useState, useRef } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { ITEM_TYPES, FLAVOR_TAGS, toDateKey } from '../constants';
import { Bean } from './Bean';

export default function NewEntryModal({ open, onClose, onCreate }) {
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

  if (!open) return null;

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoUrl(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cafeName.trim()) return;

    setSubmitting(true);
    try {
      await onCreate({
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
      setCafeName('');
      setNeighborhood('');
      setVisitDate(toDateKey(new Date()));
      setItemType('Coffee');
      setRating(5);
      setPrice('');
      setTastingNotes('');
      setPhotoUrl('');
      setSelectedTags([]);
      setCustomTagInput('');
      onClose();
    } catch (err) {
      console.error('Failed to create entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl border-4 border-espresso bg-[#fdfbf7] p-5 shadow-2xl text-espresso">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-espresso/20 pb-2">
          <div className="flex items-center gap-2 text-espresso">
            <Plus className="h-5 w-5 text-sakura" />
            <h2 className="font-display text-lg font-bold">Stamp New Visit</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-espresso hover:bg-espresso/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 font-type text-xs text-espresso">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-espresso">Café Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Wildflour Café"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="mt-1 w-full rounded border border-vintage bg-white px-2.5 py-1.5 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-espresso">Neighborhood / City</label>
              <input
                type="text"
                placeholder="e.g. BGC, Taguig"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="mt-1 w-full rounded border border-vintage bg-white px-2.5 py-1.5 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-espresso">Visit Date</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="mt-1 w-full rounded border border-vintage bg-white px-2.5 py-1.5 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-espresso">Treat Type</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="mt-1 w-full rounded border border-vintage bg-white px-2.5 py-1.5 text-espresso focus:border-sakura focus:outline-none"
              >
                {ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-espresso">Price (₱)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded border border-vintage bg-white px-2.5 py-1.5 text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-espresso">Bean Rating (1-5)</label>
            <div className="mt-1 flex items-center gap-1.5">
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
            <label className="block font-bold text-espresso">Flavor Tags</label>
            <div className="mt-1 flex flex-wrap gap-1">
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
            </div>
            {/* Custom Tag Input */}
            <div className="mt-2 flex gap-1.5">
              <input
                type="text"
                placeholder="Add custom tag (e.g. cozy, matcha)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="w-full rounded border border-vintage bg-white px-2 py-1 text-xs text-espresso focus:border-sakura focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="inline-flex items-center gap-1 rounded border border-vintage bg-paper px-2.5 py-1 text-xs font-bold text-espresso hover:bg-mist"
              >
                <Plus className="h-3 w-3" /> Add
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
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (uploadEvent) => setPhotoUrl(uploadEvent.target.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-vintage bg-white p-2.5 text-center cursor-pointer hover:border-sakura transition-colors"
            >
              <Upload className="h-4 w-4 text-mocha mb-0.5" />
              <p className="font-type text-xs text-roast">
                Drag & drop your photo here, or <span className="font-bold text-espresso underline">browse</span>
              </p>
              <p className="text-[10px] text-latte mt-0.5">
                {photoUrl ? 'Photo loaded successfully!' : 'Supports PNG, JPG, WebM'}
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-espresso">Tasting Notes</label>
            <textarea
              rows={2}
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
              placeholder="Notes on aroma, flavor profile..."
              className="mt-1 w-full rounded border border-vintage bg-white px-2.5 py-1.5 text-espresso focus:border-sakura focus:outline-none"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2 pt-1">
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
              {submitting ? 'Stamping...' : 'Save Stamp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}