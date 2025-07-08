if (import.meta.main) {
  const port = 9100;
  const hostname = "127.0.0.1";

  Deno.serve({ port, hostname, onListen: () => {
    console.log(`WebSocket Server is running on ws://${hostname}:${port}`);
  }}, (req) => {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "print" && message?.data?.image) {
          const fileName = `receipt-${Date.now()}.txt`;
          const imageData = message.data.image;
          await Deno.writeTextFile(fileName, imageData);
          console.log(`File saved: ${fileName}`);
          socket.send(JSON.stringify({ result: true }));
        } else if (message.event === "info") {
          const body = { pixel_width: 384 };
          console.log("Device info sent");
          socket.send(JSON.stringify(body));
        } else {
          socket.send(JSON.stringify({ error: "Unknown command" }));
        }
      } catch {
        socket.send(JSON.stringify({ error: "Invalid JSON" }));
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return response;
  });
}