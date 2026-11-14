import { INKS } from '../constants';

const HEX = '50,3 90.7,26.5 90.7,73.5 50,97 9.3,73.5 9.3,26.5';

// Helper to render clean SVG line icons based on each exact treat type
function renderTreatSvg(type, strokeColor) {
  const t = (type || '').toLowerCase();

  // 1. Matcha -> Leaf / Sprout icon
  if (t === 'matcha') {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.35V10.5" />
        <path d="M12 10.5C12 6 7.5 3 3 3c0 4.5 3 9 9 7.5z" />
        <path d="M12 15.5c3.5-1.5 6.5-1 9-2.5-1 3.5-4 6.5-9 6.5z" />
      </svg>
    );
  }

  // 2. Tea -> Teapot / Teacup icon
  if (t === 'tea') {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 5H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
        <path d="M19 8h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
        <line x1="10" y1="2" x2="10" y2="5" />
        <line x1="6" y1="2" x2="6" y2="5" />
        <line x1="14" y1="2" x2="14" y2="5" />
      </svg>
    );
  }

  // 3. Pastry -> Croissant / Bakery icon
  if (t === 'pastry') {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 7.54 16.63L12 12l-7.54 6.63A10 10 0 0 1 12 2z" />
        <path d="M12 12v9" />
      </svg>
    );
  }

  // 4. Dessert -> Cake slice icon
  if (t === 'dessert') {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
        <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
        <path d="M2 21h20" />
        <path d="M12 3v3" />
        <path d="M10 5l4 1" />
      </svg>
    );
  }

  // 5. Brunch -> Cutlery / Dining icon
  if (t === 'brunch') {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
        <path d="M15 2v20" />
        <path d="M6 2v6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2" />
        <path d="M6 14h6" />
      </svg>
    );
  }

  // 6. Dinner -> Serving Cloche / Plate icon
  if (t === 'dinner') {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18h18" />
        <path d="M12 6a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
        <line x1="12" y1="2" x2="12" y2="6" />
      </svg>
    );
  }

  // 7. Default (Coffee) -> Coffee mug icon
  return (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

export default function Stamp({ entry, size = 96, animate = false }) {
  const cafe = entry.cafes || {};
  const cafeId = cafe.id ?? entry.cafe_id ?? 0;
  const ink = INKS[cafeId % INKS.length];
  const hex = cafeId % 2 === 1;
  const tilt = ((cafeId * 37) % 13) - 6;

  const uid = `stamp-${entry.id}`;
  const top = (cafe.name || 'Café').toUpperCase().slice(0, 20);
  const bottom = (cafe.neighborhood || 'Visited').toUpperCase().slice(0, 20);

  return (
    <div
      className={`relative shrink-0 ${animate ? 'stamp-in' : ''}`}
      style={{ width: size, height: size, transform: `rotate(${tilt}deg)`, '--tilt': `${tilt}deg` }}
      role="img"
      aria-label={`Stamp from ${cafe.name || 'café'}`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={ink}>
        <defs>
          <path id={`${uid}-t`} d="M17,50 a33,33 0 1,1 66,0" />
          <path id={`${uid}-b`} d="M9,50 a41,41 0 0,0 82,0" />
        </defs>
        {hex ? (
          <>
            <polygon points={HEX} strokeWidth="3" strokeLinejoin="round" />
            <polygon points={HEX} strokeWidth="1" transform="translate(50 50) scale(0.88) translate(-50 -50)" />
          </>
        ) : (
          <>
            <circle cx="50" cy="50" r="46" strokeWidth="3" />
            <circle cx="50" cy="50" r="42" strokeWidth="1" />
          </>
        )}
        <circle cx="50" cy="50" r="24" strokeWidth="1" strokeDasharray="2 2" />
        <g fill={ink} stroke="none" fontFamily="'Courier Prime', monospace" fontWeight="700" fontSize="8.5" letterSpacing="1">
          <text textAnchor="middle">
            <textPath href={`#${uid}-t`} startOffset="50%">{top}</textPath>
          </text>
          <text textAnchor="middle" fontSize="7">
            <textPath href={`#${uid}-b`} startOffset="50%">{bottom}</textPath>
          </text>
        </g>
      </svg>

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
        style={{ width: size * 0.28, height: size * 0.28, color: ink }}
      >
        {renderTreatSvg(entry.item_type, ink)}
      </div>
    </div>
  );
}