"use client";

export function PrintButton({ label = "Print roster" }: { label?: string }) {
  return (
    <button type="button" className="btn ghost sm" onClick={() => window.print()}>
      {label}
    </button>
  );
}
