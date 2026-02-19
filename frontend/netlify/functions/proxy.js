const API_BASE = "http://112.124.10.28/api";
const RAW_BASE = "http://112.124.10.28";

export default async (request, context) => {
  const url = new URL(request.url);

  const basePath = "/.netlify/functions/proxy";
  const path = url.pathname.startsWith(basePath)
    ? url.pathname.slice(basePath.length)
    : url.pathname;

  const query = url.search || "";

  const targetBase = path.startsWith("/uploads") ? RAW_BASE : API_BASE;
  const targetUrl = `${targetBase}${path}${query}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("Host");
  headers.delete("content-length");
  headers.delete("Content-Length");

  const method = request.method || "GET";
  const hasBody = !(method === "GET" || method === "HEAD");
  const init = {
    method,
    headers,
    body: hasBody ? request.body : undefined,
    ...(hasBody ? { duplex: "half" } : {}),
  };

  const response = await fetch(targetUrl, init);
  return response;
};
