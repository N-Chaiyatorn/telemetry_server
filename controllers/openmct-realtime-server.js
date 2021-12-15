/**
 * Websocket Server responses with realtime data
 * Primarily used for OpenMCT connection
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const express = require("express");

function openmctRealtimeServer(SinkObject) {
  const router = express.Router();

  router.ws("/", function (ws) {
    const unlisten = SinkObject.listen(notifySubscribers);
    const subscribed = {}; // Active subscriptions for this connection
    const handlers = {
      subscribe: function (id) {
        subscribed[id] = true;
      },
      unsubscribe: function (id) {
        delete subscribed[id];
      },
    };
    function notifySubscribers(point) {
      if (subscribed[point.id]) {
        ws.send(JSON.stringify(point));
      }
    }

    // Listen for requests
    ws.on("message", function (message) {
      const parts = message.split(" ");
      const handler = handlers[parts[0]];
      if (handler) {
        handler.apply(handlers, parts.slice(1));
      }
    });

    // Stop sending telemetry updates for this connection when closed
    ws.on("close", unlisten);
  });

  return router;
}

module.exports = openmctRealtimeServer;
