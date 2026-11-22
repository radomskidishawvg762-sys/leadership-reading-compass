/**
 * Cloudflare Pages → existing Worker bridge.
 *
 * Pages serves hashed JS/CSS and /market/* photos itself (_routes.json
 * excludes those paths). Everything else, including HTML, SSR routes,
 * and same-origin AI APIs, is forwarded over a Cloudflare Service Binding.
 * No public workers.dev URL or AI credentials are required in Pages.
 *
 * Cloudflare dashboard → Pages project → Settings → Bindings:
 *   Service binding variable: APP_WORKER
 *   Worker: leadership-reading-compass
 */
export async function onRequest(context) {
  const worker = context.env?.APP_WORKER;
  if (!worker || typeof worker.fetch !== 'function') {
    return new Response(
      'Pages 桥接未配置：请在 Pages 项目绑定 APP_WORKER → leadership-reading-compass，然后重新部署。',
      {
        status: 503,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
          'x-pages-bridge': 'missing-service-binding',
        },
      },
    );
  }
  // Preserve original Pages hostname, path, query, HTTP method, headers and
  // request body. The downstream Worker sees its own bound environment,
  // including original AI secrets and rate limiters.
  return worker.fetch(context.request);
}
