/**
 * Socket interface for realtime telemetry socket endpoint
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const express = require("express");

function generalRealtimeServer(sourceObject, transformer) {
  const router = express.Router();

  this.transformer = transformer || null;

  router.ws("/", (ws) => {
    sourceObject.interface.on("received", (data) => {
      if (ws.readyState === 1) {
        if (this.transformer) {
          const jsonDataArray = this.transformer(data);
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
      sourceObject.interface.removeAllListeners("received");
    });
  });

  return router;
}

module.exports = generalRealtimeServer;
