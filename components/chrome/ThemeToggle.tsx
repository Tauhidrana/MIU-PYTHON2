"use client";
export function ThemeToggle() {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label="দিন/রাতের রং বদলাও"
      title="দিন/রাতের রং"
      onClick={() => {
        const dark = document.documentElement.dataset.theme !== "dark";
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* private mode */ }
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
      </svg>
    </button>
  );
}
