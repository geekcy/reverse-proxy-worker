# Cloudflare Workers 反向代理

这是一个使用Cloudflare Workers实现的高级反向代理程序。

## 功能特点

- 将请求转发到目标服务器
- 保留原始请求的方法、头信息和正文
- 将目标服务器的响应返回给客户端
- 支持通过环境变量配置目标URL
- 支持路由规则，将不同路径映射到不同目标
- 添加标准代理头信息（X-Forwarded-For, X-Forwarded-Proto等）
- 错误处理和友好的错误页面

## 配置说明

### 基本配置

在`wrangler.toml`文件中，你可以设置目标URL：

```toml
[vars]
TARGET_URL = "https://example.com"
```

或者在部署时通过Cloudflare Dashboard设置环境变量。

### 路由规则配置

你可以在`src/index.js`文件中修改`ROUTE_RULES`数组来配置路由规则：

```javascript
const ROUTE_RULES = [
  { path: '/api', target: 'https://api.example.com' },
  { path: '/blog', target: 'https://blog.example.com' },
];
```

这样，当请求路径以`/api`开头时，请求会被转发到`https://api.example.com`，以此类推。

## 开发指南

### 前提条件

- 安装Node.js（推荐v16或更高版本）
- 注册Cloudflare账户

### 本地开发

1. 安装依赖：
   ```
   npm install
   ```

2. 登录到Cloudflare账户：
   ```
   npx wrangler login
   ```

3. 本地运行：
   ```
   npm run dev
   ```
   
   这将启动一个本地开发服务器，你可以在浏览器中访问`http://localhost:8787`来测试你的反向代理。

### 部署到Cloudflare

要部署到Cloudflare Workers，请运行：

```
npm run deploy
```

部署成功后，你将获得一个`*.workers.dev`域名，可以通过该域名访问你的反向代理。

## 高级自定义

你可以根据需要修改`src/index.js`文件来添加更多功能，例如：

### 缓存控制

```javascript
// 在fetch函数中添加
const cacheKey = new Request(request.url, {
  method: 'GET',
  headers: request.headers
});

// 检查缓存
const cachedResponse = await caches.default.match(cacheKey);
if (cachedResponse) {
  return cachedResponse;
}

// 缓存响应
ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
```

### 身份验证

```javascript
// 在fetch函数开始处添加
const authHeader = request.headers.get('Authorization');
if (!authHeader || !isValidAuth(authHeader)) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 请求/响应修改

```javascript
// 修改请求
requestHeaders.set('X-Custom-Header', 'CustomValue');

// 修改响应
const originalBody = await response.text();
const modifiedBody = originalBody.replace('old-text', 'new-text');
return new Response(modifiedBody, {
  status: response.status,
  headers: responseHeaders
});
```

## 故障排除

- 如果遇到CORS问题，请确保在响应头中添加适当的CORS头。
- 如果目标服务器返回重定向，你可能需要修改`redirect`参数或手动处理重定向。
- 对于大型响应，考虑使用流式处理以提高性能。

## 贡献

欢迎提交问题和改进建议！
