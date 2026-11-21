import { setTimeout as sleep } from 'node:timers/promises';

const origin = process.env.PREVIEW_ORIGIN ?? 'http://127.0.0.1:4173';
const cases = [
  { path: '/', title: '本周速览' },
  { path: '/monthly', title: '月度简报' },
  { path: '/topics', title: '专题查询' },
  { path: '/reports', title: '事件专报' },
];
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const response = await fetch(origin, { signal: AbortSignal.timeout(2500) });
    if (response.status === 200) break;
  } catch { /* Worker preview is starting. */ }
  if (attempt === 29) throw new Error('Worker preview did not start');
  await sleep(800);
}
let homepage = '';
for (const { path, title } of cases) {
  const started = Date.now();
  const res = await fetch(origin + path, { signal: AbortSignal.timeout(15000) });
  const html = await res.text();
  const elapsed = Date.now() - started;
  console.log(path, res.status, `${elapsed}ms`, 'body size', html.length);
  if (res.status !== 200) throw Error(`${path}: expected 200, got ${res.status}, body: ${html.slice(0,500)}`);
  if (!new RegExp(`<h1[^>]*>\\s*${title}\\s*</h1>`).test(html)) {
    console.log(html.slice(0,1500));
    throw Error(`${path}: missing expected page heading ${title} (SSR route mismatch)`);
  }
  if (path === '/') homepage = html;
}
const stylesheets = [...homepage.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
const scripts = [...homepage.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);
console.log('Assets:', stylesheets, scripts);
if (!scripts.length) throw Error('No client JS scripts found: navigation cannot hydrate');
if (!stylesheets.length) throw Error('No CSS stylesheet found');
for (const asset of [...stylesheets,...scripts]) {
  const res=await fetch(new URL(asset, origin), {signal:AbortSignal.timeout(10000)});
  console.log('Asset',asset,res.status,res.headers.get('content-type'));
  if(!res.ok) throw Error('Asset did not load: '+asset);
}
console.log('SSR routes and assets passed');
