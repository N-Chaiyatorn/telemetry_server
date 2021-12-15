/** Main process of muSpace telemetry server
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

// Express websocket for full duplex communication with openmct
const expressWs = require("express-ws");
const app = require("express")();
expressWs(app);

// Import the interface configuration
const sourceConfigs = require("./configs/sourceConfigs.js");

// Import the interface classes
const source = require("./interfaces/source.js");
const sink = require("./interfaces/sink.js");

// Import the telemetry transformer (deserializer, deframer)
const transformer = require("./util/transformer.js");

// Import router for express
const openmctRealtimeServer = require("./controllers/openmct-realtime-server.js");
const openmctHistoryServer = require("./controllers/openmct-history-server.js");

// Initialize database driver for development keyspace
const { CassandraDriver } = require("./controllers/cassandra.js");
const cassandraDriver = new CassandraDriver("development");

// Setup Ref Fprime-gds connection, for software development purposes
const refSource = new source.SocketClient(sourceConfigs.fprime);
const refToMct = new sink.OpenMctSink(refSource, transformer.fprimeDeserialize);
app.use(
  "/realtime/" + sourceConfigs.fprime.name,
  openmctRealtimeServer(refToMct)
);

// Setup adcs detumbling test connection, for adcs development purposes
const adcsDetumbling = new source.SocketServer(sourceConfigs.adcsTest);
const adcsDetumblingToMct = new sink.OpenMctSink(
  adcsDetumbling,
  transformer.parinDeserialize,
  cassandraDriver
);
app.use(
  "/realtime/" + sourceConfigs.adcsTest.name,
  openmctRealtimeServer(adcsDetumblingToMct)
);

// Create endpoint URI for historical data requests
app.use("/history", openmctHistoryServer(cassandraDriver));

// Listen to the specified port
const PORT = process.env.port || 16969;
app.listen(PORT, () => {
  console.log(`OpenMCT telemetry server is listening on ${PORT}`);
});
