import { useState, useMemo } from 'react';
import { MapPin, Compass, ExternalLink, Search, Coffee, Sparkles } from 'lucide-react';
import { BeanRating } from '../components/Bean';
import Stamp from '../components/Stamp';
import { ITEM_TYPES, formatDate } from '../constants';

export default function Explore({ entries = [], onNew }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [selectedTreat, setSelectedTreat] = useState('All');
  const [activeCafeName, setActiveCafeName] = useState(null);

  // Group entries by unique café
  const cafesList = useMemo(() => {
    const map = new Map();

    entries.forEach((entry) => {
      const name = entry.cafes?.name || 'Unknown Café';
      const neighborhood = entry.cafes?.neighborhood?.trim() || 'Unspecified Area';
      const key = name.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          name,
          neighborhood,
          visits: [],
          totalRating: 0,
          treats: new Set(),
        });
      }

      const record = map.get(key);
      record.visits.push(entry);
      record.totalRating += Number(entry.rating) || 0;
      if (entry.item_type) record.treats.add(entry.item_type);
    });

    return Array.from(map.values()).map((c) => ({
      ...c,
      visitCount: c.visits.length,
      avgRating: c.visits.length ? (c.totalRating / c.visits.length).toFixed(1) : '0.0',
      latestEntry: c.visits[0],
      treatsArray: Array.from(c.treats),
    }));
  }, [entries]);

  // Unique neighborhoods for filter pills
  const neighborhoods = useMemo(() => {
    const set = new Set(cafesList.map((c) => c.neighborhood));
    return ['All', ...Array.from(set)];
  }, [cafesList]);

  // Filtered cafés
  const filteredCafes = useMemo(() => {
    return cafesList.filter((cafe) => {
      const matchesSearch =
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesNeighborhood =
        selectedNeighborhood === 'All' || cafe.neighborhood === selectedNeighborhood;
      const matchesTreat =
        selectedTreat === 'All' || cafe.treatsArray.includes(selectedTreat);

      return matchesSearch && matchesNeighborhood && matchesTreat;
    });
  }, [cafesList, searchQuery, selectedNeighborhood, selectedTreat]);

  const focusedCafe =
    filteredCafes.find((c) => c.name === activeCafeName) || filteredCafes[0] || null;

  // Build a clean Google Maps search embed URL for the focused café
  const mapQuery = focusedCafe
    ? encodeURIComponent(`${focusedCafe.name} ${focusedCafe.neighborhood}`)
    : encodeURIComponent('Cafes in Cavite');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border-4 border-espresso bg-[#fdfbf7] p-5 shadow-md md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-sakura" />
            <h1 className="font-display text-2xl font-bold text-espresso">Explore Spots</h1>
          </div>
          <p className="mt-0.5 font-type text-xs text-mocha">
            Revisit your stamped neighborhoods, filter by favorite treats, and locate cafés on the map.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 font-type text-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search café or neighborhood..."
            className="w-full rounded-lg border-2 border-vintage bg-white py-2 pl-9 pr-3 text-espresso focus:border-espresso focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-vintage bg-[#fdfbf7] p-3.5 font-type text-xs shadow-xs">
        {/* Neighborhood Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-bold text-espresso flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-sakura" /> Area:
          </span>
          {neighborhoods.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setSelectedNeighborhood(area)}
              className={`rounded-full border px-3 py-1 transition-colors ${
                selectedNeighborhood === area
                  ? 'border-espresso bg-espresso font-bold text-parchment'
                  : 'border-vintage bg-[#fdfbf7] text-roast hover:border-sakura'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Treat Type Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="treat-filter" className="font-bold text-espresso flex items-center gap-1">
            <Coffee className="h-3.5 w-3.5 text-mocha" /> Treat:
          </label>
          <select
            id="treat-filter"
            value={selectedTreat}
            onChange={(e) => setSelectedTreat(e.target.value)}
            className="rounded-lg border border-vintage bg-[#fdfbf7] px-2.5 py-1 text-espresso focus:border-espresso focus:outline-none"
          >
            <option value="All">All Treats</option>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-vintage bg-[#fdfbf7] py-16 text-center font-type">
          <p className="text-sm text-mocha">No cafés stamped yet! Log a visit to unlock your café map.</p>
          {onNew && (
            <button
              type="button"
              onClick={onNew}
              className="mt-4 rounded-lg bg-espresso px-5 py-2.5 text-xs font-bold text-parchment shadow-md hover:bg-roast transition-colors"
            >
              + Stamp First Café
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Café Directory Cards (7 cols) */}
          <div className="space-y-3 lg:col-span-7">
            <div className="flex items-center justify-between font-type text-xs text-mocha">
              <span>
                Showing <strong className="text-espresso">{filteredCafes.length}</strong>{' '}
                {filteredCafes.length === 1 ? 'café' : 'cafés'}
              </span>
              <span>Click a card to pin on map</span>
            </div>

            {filteredCafes.length === 0 ? (
              <div className="rounded-xl border border-vintage bg-white p-8 text-center font-type text-xs text-mocha">
                No cafés match your current filters. Try clearing your search or area filter.
              </div>
            ) : (
              <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-espresso/30">
                {filteredCafes.map((cafe) => {
                  const isFocused = focusedCafe?.name === cafe.name;
                  return (
                    <li key={cafe.name}>
                      <div
                        onClick={() => setActiveCafeName(cafe.name)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setActiveCafeName(cafe.name)}
                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 p-4 transition-all ${
                          isFocused
                            ? 'border-espresso bg-blush/40 shadow-md'
                            : 'border-vintage bg-white hover:border-sakura'
                        }`}
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate font-display text-lg font-bold text-espresso">
                              {cafe.name}
                            </h2>
                            <span className="shrink-0 rounded-full bg-espresso/10 px-2 py-0.5 font-type text-[10px] font-bold text-espresso">
                              {cafe.visitCount} {cafe.visitCount === 1 ? 'visit' : 'visits'}
                            </span>
                          </div>

                          <p className="flex items-center gap-1 font-type text-xs text-mocha">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-sakura" />
                            {cafe.neighborhood}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5">
                              <BeanRating value={Math.round(Number(cafe.avgRating))} size={15} />
                              <span className="font-type text-xs font-bold text-roast">
                                {cafe.avgRating}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {cafe.treatsArray.map((treat) => (
                                <span
                                  key={treat}
                                  className="rounded-full border border-vintage bg-[#fdfbf7] px-2 py-0.5 font-type text-[10px] text-roast"
                                >
                                  {treat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <Stamp entry={cafe.latestEntry} size={64} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right Column: Map & Spot Details Panel (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 overflow-hidden rounded-2xl border-4 border-espresso bg-[#fdfbf7] shadow-lg">
              <div className="flex items-center justify-between border-b-2 border-espresso/20 bg-espresso px-4 py-3 text-parchment">
                <div className="flex items-center gap-1.5 font-display text-sm font-bold">
                  <Sparkles className="h-4 w-4 text-sakura" />
                  <span>{focusedCafe ? focusedCafe.name : 'Café Map'}</span>
                </div>
                {focusedCafe && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-parchment/15 px-2 py-1 font-type text-[11px] text-parchment hover:bg-parchment/25"
                  >
                    Open Maps <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Embedded Map Frame */}
              <div className="aspect-[4/3] w-full bg-mist">
                <iframe
                  title={focusedCafe ? `Map of ${focusedCafe.name}` : 'Café Map'}
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Selected Café Quick Summary */}
              {focusedCafe && (
                <div className="space-y-2 p-4 font-type text-xs text-roast">
                  <div className="flex items-center justify-between border-b border-vintage pb-2">
                    <span className="font-bold text-espresso">Last Visited</span>
                    <span>{formatDate(focusedCafe.latestEntry.visit_date)}</span>
                  </div>
                  {focusedCafe.latestEntry.tasting_notes && (
                    <p className="italic text-mocha">
                      &ldquo;{focusedCafe.latestEntry.tasting_notes}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}