import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import * as http from 'node:http';
import * as https from 'node:https';

const PROXY_PREFIXES = ['/auth', '/students', '/credentials'];
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);
const PROXY_TIMEOUT_MS = 30_000;

export function shouldProxyPath(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }

  return PROXY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function buildTargetUrl(apiBaseUrl: string, originalUrl: string): URL {
  const baseUrl = new URL(apiBaseUrl);
  const incomingUrl = new URL(originalUrl, 'http://watcher.local');
  const basePath = normalizeBasePath(baseUrl.pathname);
  const incomingPath = incomingUrl.pathname === '/' ? '/' : incomingUrl.pathname;
  const pathname = basePath === '/'
    ? incomingPath
    : incomingPath === '/'
      ? basePath
      : `${basePath}${incomingPath}`;

  return new URL(`${pathname}${incomingUrl.search}`, baseUrl.origin);
}

export function createApiProxyMiddleware(apiBaseUrl: string) {
  const logger = new Logger('ApiProxyMiddleware');

  return (req: Request, res: Response, next: NextFunction) => {
    if (!shouldProxyPath(req.path)) {
      next();
      return;
    }

    const targetUrl = buildTargetUrl(apiBaseUrl, req.originalUrl || req.url);
    logger.warn(`Proxying ${req.method} ${req.originalUrl} -> ${targetUrl.toString()}`);

    const requestOptions: http.RequestOptions = {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      method: req.method,
      path: `${targetUrl.pathname}${targetUrl.search}`,
      headers: createProxyRequestHeaders(req),
    };

    const requestImpl = targetUrl.protocol === 'https:' ? https.request : http.request;
    const proxyRequest = requestImpl(requestOptions, (proxyResponse) => {
      res.status(proxyResponse.statusCode || 502);

      for (const [headerName, headerValue] of Object.entries(proxyResponse.headers)) {
        if (!headerValue || HOP_BY_HOP_HEADERS.has(headerName.toLowerCase())) {
          continue;
        }
        res.setHeader(headerName, headerValue);
      }

      res.setHeader('X-Watcher-Deprecated', 'true');
      proxyResponse.pipe(res);
    });

    proxyRequest.setTimeout(PROXY_TIMEOUT_MS, () => {
      proxyRequest.destroy(new Error('Upstream timeout'));
    });

    proxyRequest.on('error', (error: NodeJS.ErrnoException) => {
      logger.error(`Proxy error for ${req.method} ${req.originalUrl}: ${error.message}`);

      if (res.headersSent) {
        res.destroy(error);
        return;
      }

      const statusCode = isTimeoutError(error) ? 504 : 502;
      res.status(statusCode).json({
        message: statusCode === 504
          ? 'Watcher proxy timed out while reaching the API service'
          : 'Watcher proxy could not reach the API service',
        upstream: apiBaseUrl,
        path: req.originalUrl || req.url,
      });
    });

    req.on('aborted', () => {
      proxyRequest.destroy();
    });

    if (hasRequestBody(req.method)) {
      req.pipe(proxyRequest);
      return;
    }

    proxyRequest.end();
  };
}

function createProxyRequestHeaders(req: Request): http.OutgoingHttpHeaders {
  const headers: http.OutgoingHttpHeaders = { ...req.headers };
  const forwardedFor = [req.headers['x-forwarded-for'], req.socket.remoteAddress]
    .flat()
    .filter(Boolean)
    .join(', ');

  delete headers.host;
  delete headers.connection;
  delete headers['content-length'];

  if (req.headers['content-length']) {
    headers['content-length'] = req.headers['content-length'];
  }

  headers['x-forwarded-for'] = forwardedFor;
  headers['x-forwarded-host'] = req.headers.host || '';
  headers['x-forwarded-proto'] = req.protocol;
  headers['x-watcher-proxy'] = 'true';

  return headers;
}

function hasRequestBody(method: string): boolean {
  return !['GET', 'HEAD'].includes(method.toUpperCase());
}

function isTimeoutError(error: NodeJS.ErrnoException): boolean {
  return error.code === 'ETIMEDOUT' || error.message.toLowerCase().includes('timeout');
}

function normalizeBasePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}
