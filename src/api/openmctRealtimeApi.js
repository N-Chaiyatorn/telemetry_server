/**
 * Websocket Server responses with realtime data
 * Primarily used for OpenMCT connection
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const express = require("express");

function openmctRealtimeServer(extractor, deserializer, databaseDriver) {
  const router = express.Router();
  
  this.extractor = extractor;
  this.deserializer = deserializer || null;
  this.databaseDriver = databaseDriver || null;
  this.listeners = [];
  this.dataArray = [];

  this.notify = (point) => {
    this.listeners.forEach(function (l) {
      l(point);
    });
  };

  this.listen = (listener) => {
    this.listeners.push(listener);
    return function () {
      this.listeners = this.listeners.filter(function (l) {
        return l !== listener;
      });
    }.bind(this);
  };

  router.ws("/", function (ws) {
    this.extractor.interface.on("received", (data) => {
      if (this.deserializer) {
        const jsonDataArray = this.deserializer(data);
        jsonDataArray.forEach((data) => {
          this.dataArray.push(data);
        });
      } else {
        this.dataArray.push(data);
      }

      for (let i = this.dataArray.length - 1; i >= 0; i--) {
        const data = this.dataArray[i];
        if (this.databaseDriver) this.databaseDriver.write(data);
        this.notify(data);
        this.dataArray.pop();
      }
    });

    const unlisten = this.listen(notifySubscribers);
    const subscribed = {};
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
