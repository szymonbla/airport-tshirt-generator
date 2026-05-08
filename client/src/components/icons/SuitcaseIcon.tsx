interface Props {
  size?: number;
  wobble?: boolean;
}

export function SuitcaseIcon({ size = 64, wobble = false }: Props) {
  return (
    <>
      {wobble && (
        <style>{`
          @keyframes wobble {
            0%, 100% { transform: rotate(-1.5deg); }
            50% { transform: rotate(1.5deg); }
          }
          .suitcase-wobble {
            animation: wobble 4s ease-in-out infinite;
            transform-origin: 50% 60%;
          }
        `}</style>
      )}
      <svg
        className={wobble ? "suitcase-wobble" : ""}
        width={size}
        height={(size * 220) / 240}
        viewBox="0 0 240 220"
      >
        <defs>
          <linearGradient id="suitFillX" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4B393" />
            <stop offset="100%" stopColor="#E08A6A" />
          </linearGradient>
        </defs>
        <path d="M96 36 Q96 18 120 18 Q144 18 144 36 L144 50" fill="none" stroke="#2D3142" strokeWidth="5" strokeLinecap="round" />
        <rect x="34" y="50" width="172" height="138" rx="14" fill="url(#suitFillX)" stroke="#2D3142" strokeWidth="5" strokeLinejoin="round" />
        <path d="M44 60 L196 60" stroke="#FFF6E5" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M34 116 L206 116" stroke="#2D3142" strokeWidth="3" />
        <g fill="#FFF6E5" stroke="#2D3142" strokeWidth="3" strokeLinejoin="round">
          <rect x="76" y="108" width="28" height="16" rx="3" />
          <rect x="136" y="108" width="28" height="16" rx="3" />
        </g>
      </svg>
    </>
  );
}
