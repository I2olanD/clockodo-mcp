import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TtlCache } from "./cache.js";

describe("TtlCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined for missing keys", () => {
    const cache = new TtlCache();
    expect(cache.get("nonexistent")).toBeUndefined();
  });

  it("returns cached value within TTL", () => {
    const cache = new TtlCache(1000);
    cache.set("key", { name: "test" });
    expect(cache.get("key")).toEqual({ name: "test" });
  });

  it("returns undefined after TTL expires", () => {
    const cache = new TtlCache(50);
    cache.set("key", "value");
    vi.advanceTimersByTime(51);
    expect(cache.get("key")).toBeUndefined();
  });

  it("overwrites existing entries on set", () => {
    const cache = new TtlCache(1000);
    cache.set("key", "original");
    cache.set("key", "updated");
    expect(cache.get("key")).toBe("updated");
  });

  it("removes all entries on clear", () => {
    const cache = new TtlCache(1000);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });
});
