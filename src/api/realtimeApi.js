/**
 * Socket interface for realtime telemetry socket endpoint
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const express = require("express");

function generalRealtimeServer(extractor, extractor) {
  const router = express.Router();

  this.extractor = extractor || null;

  router.ws("/", (ws) => {
    extractor.interface.on("received", (data) => {
      if (ws.readyState === 1) {
        if (this.extractor) {
          const jsonDataArray = this.extractor(data);
          jsonDataArray.forEach((data) => {
            ws.send(JSON.stringify(data));
          });
        } else {
          ws.send(JSON.stringify(data));
        }
      }
    });
    
    console.log("Client connected to websocket server for web app");

    // Listen for the commands
    ws.on("message", () => {
      console.log("command received");
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      extractor.interface.removeAllListeners("received");
    });
  });

  return router;
}

module.exports = generalRealtimeServer;
