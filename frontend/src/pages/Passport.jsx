import { useState, useMemo, useEffect } from 'react';
import { Heart, ImageOff, Plus, Receipt, Star, Trash2, User, Pencil, ChevronLeft, ChevronRight, Search, Filter, BookOpen, FileText } from 'lucide-react';
import Stamp from '../components/Stamp';
import { BeanRating, Bean } from '../components/Bean';
import { ITEM_ICONS, ITEM_TYPES, formatDate } from '../constants';
import ReceiptModal from '../components/ReceiptModal';
import EditEntryModal from '../components/EditEntryModal';

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

export default function Passport({ entries, explorerName, user, loading, onRename, onNew, onDelete, onUpdate }) {
  const [selectedId, setSelectedId] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [stampPage, setStampPage] = useState(1);
  const [mobileTab, setMobileTab] = useState('left');

  // Recent visits search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [treatFilter, setTreatFilter] = useState('All');

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

  // Pagination for stamps (6 per page)
  const STAMPS_PER_PAGE = 6;
  const totalPages = Math.ceil(entries.length / STAMPS_PER_PAGE) || 1;

  useEffect(() => {
    if (stampPage > totalPages) {
      setStampPage(totalPages);
    }
  }, [stampPage, totalPages]);

  const paginatedStamps = useMemo(() => {
    const start = (stampPage - 1) * STAMPS_PER_PAGE;
    return entries.slice(start, start + STAMPS_PER_PAGE);
  }, [entries, stampPage]);

  // Filtered recent visits
  const filteredRecentEntries = useMemo(() => {
    return entries.filter((e) => {
      const cafeName = e.cafes?.name || '';
      const neighborhood = e.cafes?.neighborhood || '';
      const tastingNotes = e.tasting_notes || '';
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        cafeName.toLowerCase().includes(query) ||
        neighborhood.toLowerCase().includes(query) ||
        tastingNotes.toLowerCase().includes(query);

      const matchesTreat = treatFilter === 'All' || e.item_type === treatFilter;

      return matchesSearch && matchesTreat;
    });
  }, [entries, searchQuery, treatFilter]);

  const avatarUrl = user?.user_metadata?.avatar_url || '';
  const userBio = user?.user_metadata?.bio || '';

  // Rich Vintage Loading State (Replacing the plain skeleton)
  if (loading) {
    return (
      <div className="space-y-10">
        <section className="grid overflow-hidden rounded-2xl border-4 border-espresso bg-espresso p-2 shadow-xl md:grid-cols-2 md:p-3">
          {/* Left Page Loading */}
          <div className="book-page book-spine-left flex flex-col items-center justify-center p-8 bg-[#FAF6F0] min-h-[520px] text-center">
            <div className="rounded-full bg-blush/60 p-4 border-2 border-dashed border-vintage mb-4 animate-spin">
              <Star className="h-8 w-8 text-sakura fill-sakura" />
            </div>
            <h3 className="font-display text-xl font-bold text-espresso">Opening your passport...</h3>
            <p className="mt-1 font-type text-xs text-mocha tracking-widest uppercase">Fetching your coffee stamps & memories</p>
          </div>

          {/* Right Page Loading */}
          <div className="book-page book-spine-right flex flex-col items-center justify-center p-8 bg-[#FAF6F0] min-h-[520px] text-center">
            <div className="rounded-xl bg-white/80 p-6 border border-vintage shadow-sm max-w-xs w-full space-y-3">
              <div className="h-32 bg-mist/60 rounded-lg flex items-center justify-center">
                <Heart className="h-8 w-8 text-sakura animate-pulse fill-sakura" />
              </div>
              <div className="h-4 w-3/4 bg-espresso/15 rounded mx-auto" />
              <div className="h-3 w-1/2 bg-espresso/10 rounded mx-auto" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Mobile Page Tab Switcher with SVG Icons */}
      <div className="flex rounded-xl bg-espresso p-1.5 md:hidden font-type text-xs font-bold text-parchment shadow-md gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('left')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-center transition-colors ${
            mobileTab === 'left' ? 'bg-paper text-espresso shadow' : 'text-parchment hover:bg-roast/50'
          }`}
        >
          <BookOpen className="h-4 w-4 text-sakura" />
          <span>Passport & Stamps</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('right')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-center transition-colors ${
            mobileTab === 'right' ? 'bg-paper text-espresso shadow' : 'text-parchment hover:bg-roast/50'
          }`}
        >
          <FileText className="h-4 w-4 text-sakura" />
          <span>Entry Details</span>
        </button>
      </div>

      {/* Open passport book */}
      <section
        aria-label="Passport"
        className="grid overflow-hidden rounded-2xl border-4 border-espresso bg-espresso p-2 shadow-xl md:grid-cols-2 md:p-3"
      >
        {/* Left page: identity, stats, stamps */}
        <div className={`book-page book-spine-left flex-col justify-between rounded-lg p-6 md:flex md:rounded-l-lg md:rounded-tr-none md:p-8 ${mobileTab === 'left' ? 'flex' : 'hidden md:flex'}`}>
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl font-bold text-espresso">My Passport</h2>
                <p className="font-type text-sm text-mocha">Passport No. {passportNo}</p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-vintage bg-paper px-3 py-1.5 font-type text-xs font-bold text-espresso transition-colors hover:border-sakura hover:bg-blush/40"
              >
                <Receipt className="h-3.5 w-3.5 text-sakura" />
                Monthly Receipt
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-vintage bg-mist text-roast shadow-inner">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={explorerName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-9 w-9" strokeWidth={1.2} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-type text-sm text-mocha">Issued to</p>
                <input
                  value={explorerName}
                  onChange={(e) => onRename(e.target.value)}
                  aria-label="Explorer name"
                  maxLength={28}
                  className="w-full rounded border-b-2 border-dashed border-vintage bg-transparent font-display text-2xl font-bold text-espresso focus:border-sakura focus:outline-none"
                />
                {userBio && (
                  <p className="mt-1 font-type text-xs text-mocha line-clamp-2 italic">{userBio}</p>
                )}
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

            <div className="mt-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-espresso">Visit stamps</h3>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 font-type text-xs text-mocha">
                  <button
                    type="button"
                    disabled={stampPage === 1}
                    onClick={() => setStampPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous stamp page"
                    className="rounded border border-vintage bg-paper p-1 hover:bg-mist disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span>Page {stampPage} of {totalPages}</span>
                  <button
                    type="button"
                    disabled={stampPage === totalPages}
                    onClick={() => setStampPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next stamp page"
                    className="rounded border border-vintage bg-paper p-1 hover:bg-mist disabled:opacity-30"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {entries.length === 0 ? (
              <p className="mt-3 text-sm text-mocha">No stamps yet. Log your first café visit to fill this page.</p>
            ) : (
              <ul className="mt-3 grid min-h-[280px] grid-cols-3 justify-items-center gap-x-1 gap-y-3">
                {paginatedStamps.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(e.id);
                        setMobileTab('right');
                      }}
                      aria-label={`Open ${e.cafes?.name} entry`}
                      className={`rounded-full transition-transform hover:scale-105 ${selected?.id === e.id ? 'ring-2 ring-sakura ring-offset-2 ring-offset-parchment' : ''}`}
                    >
                      <Stamp entry={e} size={94} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 border-t border-dashed border-vintage/70 pt-3 text-center">
            <p className="font-type text-[10px] tracking-widest text-mocha uppercase">
              OFFICIAL CAFESTAMP PASSPORT • KEEP EXPLORING
            </p>
          </div>
        </div>

        {/* Right page: entry details */}
        <div className={`book-page book-spine-right flex-col justify-between rounded-lg p-6 md:flex md:rounded-r-lg md:rounded-bl-none md:p-8 ${mobileTab === 'right' ? 'flex' : 'hidden md:flex'}`}>
          <div>
            <h2 className="font-display text-2xl font-bold text-espresso">Entry details</h2>

            {selected ? (
              <article className="mt-4 flex flex-1 flex-col">
                <div className="polaroid mx-auto w-full max-w-xs -rotate-2 bg-white p-3 pb-4 shadow-sm">
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
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingEntry(selected)}
                        className="flex items-center gap-1 rounded border border-vintage bg-paper px-2.5 py-1 text-xs text-roast hover:border-sakura hover:text-espresso"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(selected.id)}
                        className="flex items-center gap-1 rounded border border-vintage bg-paper px-2.5 py-1 text-xs text-roast hover:border-sakura hover:text-[#b5655f]"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 border-y border-vintage/60 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-espresso">Treat</span>
                        <Pill>{selected.item_type}</Pill>
                      </div>
                      {selected.price !== null && selected.price !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-xs font-bold text-mocha">Price:</span>
                          <span className="rounded-md bg-espresso px-2.5 py-0.5 font-type text-xs font-bold text-parchment">
                            ₱{Number(selected.price).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {selected.entry_tags && selected.entry_tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="mr-1 font-display text-xs font-bold text-espresso">Flavor tags:</span>
                        {selected.entry_tags.map((t) => (
                          <span key={t.id} className="rounded border border-vintage bg-paper px-2 py-0.5 text-[11px] text-roast">
                            #{t.tag_name}
                          </span>
                        ))}
                      </div>
                    )}
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
          </div>

          <button
            type="button"
            onClick={onNew}
            className="mt-6 flex items-center justify-center gap-2 self-end rounded-md bg-espresso px-4 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-roast"
          >
            <Plus className="h-4 w-4" /> Stamp new visit
          </button>
        </div>
      </section>

      {/* Recent visits section */}
      <section aria-labelledby="recent-h" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h2 id="recent-h" className="font-display text-2xl font-bold text-espresso">Recent visits</h2>
            <span className="rounded-full bg-espresso/10 px-2.5 py-0.5 font-type text-xs font-bold text-espresso">
              {filteredRecentEntries.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-type text-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mocha" />
              <input
                type="text"
                placeholder="Search café, area, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-vintage bg-white py-1.5 pl-8 pr-3 text-espresso focus:border-espresso focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-mocha" />
              <select
                value={treatFilter}
                onChange={(e) => setTreatFilter(e.target.value)}
                className="rounded-lg border border-vintage bg-white px-2.5 py-1.5 text-espresso focus:border-espresso focus:outline-none"
              >
                <option value="All">All Treats</option>
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-mocha">Your visit log is empty.</p>
        ) : filteredRecentEntries.length === 0 ? (
          <div className="rounded-xl border border-vintage bg-white p-8 text-center font-type text-xs text-mocha">
            No visits match your search or filter criteria.
          </div>
        ) : (
          <div className="max-h-[540px] overflow-y-auto rounded-xl border border-vintage/60 bg-parchment/40 p-3 pr-2">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecentEntries.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(e.id);
                      const idx = entries.findIndex((item) => item.id === e.id);
                      if (idx !== -1) setStampPage(Math.floor(idx / STAMPS_PER_PAGE) + 1);
                      setMobileTab('right');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex h-full w-full flex-col rounded-lg border bg-white p-4 text-left transition-colors hover:border-sakura ${
                      selected?.id === e.id ? 'border-espresso ring-1 ring-espresso' : 'border-vintage'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-lg font-bold text-espresso">{e.cafes?.name}</h3>
                        <p className="text-xs text-latte">{e.cafes?.neighborhood || 'Neighborhood not set'}</p>
                      </div>
                      <Pill>{e.item_type}</Pill>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <BeanRating value={e.rating || 0} size={16} />
                      {e.price !== null && e.price !== undefined && (
                        <span className="font-type text-xs font-bold text-roast">₱{Number(e.price).toFixed(2)}</span>
                      )}
                    </div>
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
          </div>
        )}
      </section>

      {/* Modals */}
      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        entries={entries}
        explorerName={explorerName}
      />

      <EditEntryModal
        open={Boolean(editingEntry)}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onUpdate={onUpdate}
      />
    </div>
  );
}