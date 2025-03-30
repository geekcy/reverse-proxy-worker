/**
 * Cloudflare Worker Reverse Proxy
 * 
 * 这是一个使用Cloudflare Workers实现的反向代理程序。
 * 它可以将请求转发到目标服务器，并将响应返回给客户端。
 */

const DEFAULT_TARGET = "https://example.com";

const ROUTE_RULES = [
];

/**
 * 处理请求的主函数
 */
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      let targetUrl = env.TARGET_URL || DEFAULT_TARGET;
      
      for (const rule of ROUTE_RULES) {
        if (path.startsWith(rule.path)) {
          targetUrl = rule.target;
          break;
        }
      }
      
      const targetUrlObj = new URL(url.pathname + url.search, targetUrl);
      
      const requestHeaders = new Headers(request.headers);
      
      requestHeaders.set('Host', new URL(targetUrl).host);
      
      const clientIP = request.headers.get('CF-Connecting-IP');
      if (clientIP) {
        requestHeaders.set('X-Forwarded-For', clientIP);
      }
      requestHeaders.set('X-Forwarded-Proto', url.protocol.slice(0, -1));
      requestHeaders.set('X-Forwarded-Host', url.host);
      
      const newRequest = new Request(targetUrlObj.toString(), {
        method: request.method,
        headers: requestHeaders,
        body: request.body,
        redirect: 'manual'
      });
      
      const response = await fetch(newRequest);
      
      const responseHeaders = new Headers(response.headers);
      
      
      responseHeaders.set('X-Proxied-By', 'Cloudflare-Workers-Reverse-Proxy');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      return new Response(`代理错误: ${error.message}`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8'
        }
      });
    }
  }
};
