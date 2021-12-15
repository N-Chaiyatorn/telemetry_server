# Telemetry Server
### _The Telemetry Server for realtime IoT telemetry ETL_
&nbsp;
_Telemetry Server_ is a node-express-powered Realtime IoT telemetry ETL server that focus on flexibility, scalability and ease of use.

## Features
___
- Realtime ETL from/to socket server/client, serialport, etc. depends on which data interface types we need.
- Multiple ETL processes simultaneously (technically not) regardless of data interface types.
- Integrated with user defined deserialize/transforming algorithm easily.
- Support logging, currently only with [Cassandra].
- Support interfacing with [OpenMCT].
- Support historical telemetry RESTful API.

## Dependencies
___
_Telemetry Server_ uses a number of open source projects to work properly:

- [node.js] - Asynchronous event-driven JavaScript runtime environment, suitable for non-blocking I/O needed application.
- [express] - Node.js web application framework, serving RESTful API.
- [express-ws] - WebSocket endpoint for Express server, supported by [ws].
- [cassandra-nodejs-driver] - Cassandra database driver for nodejs
- [node-serialport] - Node.js library for access Linux/OSX/Windows serial port
  
## Installation
___
_Telemetry Server_ requires [Node.js](https://nodejs.org/) v16.13+ to run.

Clone the repository and install the dependencies

```sh
git clone https://github.com/N-Chaiyatorn/telemetry_server.git
cd telemetry_server
npm install
```

## Usage
___
To run this software, you need to follow severals step to configure the behavior of the software
1. Set the configuration of the telemetry source interface in `/configs/sourceConfigs.js`.
2. Define your deserialize/transforming algorithm in `/util/transformer.js` as a new function.
3. In `server.js`, instantiate the source interface (the class file is in `/interfaces/source.js`) which will take specific configuration from `/configs/sourceConfigs.js` as an argument. __Currently supports SocketClient and SocketServer interface type__.
4. In `server.js`, instantiate the sink interface (the class file is in `/interfaces/sink.js`) which will take sourceObject (source interface object), transformer (data transforming function, Optional) and databaseDriver (Optional). __Currently supports OpenMCT WebSocket interface__.
5. Pass the sink interface as an argument to openmctRealtimeServer express router.
6. The software will listen on port 16969 by default, which can be run by execute
   ```sh
   npm start
   ```
7. The historical telemetry API endpoint will be _<your_host_name>/history_ by default.

> Once started, the source interface will try to connect to the source. If success it will retrives the telemetry and pipeline to the sink interface. **_Also, the data transforming and logging will be automatically done if you specified them in the sink interface objects_**

## Using with OpenMCT
___
To use this _Telemetry Server_ with NASA's OpenMCT, first you need to clone this [forked version] of the OpenMCT. 
Then create user-defined json metadata (which is needed to conform the structure of example `res/developmentSatelliteDictionary.json`) and run this command in _Telemetry Server_ root directory
   ```sh
   npm run configure <yourMetadataFileName>
   ```
This will generate the metadata for openmct, the file will be generated in `<TelemetryServerRoot>/subsystemMetadata` directory. You need to put the metadata __file__ (not the directory) into the forked version of OpenMCT in `<OpenMctRoot>/src/plugins/satelliteObject/metadata` directory.

[//]: # (References)
   [node.js]: <http://nodejs.org>
   [express]: <http://expressjs.com>
   [OpenMCT]: <https://github.com/nasa/openmct>
   [Cassandra]: <https://cassandra.apache.org/_/index.html>
   [express-ws]: <https://github.com/HenningM/express-ws>
   [ws]: <https://github.com/websockets/ws>
   [Cassandra-nodejs-driver]: <https://github.com/datastax/nodejs-driver>
   [node-serialport]: <https://github.com/serialport/node-serialport>
   [forked version]: <https://github.com/N-Chaiyatorn/openmct>