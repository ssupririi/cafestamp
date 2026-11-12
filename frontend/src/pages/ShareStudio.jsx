import { useRef, useState } from 'react';
import { Download, Share2, Sparkles, Smartphone, LayoutTemplate } from 'lucide-react';
import { toPng } from 'html-to-image';
import Stamp from '../components/Stamp';
import { BeanRating } from '../components/Bean';
import { formatDate } from '../constants';

export default function ShareStudio({ entries, user }) {
  const [selectedEntryId, setSelectedEntryId] = useState(entries[0]?.id || '');
  const [template, setTemplate] = useState('story'); // 'story' (9:16) or 'square' (1:1)
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef(null);

  const selected = entries.find((e) => e.id === selectedEntryId) ?? entries[0];
  const socials = user?.user_metadata?.socials || {};
  const activeSocial = socials.instagram || socials.tiktok || socials.threads || user?.user_metadata?.explorer_name || 'CafeExplorer';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `cafestamp-${selected?.cafes?.name || 'visit'}-${template}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Could not export image. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-espresso">Share Studio</h2>
        <p className="mt-2 font-type text-sm text-mocha">Log your first café visit to start generating shareable cards!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-espresso flex items-center gap-2">
            <Share2 className="h-6 w-6 text-sakura" /> Share Studio
          </h2>
          <p className="font-type text-xs text-mocha">Craft and export aesthetic café stamp cards for your stories or feed.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-type text-xs">
          {/* Template switcher */}
          <div className="flex rounded-lg border border-vintage bg-parchment p-1">
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

          <button
            type="button"
            onClick={handleDownload}
            disabled={exporting || !selected}
            className="flex items-center gap-1.5 rounded-md bg-espresso px-4 py-2 font-medium text-parchment hover:bg-roast disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Rendering...' : 'Download PNG'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Preview Canvas */}
        <div className="flex items-center justify-center rounded-2xl border-4 border-espresso bg-espresso/10 p-6 lg:col-span-2">
          <div
            ref={cardRef}
            className={`relative overflow-hidden border-4 border-espresso bg-[#FAF6F0] p-8 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
              template === 'story' ? 'w-[360px] h-[640px]' : 'w-[450px] h-[450px]'
            }`}
            style={{
              backgroundImage: 'radial-gradient(#e3d7cd 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Top branding / watermark */}
            <div className="flex items-center justify-between border-b border-vintage/60 pb-3 font-type text-xs text-mocha">
              <span className="font-display font-bold tracking-wider text-espresso flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-sakura" /> CAFESTAMP
              </span>
              <span>@{activeSocial}</span>
            </div>

            {/* Center Content */}
            {selected && (
              <div className="my-auto flex flex-col items-center text-center">
                <div className="relative mb-4 drop-shadow-md">
                  <Stamp entry={selected} size={template === 'story' ? 140 : 110} animate={false} />
                </div>

                <h3 className="font-display text-2xl font-bold text-espresso">{selected.cafes?.name}</h3>
                <p className="font-type text-xs text-mocha">{selected.cafes?.neighborhood || 'Specialty Café'}</p>

                <div className="mt-3">
                  <BeanRating value={selected.rating || 5} size={18} />
                </div>

                {selected.tasting_notes && (
                  <blockquote className="mt-4 max-w-xs font-type text-xs italic text-roast bg-white/70 px-4 py-2.5 rounded-lg border border-vintage">
                    &ldquo;{selected.tasting_notes}&rdquo;
                  </blockquote>
                )}
              </div>
            )}

            {/* Footer metadata */}
            <div className="flex items-center justify-between border-t border-vintage/60 pt-3 font-type text-[11px] text-mocha">
              <span>{selected ? formatDate(selected.visit_date) : ''}</span>
              <span className="font-bold text-espresso">#CafeStampJourney</span>
            </div>
          </div>
        </div>

        {/* Right: Select Entry to Share */}
        <div className="rounded-2xl border-2 border-espresso bg-parchment p-6 font-type">
          <h3 className="font-display text-lg font-bold text-espresso">Choose Stamp to Share</h3>
          <p className="text-xs text-mocha mt-1">Select which café visit memory you want to feature on your card.</p>

          <ul className="mt-4 max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
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