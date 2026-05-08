interface Props {
  size?: number;
}

export function TshirtIcon({ size = 64 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 220">
      <defs>
        <linearGradient id="tFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6E5" />
          <stop offset="100%" stopColor="#EFE5C8" />
        </linearGradient>
      </defs>
      <path d="M22 56 L74 22 Q96 10 120 26 Q144 10 166 22 L218 56 L196 102 L172 90 L172 196 Q172 204 164 204 L76 204 Q68 204 68 196 L68 90 L44 102 Z" fill="url(#tFill)" stroke="#2D3142" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M98 22 Q120 46 142 22" stroke="#2D3142" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M68 128 L172 128" stroke="#A8D8DC" strokeWidth="14" strokeLinecap="round" />
      <path d="M68 150 L172 150" stroke="#A8D8DC" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
