const BACKEND_BASE = "http://112.124.10.28";

exports.handler = async (event) => {
  const basePath = "/.netlify/functions/proxy";
  const path = event.path.startsWith(basePath)
    ? event.path.slice(basePath.length)
    : event.path;

  const query = event.rawQuery ? `?${event.rawQuery}` : "";
  const url = `${BACKEND_BASE}${path}${query}`;

  const method = event.httpMethod || "GET";

  const headers = { ...event.headers };
  delete headers.host;

  const body =
    method === "GET" || method === "HEAD" ? undefined : event.body || undefined;

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  const text = await response.text();

  return {
    statusCode: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
    },
    body: text,
  };
};
