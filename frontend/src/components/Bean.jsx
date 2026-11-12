// Coffee-bean rating glyphs (1 to 5 beans)
export function Bean({ filled, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <ellipse
        cx="12" cy="12" rx="6.5" ry="10" transform="rotate(35 12 12)"
        fill={filled ? '#5d4037' : 'none'}
        stroke="#5d4037" strokeWidth="1.5"
      />
      <path
        d="M8.6 4.8c3.6 2.6 3 6.2 1.4 8.4-1.4 2-1.4 4.2 1.6 6.4"
        transform="rotate(35 12 12) translate(0 0)"
        fill="none" strokeWidth="1.4" strokeLinecap="round"
        stroke={filled ? '#f4ebe1' : '#5d4037'}
        opacity={filled ? 0.9 : 0.5}
      />
    </svg>
  );
}

export function BeanRating({ value, onChange, size = 18 }) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} of 5 beans`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} bean${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)}
            className="rounded p-0.5 transition-transform hover:scale-110"
          >
            <Bean filled={n <= value} size={size} />
          </button>
        ) : (
          <Bean key={n} filled={n <= value} size={size} />
        ),
      )}
    </div>
  );
}
