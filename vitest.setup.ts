import "@testing-library/jest-dom/vitest";

// jsdom lacks these observer APIs that Floating UI's autoUpdate relies on.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??=
  NoopObserver as unknown as typeof IntersectionObserver;
