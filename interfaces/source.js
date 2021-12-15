/**
 *  Sink interface which take source object and pipeline telemetry to the sink target
 *  These classes will be used to retrieve telemetry and stream to sink class's object
 *  Currently, there are 3 types of interface which is SocketClient, SocketServer and SerialPort
 *
 * @param { Object } sourceConfigs - Config file for target source, contains name, type, port, ip, pollInterval, successFunction
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const net = require("net");
const SerialPortDriver = require("serialport");
const EventEmitter = require("events");

class SocketClient {
  constructor(sourceConfigs) {
    this.connectionName = sourceConfigs.name;
    this.type = sourceConfigs.type;

    this.ip = sourceConfigs.ip;
    this.port = sourceConfigs.port;
    this.pollInterval = sourceConfigs.pollInterval || 10;
    this.successFunction = sourceConfigs.successFunction;

    this.interface = new EventEmitter();

    this.setupConnections();
  }

  setupConnections() {
    this.connect().catch((reject) => {
      this.printRejectNotice(reject);
      this.handleConnectionError(reject);
    });
  }

  printRejectNotice(reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to reconnect to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  handleConnectionError() {
    setTimeout(() => {
      this.connect().catch((reject) => {
        this.handleConnectionError(reject);
      });
    }, this.pollInterval * 1000);
  }

  connect() {
    if (!this.socket) {
      this.socket = new net.Socket();
    }
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.ip, () => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`
        );
        if (this.successFunction) this.successFunction(this.socket);
        resolve(true);
      });

      this.socket.on("data", (data) => {
        this.interface.emit("received", data);
      });

      this.socket.on("end", () => {
        console.log("Client disconnected");
      });

      this.socket.on("error", (err) => {
        this.socket.removeAllListeners("error");
        this.socket.removeAllListeners("data");
        this.socket.removeAllListeners("end");
        this.socket.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

class SocketServer extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
  }

  printRejectNotice(reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to re-listen to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  connect() {
    if (!this.server) {
      this.server = net.createServer((socket) => {
        console.log("Client Connected");
        socket.on("data", (data) => {
          this.interface.emit("received", data);
        });

        socket.on("end", () => {
          console.log("Client Disconnected");
        });
      });
    }
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(
          `${this.connectionName} ${this.type}: Listening on ${this.ip}:${this.port}`
        );
        resolve(true);
      });

      this.server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log("Address in use, retrying...");
          server.close();
        }
        reject(err.message);
      });
    });
  }
}

class SerialPort extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
  }

  connect() {
    if (!this.serialPort) {
      this.serialPort = new SerialPortDriver(`/dev/${this.port}`, {
        buadRate: 115200,
        autoOpen: false,
        lock: false,
      });
    }
    return new Promise((resolve, reject) => {
      this.serialPort.open(() => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.port}`
        );
        resolve(true);
      });
      this.serialPort.on("data", (data) => {
        this.interface.emit("received", data);
      });
      this.serialPort.on("error", (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.serialPort.removeAllListeners("error");
        this.serialPort.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

module.exports = {
  SocketClient: SocketClient,
  SocketServer: SocketServer,
  SerialPort: SerialPort,
};
