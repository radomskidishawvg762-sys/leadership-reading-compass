import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { onRequest } from "../functions/_middleware.js";

test("no binding: visible diagnostic, never silently redirects to workers.dev", async () => {
  const response = await onRequest({
    request: new Request("https://demo.pages.dev/"),
    env: {},
  });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("x-pages-bridge"), "missing-service-binding");
  assert.match(await response.text(), /APP_WORKER/);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("SSR request: preserve Pages hostname, path, query and same-origin content", async () => {
  let requestSeen;
  const request = new Request("https://demo.pages.dev/events/EV-PUBLIC-005?edition=latest");
  const response = await onRequest({
    request,
    env: {
      APP_WORKER: {
        fetch(req) {
          requestSeen = req;
          return new Response("<!doctype html><html>SSR OK</html>", {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        },
      },
    },
  });
  assert.equal(requestSeen, request);
  assert.equal(new URL(requestSeen.url).hostname, "demo.pages.dev");
  assert.equal(new URL(requestSeen.url).pathname, "/events/EV-PUBLIC-005");
  assert.equal(new URL(requestSeen.url).search, "?edition=latest");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /SSR OK/);
});

test("AI POST: forward method, body and headers without forwarding secrets from Pages", async () => {
  let seen;
  const payload = JSON.stringify({ question: "对合同有什么影响？" });
  const request = new Request("https://demo.pages.dev/api/topic-chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
  });
  const response = await onRequest({
    request,
    env: {
      APP_WORKER: {
        async fetch(req) {
          seen = {
            url: req.url,
            method: req.method,
            headers: req.headers.get("content-type"),
            body: await req.text(),
          };
          return Response.json({ answer: "成功", sourceIds: [], eventIds: [] });
        },
      },
    },
  });
  assert.deepEqual(seen, {
    url: "https://demo.pages.dev/api/topic-chat",
    method: "POST",
    headers: "application/json",
    body: payload,
  });
  assert.equal((await response.json()).answer, "成功");
});

test("both GET and POST use a private service binding, not a public upstream URL", async () => {
  const contents = readFileSync("functions/_middleware.js", "utf8");
  assert.doesNotMatch(contents, /https:\/\/[^\s"']+\.workers\.dev/);
  assert.match(contents, /worker\.fetch\(context\.request\)/);
});

test("Pages build excludes static assets from function invocation", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync: read, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const temp = mkdtempSync(join(tmpdir(), "pages-bridge-"));
  try {
    mkdirSync(join(temp, "dist/client/assets"), { recursive: true });
    mkdirSync(join(temp, "dist/client/market"), { recursive: true });
    writeFileSync(join(temp, "dist/client/assets/client.js"), "/* built */");
    writeFileSync(join(temp, "dist/client/market/report-market-v27.webp"), "webp-test");
    const result = spawnSync("node", [new URL("./prepare-pages-bridge.mjs", import.meta.url).pathname], { cwd: temp });
    assert.equal(result.status, 0, result.stderr.toString());
    const routes = JSON.parse(read(join(temp, "dist/client/_routes.json"), "utf8"));
    assert.deepEqual(routes.include, ["/*"]);
    assert.ok(routes.exclude.includes("/assets/*"));
    assert.ok(routes.exclude.includes("/market/*"));
    assert.equal(routes.version, 1);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
