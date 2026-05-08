interface Props {
  small?: boolean;
}

export function Wordmark({ small = false }: Props) {
  const headingSize = small ? 28 : 36;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: headingSize,
          color: "var(--color-ink)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        szmatex
      </span>
      <span
        style={{
          fontFamily: "var(--font-hand)",
          fontWeight: 700,
          fontSize: small ? 16 : 20,
          color: "var(--color-peach-700)",
          transform: "rotate(-3deg)",
          display: "inline-block",
          lineHeight: 1,
        }}
      >
        szmata dla Ciebie :)
      </span>
    </div>
  );
}
