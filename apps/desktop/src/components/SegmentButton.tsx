import type { ReactNode } from 'react';

export function SegmentButton<T extends string>({ value, active, onClick, children }: { value: T; active: T; onClick: (value: T) => void; children: ReactNode }) {
  return (
    <button className={value === active ? 'seg active' : 'seg'} onClick={() => onClick(value)}>
      {children}
    </button>
  );
}
