import { aiMessages, evidenceForAi, fixedAnswer, getAllowedEvent, parseChatRequest } from './hybrid-ai';

type RateLimiter = { limit(args: {key: string}): Promise<{success: boolean}> };
type AiEnv = {
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
  AI_RATE_LIMITER?: RateLimiter;
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export function completionUrl(base: string): URL {
  const url = new URL(base);
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.search || url.hash) {
    throw new Error('Invalid AI_BASE_URL');
  }
  if (!url.pathname.endsWith('/chat/completions')) {
    url.pathname = url.pathname.replace(/\/$/, '') + '/chat/completions';
  }
  return url;
}

/** Handled by the existing src/server.ts entrypoint: works without browser secrets. */
export async function handleAiChatRequest(request: Request, bindings: unknown): Promise<Response> {
  if (request.method !== 'POST') return json({ error: '仅支持 POST 请求。' }, 405);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: '跨站请求被拒绝。' }, 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: '请求必须是 JSON。' }, 415);
  }
  if (Number(request.headers.get('Content-Length') ?? 0) > 16000) return json({ error: '请求体过长。' }, 413);
  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return json({ error: '请求体过长。' }, 413);
    payload = JSON.parse(raw);
  } catch {
    return json({ error: '请求数据无效。' }, 400);
  }
  const input = parseChatRequest(payload);
  if (!input) return json({ error: '问题、事件或历史消息格式不正确。' }, 400);
  const event = getAllowedEvent(input);
  if (!event) return json({ error: '当前报告期没有可用于回答的事件材料。' }, 404);

  // Defense in depth: direct API callers cannot override a reviewed fixed reply.
  const fixed = fixedAnswer(event, input.question);
  if (fixed) return json(fixed);

  const evidence = evidenceForAi(event, input);
  if (!evidence.length) return json({ error: '当前材料缺少可供 AI 引用的外部证据。' }, 422);
  const env = (bindings ?? {}) as AiEnv;
  if (!env.AI_API_KEY || !env.AI_BASE_URL || !env.AI_MODEL) {
    return json({ error: 'AI 服务尚未配置，固定问答仍可正常使用。' }, 503);
  }
  let endpoint: URL;
  try { endpoint = completionUrl(env.AI_BASE_URL); }
  catch { return json({ error: 'AI 服务接口地址配置有误。' }, 503); }

  // Approximate Cloudflare rate limits; do not count deterministic answers.
  // Cloudflare Access / provider budget limits are still recommended for public URLs.
  if (!env.AI_RATE_LIMITER) return json({ error: 'AI 访问限流尚未配置。' }, 503);
  {
    try {
      const key = request.headers.get('CF-Connecting-IP') ?? 'anonymous';
      const outcome = await env.AI_RATE_LIMITER.limit({key: `ai-fallback:${key}`});
      if (!outcome.success) return json({ error: 'AI 提问过于频繁，请稍后再试。' }, 429);
    } catch {
      return json({ error: 'AI 服务保护措施暂不可用。' }, 503);
    }
  }

  try {
    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        messages: aiMessages(input, event, evidence),
        temperature: 0.2,
        max_tokens: 1150,
        stream: false,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return json({ error: response.status === 429 ? '模型服务请求过于频繁。' : '模型服务暂不可用，请稍后重试。' }, 502);
    const output: unknown = await response.json();
    const choices = (output as {choices?:Array<{message?:{content?:unknown}}>})?.choices;
    const content = choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) return json({ error: '模型没有返回有效回答。' }, 502);
    const citationNumbers = [...content.matchAll(/\[S(\d+)\]/g)]
      .map(match => Number(match[1]) - 1)
      .filter(number => Number.isInteger(number) && number >= 0 && number < evidence.length);
    const sourceIds = [...new Set(citationNumbers)].map(index => evidence[index]!.id);
    return json({ mode: 'ai', answer: content.trim().slice(0, 3400), sourceIds });
  } catch {
    // Never surface provider errors that may contain tokens or internal details.
    return json({ error: 'AI 请求失败或超时，固定问答仍可使用。' }, 502);
  }
}
