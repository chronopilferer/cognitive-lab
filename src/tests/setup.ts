import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom has no viewport scrolling; verify actual positioning in browser QA.
Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
