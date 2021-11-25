const net = require('net')
const serialport = require('serialport');
const EventEmitter = require('events');

class SocketServerSource {
  constructor (sourceConfigs) {
    this.connectionName = sourceConfigs.name
    this.type = sourceConfigs.type

    this.socket = new net.Socket()
    this.ip = sourceConfigs.ip
    this.port = sourceConfigs.port
    this.pollInterval = sourceConfigs.pollInterval
    this.successFunction = sourceConfigs.successFunction

    this.setupConnections()
  }

  getSocket () {
    return this.socket
  }

  setupConnections () {
    this.connectSocket().catch((reject) => {
      this.printRejectNotice(reject)
      this.handleConnectionError(reject)
    })
  }

  printRejectNotice (reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`)
    console.log(`${this.connectionName}: Attempting to reconnect ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`)
  }

  handleConnectionError () {
    setTimeout(() => {
      this.connectSocket().catch((reject) => {
        this.handleConnectionError(reject)
      })
    }, this.pollInterval * 1000)
  }

  connectSocket () {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.ip, () => {
        console.log(`Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`)
        if (this.successFunction) this.successFunction()
        resolve(true)
      })
      this.socket.on('error', (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.socket.removeAllListeners('error')
        this.socket.removeAllListeners('connect')
        reject(err.message)
      })
    })
  }
}

class serialPortSource {
  constructor (sourceConfigs) {
    this.connectionName = sourceConfigs.name
    this.type = sourceConfigs.type
    this.pollInterval = sourceConfigs.pollInterval
    this.port = sourceConfigs.port

    this.serialPort = new serialport(`/dev/${this.port}`, {
        buadRate: 115200,
        autoOpen: false,
        lock: false
      });

    this.setupConnections()
  }

  getserialPort () {
    return this.serialPort
  }

  writeCommand (command) {
    this.port.write(command, (err) => {
      if (err) return console.log('Error on write: ', err.message);
      console.log('Command sent: ', command);
    });
  }

  setupConnections () {
    this.connectSerialPort().catch((reject) => {
      this.printRejectNotice(reject)
      this.handleConnectionError(reject)
    })
  }

  printRejectNotice (reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`)
    console.log(`${this.connectionName}: Attempting to reconnect ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`)
  }

  handleConnectionError () {
    setTimeout(() => {
      this.connectSerialPort().catch((reject) => {
        this.handleConnectionError(reject)
      })
    }, this.pollInterval * 1000)
  }

  connectSerialPort () {
    return new Promise((resolve, reject) => {
      this.serialPort.open(() => {
        console.log(`Established ${this.type} connection to ${this.connectionName} on ${this.port}`)
        resolve(true)
      })
      this.serialPort.on('error', (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.serialPort.removeAllListeners('error')
        this.serialPort.removeAllListeners('connect')
        reject(err.message)
      })
    })
  }
}

class SocketClientSource {
  constructor (sourceConfigs) {
    this.connectionName = sourceConfigs.name
    this.type = sourceConfigs.type
    this.pollInterval = sourceConfigs.pollInterval

    this.emitter = new EventEmitter()
    
    this.serverConfigs = {
      host: sourceConfigs.ip,
      port: sourceConfigs.port
    }
    
    this.server = net.createServer((socket) => {
      console.log('client connected');
      socket.on('data', (data) => {
        this.emitter.emit('received', data);
      });
      socket.on('end', () => {
        console.log('client disconnected');
      });
    });

    this.setupConnections()
  }

  setupConnections () {
    this.listen().catch((reject) => {
      this.printRejectNotice(reject)
      this.handleConnectionError(reject)
    })
  }

  printRejectNotice (reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`)
    console.log(`${this.connectionName}: Attempting to reconnect ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`)
  }

  handleConnectionError () {
    setTimeout(() => {
      this.listen().catch((reject) => {
        this.handleConnectionError(reject)
      })
    }, this.pollInterval * 1000)
  }

  listen () {
    return new Promise((resolve, reject) => {
      this.server.listen(this.serverConfigs, () => {
        console.log(`${this.connectionName} ${this.type}: Listening on ${this.serverConfigs.host}:${this.serverConfigs.port}`)
        resolve(true)
      })
      this.server.on('error', (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        if (err.code === 'EADDRINUSE') {
          console.log('Address in use, retrying...');
          server.close();
        }
        reject(err.message)
      })
    })
  }
}

module.exports = {
  SocketServerSource: SocketServerSource,
  serialPortSource: serialPortSource,
  SocketClientSource: SocketClientSource
}
