import { test, expect } from "bun:test";
import { GET, getVersion, KNOWN_VERSION_ENV_VARS } from "./route";

test("getVersion returns SOURCE_COMMIT when set", () => {
  expect(getVersion({ SOURCE_COMMIT: "abc123" })).toBe("abc123");
});

test("getVersion prefers first matching env var", () => {
  expect(
    getVersion({ SOURCE_COMMIT: "first", VERCEL_GIT_COMMIT_SHA: "second" }),
  ).toBe("first");
});

test("getVersion returns dev in development", () => {
  expect(getVersion({ NODE_ENV: "development" })).toBe("dev");
});

test("GET returns plain text version", async () => {
  const res = await GET();
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("text/plain");
  expect((await res.text()).length).toBeGreaterThan(0);
});

test("KNOWN_VERSION_ENV_VARS includes SOURCE_COMMIT", () => {
  expect(KNOWN_VERSION_ENV_VARS).toContain("SOURCE_COMMIT");
});
