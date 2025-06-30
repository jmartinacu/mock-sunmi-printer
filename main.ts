// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Deno.serve({
    port: 9100,
    hostname: "127.0.0.1",
    onListen: () => {
      console.log("Server is running on http://localhost:9100");
    },
  }, (req) => {
    const url = new URL(req.url);
    const method = req.method;
    const withCORS = (
      body: BodyInit | null,
      status: number,
      extraHeaders: HeadersInit = {},
    ) => {
      return new Response(body, {
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          ...extraHeaders,
        },
      });
    };
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }
    if (url.pathname === "/" && method === "POST") {
      // Decode json from body
      return req.json().then((data) => {
        const base64Receipt = data.image;
        // Save base64 string to a .txt file
        const fileName = `receipt-${Date.now()}.txt`;
        Deno.writeTextFileSync(fileName, base64Receipt);
      const body = JSON.stringify({ result: true });
      console.log("File received: " + body)
      return withCORS(body, 200, { "Content-Type": "application/json" });
      }).catch(() => {
        const body = JSON.stringify({ result: false });
        return withCORS(body, 200, { "Content-Type": "application/json" });
      });
    } else if (url.pathname === "/device-info" && method === "GET") {
      const body = JSON.stringify({ pixel_width: 384 });
      console.log("Info returned: " + body)
      return withCORS(body, 200, { "Content-Type": "application/json" });
    } else {
      return withCORS("Not Found", 404);
    }
  });
}
