"use client";

// `expand` is a CSS selector for <details> elements to open before printing, since closed ones don't print.
export function PrintButton({ label = "Print roster", expand }: { label?: string; expand?: string }) {
  return (
    <button
      type="button"
      className="btn ghost sm"
      onClick={() => {
        if (expand) document.querySelectorAll<HTMLDetailsElement>(expand).forEach((d) => (d.open = true));
        window.print();
      }}
    >
      {label}
    </button>
  );
}
