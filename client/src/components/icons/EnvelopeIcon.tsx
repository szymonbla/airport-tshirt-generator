interface Props {
  size?: number;
}

export function EnvelopeIcon({ size = 56 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 220 220">
      <defs>
        <linearGradient id="envF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6E5" />
          <stop offset="100%" stopColor="#EFE5C8" />
        </linearGradient>
      </defs>
      <rect x="30" y="60" width="160" height="110" rx="10" fill="url(#envF)" stroke="#2D3142" strokeWidth="4.5" />
      <path d="M30 70 L110 130 L190 70" fill="none" stroke="#2D3142" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M30 170 L88 124 M190 170 L132 124" stroke="#2D3142" strokeWidth="4.5" fill="none" />
      <path d="M150 36 q-10 -14 -22 -2 q-12 -12 -22 2 q0 18 22 32 q22 -14 22 -32 z" fill="#F4B393" stroke="#2D3142" strokeWidth="3.5" />
    </svg>
  );
}
