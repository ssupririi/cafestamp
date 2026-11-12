import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Stamp from './Stamp';
import { BeanRating } from './Bean';
import { toDateKey, formatDate } from '../constants';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ entries }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(null);

  const byDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => (map[e.visit_date] ||= []).push(e));
    return map;
  }, [entries]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthVisits = Object.entries(byDate).filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .reduce((n, [, list]) => n + list.length, 0);

  const move = (delta) => { setCursor(new Date(year, month + delta, 1)); setSelectedKey(null); };
  const selectedEntries = selectedKey ? byDate[selectedKey] || [] : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <section className="book-page rounded-2xl border-4 border-espresso p-4 shadow-xl sm:p-6" aria-label="Calendar">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => move(-1)} aria-label="Previous month" className="rounded-md border border-vintage bg-paper p-2 hover:border-sakura">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-espresso">{monthLabel}</h2>
            <p className="font-type text-xs text-mocha">{monthVisits} {monthVisits === 1 ? 'stamp' : 'stamps'} this month</p>
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Next month" className="rounded-md border border-vintage bg-paper p-2 hover:border-sakura">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center font-type text-xs text-mocha">
          {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`b${i}`} />;
            const key = toDateKey(new Date(year, month, day));
            const list = byDate[key];
            const isToday = key === toDateKey(today);
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                aria-label={`${formatDate(key)}${list ? `, ${list.length} visit${list.length > 1 ? 's' : ''}` : ''}`}
                className={`relative flex aspect-square flex-col items-center justify-start rounded-md border p-1 text-xs transition-colors ${
                  isSelected ? 'border-sakura bg-blush/50' : 'border-vintage/70 bg-paper/70 hover:border-gold'
                }`}
              >
                <span className={`font-type ${isToday ? 'rounded-full bg-espresso px-1.5 text-parchment' : 'text-roast'}`}>{day}</span>
                {list && (
                  <span className="mt-0.5 flex flex-1 items-center justify-center">
                    <Stamp entry={list[0]} size={34} />
                    {list.length > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 rounded-full bg-sakura px-1 text-[10px] font-bold text-espresso">{list.length}</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <aside aria-live="polite" className="rounded-2xl border border-vintage bg-white p-5">
        <h2 className="font-display text-xl font-bold text-espresso">
          {selectedKey ? formatDate(selectedKey) : 'Pick a day'}
        </h2>
        {!selectedKey && <p className="mt-2 text-sm text-mocha">Select a date to see what you tasted. Stamped days have a visit.</p>}
        {selectedKey && selectedEntries.length === 0 && <p className="mt-2 text-sm text-mocha">No visits logged on this day.</p>}
        <ul className="mt-3 space-y-4">
          {selectedEntries.map((e) => (
            <li key={e.id} className="flex gap-3 border-t border-mist pt-3 first:border-0 first:pt-0">
              <Stamp entry={e} size={64} />
              <div className="min-w-0">
                <p className="font-display font-bold text-espresso">{e.cafes?.name}</p>
                <p className="text-xs text-latte">{e.item_type}{e.cafes?.neighborhood ? ` in ${e.cafes.neighborhood}` : ''}</p>
                <div className="mt-1"><BeanRating value={e.rating || 0} size={14} /></div>
                {e.tasting_notes && <p className="mt-1 font-type text-sm text-roast">{e.tasting_notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
