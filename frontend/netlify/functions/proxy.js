const API_BASE = "http://112.124.10.28/api";
const RAW_BASE = "http://112.124.10.28";

exports.handler = async (event) => {
  const basePath = "/.netlify/functions/proxy";
  const path = event.path.startsWith(basePath)
    ? event.path.slice(basePath.length)
    : event.path;

  const query = event.rawQuery ? `?${event.rawQuery}` : "";

  const targetBase = path.startsWith("/uploads") ? RAW_BASE : API_BASE;
  const url = `${targetBase}${path}${query}`;

  const method = event.httpMethod || "GET";

  const headers = { ...event.headers };
  delete headers.host;
  delete headers["content-length"];
  delete headers["Content-Length"];

  let body;
  if (method === "GET" || method === "HEAD") {
    body = undefined;
  } else if (event.isBase64Encoded) {
    body = Buffer.from(event.body || "", "base64");
  } else {
    body = event.body || undefined;
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
  });
  
  const contentType = response.headers.get("content-type") || "";
  const isBinary =
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType === "application/octet-stream";

  if (isBinary) {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": contentType,
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true,
    };
  } else {
    const text = await response.text();
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": contentType || "application/json",
      },
      body: text,
    };
  }
};
