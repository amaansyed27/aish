export function SegmentButton<T extends string>({ value, active, onClick, children }: { value: T; active: T; onClick: (value: T) => void; children: React.ReactNode }) {
  return (
    <button className={value === active ? 'seg active' : 'seg'} onClick={() => onClick(value)}>
      {children}
    </button>
  );
}
