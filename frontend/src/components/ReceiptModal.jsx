import { useMemo, useRef, useState } from 'react';
import { X, Download, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function ReceiptModal({ open, onClose, entries = [], explorerName = 'Explorer' }) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Build sorted list of available YYYY-MM months from entries (defaulting to current month)
  const availableMonths = useMemo(() => {
    const set = new Set();
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    set.add(currentKey);

    entries.forEach((e) => {
      if (e.visit_date) {
        set.add(e.visit_date.slice(0, 7));
      }
    });

    return Array.from(set).sort().reverse(); // Newest month first
  }, [entries]);

  const [monthIndex, setMonthIndex] = useState(0);
  const selectedMonth = availableMonths[monthIndex] || availableMonths[0];

  // Filter entries for the selected month
  const monthlyEntries = useMemo(() => {
    return entries
      .filter((e) => e.visit_date?.startsWith(selectedMonth))
      .sort((a, b) => a.visit_date.localeCompare(b.visit_date));
  }, [entries, selectedMonth]);

  // Calculate wrap-up stats
  const stats = useMemo(() => {
    const totalVisits = monthlyEntries.length;
    const totalSpent = monthlyEntries.reduce((sum, e) => sum + (Number(e.price) || 0), 0);
    const hasAnyPrice = monthlyEntries.some((e) => e.price !== null && e.price !== undefined);

    const avgRating = totalVisits
      ? (monthlyEntries.reduce((sum, e) => sum + (Number(e.rating) || 0), 0) / totalVisits).toFixed(1)
      : '0.0';

    // Top treat category
    const typeCounts = monthlyEntries.reduce((acc, e) => {
      const t = e.item_type || 'Coffee';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const topTreat = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Most visited café
    const cafeCounts = monthlyEntries.reduce((acc, e) => {
      const name = e.cafes?.name || e.cafe_name || 'Unknown Café';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const topCafe = Object.entries(cafeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    return { totalVisits, totalSpent, hasAnyPrice, avgRating, topTreat, topCafe };
  }, [monthlyEntries]);

  if (!open) return null;

  // Format YYYY-MM -> "NOVEMBER 2026"
  const [year, month] = selectedMonth.split('-');
  const monthLabel = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#fdfbf7',
      });
      const link = document.createElement('a');
      link.download = `cafestamp-${selectedMonth}-wrapup.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate receipt PNG:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/65 p-4 backdrop-blur-xs">
      <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border-4 border-espresso bg-parchment p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Top Modal Bar */}
        <div className="mb-3 flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-espresso">
            <Receipt className="h-5 w-5 text-sakura" />
            <span className="font-display text-lg font-bold">Monthly Café Receipt</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt"
            className="rounded-md p-1 text-espresso hover:bg-roast/15"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Month Switcher */}
        <div className="mb-4 flex w-full max-w-xs items-center justify-between rounded-lg border border-vintage bg-paper px-3 py-1.5 font-type text-xs text-espresso">
          <button
            type="button"
            disabled={monthIndex >= availableMonths.length - 1}
            onClick={() => setMonthIndex((i) => i + 1)}
            aria-label="Previous month"
            className="rounded p-1 hover:bg-mist disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold tracking-wider">{monthLabel}</span>
          <button
            type="button"
            disabled={monthIndex <= 0}
            onClick={() => setMonthIndex((i) => i - 1)}
            aria-label="Next month"
            className="rounded p-1 hover:bg-mist disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Receiptify-Style Thermal Card */}
        <div
          ref={receiptRef}
          className="w-full max-w-xs bg-[#fdfbf7] px-6 py-7 font-type text-xs text-espresso shadow-md"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(215,204,200,0.2), transparent 70%)',
          }}
        >
          {/* Top Serrated Edge */}
          <div
            className="-mx-6 -mt-7 mb-5 h-3 w-[calc(100%+3rem)]"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #f4ebe1 50%, transparent 50%), linear-gradient(225deg, #f4ebe1 50%, transparent 50%)',
              backgroundPosition: 'top left, top left',
              backgroundSize: '12px 12px',
              backgroundRepeat: 'repeat-x',
            }}
          />

          {/* Receipt Header */}
          <div className="text-center">
            <h3 className="font-display text-2xl font-bold tracking-wider text-espresso uppercase">
              CAFESTAMP
            </h3>
            <p className="mt-0.5 text-[11px] font-bold tracking-[0.2em] text-mocha uppercase">
              MONTHLY WRAP-UP
            </p>
            <p className="mt-1 text-[10px] text-roast uppercase">{monthLabel}</p>
          </div>

          <div className="my-3 border-t border-dashed border-mocha/50" />

          {/* Customer / Passport Info */}
          <div className="space-y-0.5 text-[11px] text-roast uppercase">
            <div className="flex justify-between">
              <span>ORDER FOR:</span>
              <span className="font-bold text-espresso">{explorerName || 'EXPLORER'}</span>
            </div>
            <div className="flex justify-between">
              <span>TOP SPOT:</span>
              <span className="max-w-[11rem] truncate font-bold text-espresso">{stats.topCafe}</span>
            </div>
            <div className="flex justify-between">
              <span>GO-TO ORDER:</span>
              <span>{stats.topTreat}</span>
            </div>
          </div>

          <div className="my-3 border-t border-dashed border-mocha/50" />

          {/* Column Headers */}
          <div className="mb-2 flex justify-between text-[10px] font-bold text-mocha">
            <span>NO. &nbsp;CAFÉ / TREAT</span>
            <span>PRICE</span>
          </div>

          {/* Itemized Monthly Café Visits */}
          {monthlyEntries.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-mocha italic">
              No café visits stamped in {monthLabel}.
            </p>
          ) : (
            <ol className="space-y-2 text-[11px]">
              {monthlyEntries.map((entry, idx) => {
                const name = entry.cafes?.name || entry.cafe_name || 'Local Café';
                const day = entry.visit_date ? entry.visit_date.slice(8, 10) : '--';
                const hasPrice = entry.price !== null && entry.price !== undefined;
                return (
                  <li key={entry.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-espresso uppercase">
                        {String(idx + 1).padStart(2, '0')}. {name}
                      </p>
                      <p className="pl-5 text-[10px] text-mocha">
                        {entry.item_type} • Day {day} • {'★'.repeat(entry.rating || 0)}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-roast">
                      {hasPrice ? `₱${Number(entry.price).toFixed(0)}` : '—'}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="my-3 border-t border-dashed border-mocha/50" />

          {/* Totals Section */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[11px] text-roast">
              <span>ITEM COUNT (VISITS):</span>
              <span className="font-bold">{stats.totalVisits}</span>
            </div>
            <div className="flex justify-between text-[11px] text-roast">
              <span>AVG BEAN RATING:</span>
              <span className="font-bold">{stats.avgRating} / 5.0</span>
            </div>
            <div className="mt-1 flex justify-between pt-1 text-sm font-bold text-espresso">
              <span>TOTAL SPENT:</span>
              <span>{stats.hasAnyPrice ? `₱${stats.totalSpent.toFixed(2)}` : '₱0.00'}</span>
            </div>
          </div>

          <div className="my-4 border-t border-dashed border-mocha/50" />

          {/* Footer & Barcode */}
          <div className="text-center">
            <p className="text-[10px] tracking-widest text-mocha uppercase">
              CARDHOLDER COPY • KEEP STAMPING
            </p>
            <div
              className="mx-auto mt-3 h-9 w-44 opacity-85"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #3e2723 0px, #3e2723 2px, transparent 2px, transparent 5px, #3e2723 5px, #3e2723 6px, transparent 6px, transparent 9px, #3e2723 9px, #3e2723 12px, transparent 12px, transparent 14px)',
              }}
            />
            <p className="mt-1 text-[9px] tracking-[0.25em] text-mocha">
              CAFESTAMP-{selectedMonth.replace('-', '')}
            </p>
          </div>

          {/* Bottom Serrated Edge */}
          <div
            className="-mx-6 -mb-7 mt-5 h-3 w-[calc(100%+3rem)]"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #f4ebe1 50%, transparent 50%), linear-gradient(315deg, #f4ebe1 50%, transparent 50%)',
              backgroundPosition: 'bottom left, bottom left',
              backgroundSize: '12px 12px',
              backgroundRepeat: 'repeat-x',
            }}
          />
        </div>

        {/* Bottom Modal Actions */}
        <div className="mt-5 flex w-full justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-vintage px-4 py-2 font-type text-xs font-medium text-roast hover:bg-mist"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-md bg-espresso px-4 py-2 font-type text-xs font-medium text-parchment hover:bg-roast disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {downloading ? 'Printing...' : 'Save Receipt PNG'}
          </button>
        </div>
      </div>
    </div>
  );
}