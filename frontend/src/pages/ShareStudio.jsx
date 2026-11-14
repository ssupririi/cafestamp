import { useState, useRef } from 'react';
import { Download, Sparkles, Smartphone, LayoutTemplate, Share2, Camera, Send } from 'lucide-react';
import { toPng } from 'html-to-image';
import { formatDate } from '../constants';
import Stamp from '../components/Stamp';

export default function ShareStudio({ entries, user }) {
  const [selectedEntryId, setSelectedEntryId] = useState(entries[0]?.id || '');
  const [cardTheme, setCardTheme] = useState('stamp'); // 'stamp' | 'polaroid' | 'receipt'
  const [template, setTemplate] = useState('story'); // 'story' (9:16) | 'square' (1:1)
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef(null);

  const selected = entries.find((e) => String(e.id) === String(selectedEntryId)) || entries[0];
  const explorerName = user?.user_metadata?.explorer_name || 'ishi';
  const activeSocial = explorerName;

  const handleDownload = async () => {
    if (!cardRef.current) return null;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        backgroundColor: '#fdfbf7',
      });
      const link = document.createElement('a');
      link.download = `cafestamp-${selected?.cafes?.name || 'visit'}-${template}.png`;
      link.href = dataUrl;
      link.click();
      return dataUrl;
    } catch (err) {
      console.error('Failed to generate image:', err);
      alert('Could not export image. Please try again.');
      return null;
    } finally {
      setExporting(false);
    }
  };

  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: true,
        backgroundColor: '#fdfbf7',
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `cafestamp-${selected?.cafes?.name || 'visit'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Café Stamp Card',
          text: `Check out my café visit for ${selected?.cafes?.name || 'this spot'}! ☕✨ #CafeStampJourney`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Café Stamp Card',
          text: `Check out my café visit for ${selected?.cafes?.name || 'this spot'}! ☕✨`,
          url: window.location.href,
        });
      } else {
        handleDownload();
        alert('Web Share is not supported on this browser. Card downloaded to your device!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        handleDownload();
      }
    } finally {
      setExporting(false);
    }
  };

  if (!entries.length) {
    return (
      <div className="py-20 text-center font-type text-mocha">
        <p>No café visits logged yet! Stamp a few visits in your passport to use the Share Studio.</p>
      </div>
    );
  }

  const cafeDisplay = selected?.cafes?.name || selected?.cafe_name || 'Local Café';
  const neighborhood = selected?.cafes?.neighborhood || selected?.neighborhood || 'Cavite';
  const visitDate = selected?.visit_date || '';
  const dayNumber = visitDate ? visitDate.slice(8, 10) : '--';
  const hasPrice = selected?.price !== null && selected?.price !== undefined;
  const priceNum = Number(selected?.price) || 0;
  const ratingNum = Number(selected?.rating) || 5;

  return (
    <div className="space-y-6 relative">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border-4 border-espresso bg-[#fdfbf7] p-5 shadow-md md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="h-6 w-6 text-espresso" />
            <h1 className="font-display text-2xl font-bold text-espresso">Share Studio</h1>
          </div>
          <p className="font-type text-xs text-mocha mt-0.5">Craft and export aesthetic café stamp cards for your stories or feed.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-type text-xs">
          {/* Style Selector Tabs */}
          <div className="inline-flex rounded-lg border border-vintage bg-white p-1 shadow-inner">
            {[
              { id: 'stamp', label: 'Passport Stamp' },
              { id: 'polaroid', label: 'Polaroid' },
              { id: 'receipt', label: 'Cafe Receipt' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setCardTheme(t.id)}
                className={`rounded px-2.5 py-1.5 font-medium transition-colors text-center ${
                  cardTheme === t.id
                    ? 'bg-espresso text-parchment font-bold shadow-sm'
                    : 'text-roast hover:text-espresso'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Template switcher */}
          <div className="flex rounded-lg border border-vintage bg-[#fdfbf7] p-1">
            <button
              type="button"
              onClick={() => setTemplate('story')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition-colors ${
                template === 'story' ? 'bg-espresso text-parchment' : 'text-roast hover:bg-mist'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Story (9:16)
            </button>
            <button
              type="button"
              onClick={() => setTemplate('square')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition-colors ${
                template === 'square' ? 'bg-espresso text-parchment' : 'text-roast hover:bg-mist'
              }`}
            >
              <LayoutTemplate className="h-3.5 w-3.5" /> Square (1:1)
            </button>
          </div>

          {/* Export & Share Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={exporting || !selected}
              className="flex items-center gap-1.5 rounded-lg bg-sakura px-4 py-2 font-bold text-espresso hover:bg-sakura/80 disabled:opacity-50 transition-colors shadow-xs"
              title="Share directly to any app"
            >
              <Share2 className="h-4 w-4" />
              {exporting ? 'Preparing...' : 'Share to Socials'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting || !selected}
              className="flex items-center gap-1.5 rounded-lg bg-espresso px-3.5 py-2 font-bold text-parchment hover:bg-roast disabled:opacity-50 transition-colors shadow-xs"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Preview Canvas */}
        <div className="flex items-center justify-center rounded-2xl border-4 border-espresso bg-espresso/10 p-6 lg:col-span-2">
          <div
            ref={cardRef}
            className={`relative overflow-hidden border-4 border-espresso p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
              template === 'story'
                ? cardTheme === 'receipt' ? 'w-[320px] h-[568px]' : 'w-[360px] h-[640px]'
                : cardTheme === 'receipt' ? 'w-[380px] h-[380px]' : 'w-[450px] h-[450px]'
            }`}
            style={
              cardTheme === 'receipt'
                ? {
                    backgroundColor: '#fdfbf7',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(215,204,200,0.2), transparent 70%)',
                    color: '#3e2723',
                  }
                : {
                    backgroundColor: '#FAF6F0',
                    backgroundImage: 'radial-gradient(#e3d7cd 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                    color: '#3e2723',
                  }
            }
          >
            {/* 1. STAMP THEME */}
            {cardTheme === 'stamp' && selected && (
              <>
                <div className="flex items-center justify-between border-b border-vintage/60 pb-3 font-type text-xs text-mocha">
                  <span className="font-display font-bold tracking-wider text-espresso flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-sakura" /> CAFESTAMP
                  </span>
                  <span>@{activeSocial}</span>
                </div>

                <div className="my-auto flex flex-col items-center text-center">
                  <div className="relative mb-4 drop-shadow-md">
                    <Stamp entry={selected} size={template === 'story' ? 140 : 110} animate={false} />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-espresso">{cafeDisplay}</h3>
                  <p className="font-type text-xs text-mocha">{neighborhood}</p>

                  <div className="mt-3 font-mono text-sm tracking-wider text-roast">
                    {'★'.repeat(selected.rating || 5)}
                  </div>

                  {selected.tasting_notes && (
                    <blockquote className="mt-4 max-w-xs font-type text-xs italic text-roast bg-white/70 px-4 py-2.5 rounded-lg border border-vintage">
                      &ldquo;{selected.tasting_notes}&rdquo;
                    </blockquote>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-vintage/60 pt-3 font-type text-[11px] text-mocha">
                  <span>{formatDate(selected.visit_date)}</span>
                  <span className="font-bold text-espresso">#CafeStampJourney</span>
                </div>
              </>
            )}

            {/* 2. POLAROID THEME */}
            {cardTheme === 'polaroid' && selected && (
              <>
                <div className="flex items-center justify-between border-b border-vintage/60 pb-3 font-type text-xs text-mocha">
                  <span className="font-display font-bold tracking-wider text-espresso flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-sakura" /> CAFESTAMP MEMORY
                  </span>
                  <span>@{activeSocial}</span>
                </div>

                <div className="my-auto polaroid mx-auto w-full max-w-[260px] rotate-1 bg-white p-3 pb-4 shadow-lg border border-espresso/20">
                  <div className={`w-full overflow-hidden bg-[#f5f0eb] ${template === 'story' ? 'aspect-[4/5]' : 'aspect-square'}`}>
                    {selected.photo_url ? (
                      <img src={selected.photo_url} alt={cafeDisplay} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-mocha">
                        <Camera className="h-10 w-10" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display font-bold text-sm text-espresso">{cafeDisplay}</span>
                    <span className="text-[10px] text-mocha">{formatDate(selected.visit_date)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-vintage/60 pt-3 font-type text-[11px] text-mocha">
                  <span>{'★'.repeat(selected.rating || 5)}</span>
                  <span className="font-bold text-espresso">#CafeStampJourney</span>
                </div>
              </>
            )}

            {/* 3. CAFE RECEIPT THEME */}
            {cardTheme === 'receipt' && selected && (
              <div className="flex flex-col h-full justify-between font-type text-xs text-espresso">
                <div
                  className="-mx-6 -mt-8 mb-3 h-3 w-[calc(100%+3rem)]"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #f4ebe1 50%, transparent 50%), linear-gradient(225deg, #f4ebe1 50%, transparent 50%)',
                    backgroundPosition: 'top left, top left',
                    backgroundSize: '12px 12px',
                    backgroundRepeat: 'repeat-x',
                  }}
                />

                <div>
                  <div className="text-center">
                    <h3 className="font-display text-xl font-bold tracking-wider text-espresso uppercase">
                      CAFESTAMP
                    </h3>
                    <p className="mt-0.5 text-[10px] font-bold tracking-[0.2em] text-mocha uppercase">
                      VISIT WRAP-UP
                    </p>
                    <p className="mt-1 text-[10px] text-roast uppercase">{formatDate(selected.visit_date)}</p>
                  </div>

                  <div className="my-2 border-t border-dashed border-mocha/50" />

                  <div className="space-y-0.5 text-[11px] text-roast uppercase font-mono">
                    <div className="flex justify-between">
                      <span>ORDER FOR:</span>
                      <span className="font-bold text-espresso">{explorerName.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CAFÉ SPOT:</span>
                      <span className="max-w-[11rem] truncate font-bold text-espresso">{cafeDisplay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GO-TO ORDER:</span>
                      <span>{selected.item_type || 'Coffee'}</span>
                    </div>
                  </div>

                  <div className="my-2 border-t border-dashed border-mocha/50" />

                  <div className="mb-1.5 flex justify-between text-[10px] font-bold text-mocha font-mono">
                    <span>NO. &nbsp;CAFÉ / TREAT</span>
                    <span>PRICE</span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-espresso uppercase">
                          01. {cafeDisplay}
                        </p>
                        <p className="pl-4 text-[10px] text-mocha">
                          {selected.item_type} • Day {dayNumber} • {'★'.repeat(selected.rating || 0)}
                        </p>
                      </div>
                      <span className="shrink-0 font-bold text-roast">
                        {hasPrice ? `₱${priceNum.toFixed(0)}` : '—'}
                      </span>
                    </div>
                    {selected.tasting_notes && (
                      <p className="pl-4 text-[10px] italic text-mocha">
                        Notes: "{selected.tasting_notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="my-2 border-t border-dashed border-mocha/50" />

                  <div className="space-y-0.5 text-xs font-mono">
                    <div className="flex justify-between text-[11px] text-roast">
                      <span>VISIT COUNT:</span>
                      <span className="font-bold">1</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-roast">
                      <span>BEAN RATING:</span>
                      <span className="font-bold">{ratingNum.toFixed(1)} / 5.0</span>
                    </div>
                    <div className="mt-1 flex justify-between pt-1 text-sm font-bold text-espresso border-t border-dashed border-mocha/50">
                      <span>TOTAL PAID:</span>
                      <span>{hasPrice ? `₱${priceNum.toFixed(2)}` : '₱0.00'}</span>
                    </div>
                  </div>

                  <div className="my-2 border-t border-dashed border-mocha/50" />

                  <div className="text-center font-mono">
                    <p className="text-[10px] tracking-widest text-mocha uppercase">
                      CARDHOLDER COPY • KEEP STAMPING
                    </p>
                    <div
                      className="mx-auto mt-1.5 h-7 w-36 opacity-85"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(90deg, #3e2723 0px, #3e2723 2px, transparent 2px, transparent 5px, #3e2723 5px, #3e2723 6px, transparent 6px, transparent 9px, #3e2723 9px, #3e2723 12px, transparent 12px, transparent 14px)',
                      }}
                    />
                    <p className="mt-0.5 text-[9px] tracking-[0.25em] text-mocha">
                      CAFESTAMP-{visitDate ? visitDate.replace(/-/g, '') : '2026'}
                    </p>
                  </div>
                </div>

                <div
                  className="-mx-6 -mb-8 mt-3 h-3 w-[calc(100%+3rem)]"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #f4ebe1 50%, transparent 50%), linear-gradient(315deg, #f4ebe1 50%, transparent 50%)',
                    backgroundPosition: 'bottom left, bottom left',
                    backgroundSize: '12px 12px',
                    backgroundRepeat: 'repeat-x',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Select Entry to Share */}
        <div className="rounded-2xl border-2 border-espresso bg-[#fdfbf7] p-6 font-type shadow-md">
          <h3 className="font-display text-lg font-bold text-espresso">Choose Stamp to Share</h3>
          <p className="text-xs text-mocha mt-1">Select which café visit memory you want to feature on your card.</p>

          <ul className="mt-4 max-h-[420px] space-y-2.5 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-espresso/30">
            {entries.map((e) => {
              const isSelected = e.id === selected?.id;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEntryId(e.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-espresso bg-blush/60 font-bold text-espresso shadow-xs'
                        : 'border-vintage bg-white text-roast hover:border-sakura'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-sm font-display font-bold">{e.cafes?.name}</p>
                      <p className="text-[11px] text-mocha">{formatDate(e.visit_date)} • {e.item_type}</p>
                    </div>
                    <Stamp entry={e} size={42} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}