import { INKS, ITEM_ICONS } from '../constants';

const HEX = '50,3 90.7,26.5 90.7,73.5 50,97 9.3,73.5 9.3,26.5';

// A circular or hexagonal café stamp: name curved on top, neighborhood below,
// item icon in the centre. Shape, ink and tilt are derived from the café id.
export default function Stamp({ entry, size = 96, animate = false }) {
  const cafe = entry.cafes || {};
  const cafeId = cafe.id ?? entry.cafe_id ?? 0;
  const ink = INKS[cafeId % INKS.length];
  const hex = cafeId % 2 === 1;
  const tilt = ((cafeId * 37) % 13) - 6;
  const Icon = ITEM_ICONS[entry.item_type] || ITEM_ICONS.Coffee;
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
      <Icon
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ color: ink, width: size * 0.26, height: size * 0.26 }}
        strokeWidth={1.8}
      />
    </div>
  );
}