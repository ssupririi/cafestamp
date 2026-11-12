import { useState } from 'react';
import { Heart, ImageOff, Plus, Star, Trash2, User } from 'lucide-react';
import Stamp from '../components/Stamp';         
import { BeanRating, Bean } from '../components/Bean'; 
import { ITEM_ICONS, formatDate } from '../constants';

function Pill({ children }) {
  return (
    <span className="rounded-full border border-vintage bg-blush/50 px-2.5 py-0.5 text-xs text-roast">
      {children}
    </span>
  );
}

function Photo({ entry }) {
  const [failed, setFailed] = useState(false);
  const Icon = ITEM_ICONS[entry.item_type] || ITEM_ICONS.Coffee;
  if (!entry.photo_url || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-mist text-latte">
        {entry.photo_url ? <ImageOff className="h-8 w-8" /> : <Icon className="h-10 w-10" />}
        <span className="text-xs">{entry.photo_url ? 'Photo unavailable' : 'No photo yet'}</span>
      </div>
    );
  }
  return (
    <img src={entry.photo_url} alt={`${entry.item_type} at ${entry.cafes?.name}`} onError={() => setFailed(true)} className="h-full w-full object-cover" />
  );
}

export default function Passport({ entries, explorerName, onRename, onNew, onDelete }) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = entries.find((e) => e.id === selectedId) ?? entries[0];

  const uniqueCafes = new Set(entries.map((e) => e.cafe_id)).size;
  const fiveBean = entries.filter((e) => e.rating === 5).length;
  const visitsByCafe = entries.reduce((acc, e) => {
    const n = e.cafes?.name;
    if (n) acc[n] = (acc[n] || 0) + 1;
    return acc;
  }, {});
  const topCafe = Object.entries(visitsByCafe).sort((a, b) => b[1] - a[1])[0]?.[0];
  const passportNo = `2026-${String(entries.length).padStart(3, '0')}`;

  return (
    <div className="space-y-10">
      {/* Open passport book */}
      <section
        aria-label="Passport"
        className="grid overflow-hidden rounded-2xl border-4 border-espresso bg-espresso p-2 shadow-xl md:grid-cols-2 md:p-3"
      >
        {/* Left page: identity, stats, stamps */}
        <div className="book-page book-spine-left rounded-t-lg p-6 md:rounded-l-lg md:rounded-tr-none md:p-8">
          <h2 className="font-display text-2xl font-bold text-espresso">My Passport</h2>
          <p className="font-type text-sm text-mocha">Passport No. {passportNo}</p>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-md border-2 border-vintage bg-mist text-latte">
              <User className="h-10 w-10" strokeWidth={1.2} />
            </div>
            <div className="min-w-0">
              <p className="font-type text-sm text-mocha">Issued to</p>
              <input
                value={explorerName}
                onChange={(e) => onRename(e.target.value)}
                aria-label="Explorer name"
                maxLength={28}
                className="w-full rounded border-b-2 border-dashed border-vintage bg-transparent font-display text-2xl font-bold text-espresso focus:border-sakura focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-4 border-y border-vintage py-4">
            <dl className="font-type text-sm text-roast">
              <dt className="sr-only">Stamps collected</dt>
              <dd><strong className="text-lg">{entries.length}</strong> stamps collected</dd>
              <dd><strong className="text-lg">{uniqueCafes}</strong> cafés visited</dd>
            </dl>
            <div>
              <p className="font-display text-sm font-bold text-espresso">Top favorites</p>
              <div className="mt-1 flex items-center gap-3 text-sm text-roast">
                <span className="flex items-center gap-1" title={topCafe ? `Most visited: ${topCafe}` : 'No visits yet'}>
                  <Heart className="h-5 w-5 fill-sakura text-sakura" />
                  <span className="max-w-[7rem] truncate">{topCafe || '–'}</span>
                </span>
                <span className="flex items-center gap-1" title="5-bean treats">
                  <Bean filled size={20} /> {fiveBean}
                </span>
                <span className="flex items-center gap-1" title="Stamps collected">
                  <Star className="h-5 w-5 fill-gold text-gold" /> {entries.length}
                </span>
              </div>
            </div>
          </div>

          <h3 className="mt-5 font-display text-lg font-bold text-espresso">Visit stamps</h3>
          {entries.length === 0 ? (
            <p className="mt-3 text-sm text-mocha">No stamps yet. Log your first café visit to fill this page.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-3 gap-y-4 justify-items-center">
              {entries.slice(0, 6).map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => setSelectedId(e.id)} aria-label={`Open ${e.cafes?.name} entry`} className="rounded-full transition-transform hover:scale-105">
                    <Stamp entry={e} size={88} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right page: entry details */}
        <div className="book-page book-spine-right flex flex-col rounded-b-lg p-6 md:rounded-r-lg md:rounded-bl-none md:p-8">
          <h2 className="font-display text-2xl font-bold text-espresso">Entry details</h2>

          {selected ? (
            <article className="mt-4 flex flex-1 flex-col">
              <div className="polaroid mx-auto w-full max-w-xs -rotate-2 bg-white p-3 pb-4">
                <div className="aspect-square w-full overflow-hidden"><Photo entry={selected} /></div>
                <p className="mt-3 font-type text-sm font-bold text-espresso">{selected.cafes?.name}</p>
                <p className="font-type text-xs text-mocha">{formatDate(selected.visit_date)}</p>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-espresso">Rating</span>
                    <BeanRating value={selected.rating || 0} />
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(selected.id)}
                    className="flex items-center gap-1 rounded border border-vintage bg-paper px-2.5 py-1 text-xs text-roast hover:border-sakura hover:text-[#b5655f]"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-bold text-espresso">Flavor profile</span>
                  <Pill>{selected.item_type}</Pill>
                  {selected.entry_tags?.map((t) => <Pill key={t.id}>{t.tag_name}</Pill>)}
                </div>

                <div>
                  <span className="font-display font-bold text-espresso">Tasting notes</span>
                  <p className="mt-1 font-type text-roast">{selected.tasting_notes || 'No notes for this visit.'}</p>
                </div>
              </div>
            </article>
          ) : (
            <p className="mt-6 flex-1 text-sm text-mocha">Pick a stamp or log a visit to see its details here.</p>
          )}

          <button
            type="button"
            onClick={onNew}
            className="mt-6 flex items-center justify-center gap-2 self-end rounded-md bg-espresso px-4 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-roast"
          >
            <Plus className="h-4 w-4" /> Stamp new visit
          </button>
        </div>
      </section>

      {/* Recent visits grid */}
      <section aria-labelledby="recent-h">
        <h2 id="recent-h" className="font-display text-2xl font-bold text-espresso">Recent visits</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-mocha">Your visit log is empty.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => { setSelectedId(e.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex h-full w-full flex-col rounded-lg border border-vintage bg-white p-4 text-left transition-colors hover:border-sakura"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-bold text-espresso">{e.cafes?.name}</h3>
                      <p className="text-xs text-latte">{e.cafes?.neighborhood || 'Neighborhood not set'}</p>
                    </div>
                    <Pill>{e.item_type}</Pill>
                  </div>
                  <div className="mt-3"><BeanRating value={e.rating || 0} size={16} /></div>
                  {e.tasting_notes && (
                    <blockquote className="mt-3 line-clamp-2 border-l-2 border-sakura pl-3 font-type text-sm text-roast">
                      {e.tasting_notes}
                    </blockquote>
                  )}
                  <p className="mt-auto pt-3 font-type text-xs text-mocha">{formatDate(e.visit_date)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
