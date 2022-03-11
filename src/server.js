/** Entry point of muSpace telemetry server
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

// Express websocket for full duplex communication with openmct
const expressWs = require("express-ws");
const app = require("express")();
expressWs(app);

const ExtractorConfigs = require("./configs/ExtractorConfigs.js");
const Extractor = require("./Classes/Extractor/Extractor.js");
const Deserializer = require("./Classes/Deserializer/Deserializer.js");

// Express routers for OpenMCT
const OpenmctRealtimeServer = require("./api/openmctRealtimeApi.js");
const OpenmctHistoryServer = require("./api/openmctHistoricalApi.js");

// Initialize database driver for development keyspace
const { CassandraDriver } = require("./Classes/DatabaseConnector/Cassandra.js");
const cassandraDriver = new CassandraDriver("development");

// Setup connection to fprime-gds and serve the telemetry to Realtime WebSocket API /
const refExtractor = new Extractor.SocketClient(ExtractorConfigs.fprime);
app.use(
  "/realtime/" + ExtractorConfigs.fprime.name,
  OpenmctRealtimeServer(refExtractor, Deserializer.fprimeDeserialize)
);
// Setup historical telemetry RESTful API (using HTTP protocol)
app.use("/history", OpenmctHistoryServer(cassandraDriver));

// Start the server process
const PORT = process.env.PORT || 16969;
app.listen(PORT, () => {
  console.log(`Telemetry server is listening on ${PORT}`);
});
