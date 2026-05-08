interface Props {
  small?: boolean;
}

export function Wordmark({ small = false }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`font-heading font-extrabold text-ink leading-none tracking-[-0.02em] ${small ? 'text-[28px]' : 'text-[36px]'}`}
      >
        szmatex
      </span>
      <span
        className={`font-hand font-bold text-peach-700 -rotate-3 inline-block leading-none ${small ? 'text-[16px]' : 'text-[20px]'}`}
      >
        szmata dla Ciebie :)
      </span>
    </div>
  );
}
