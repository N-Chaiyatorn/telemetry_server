/** Entry point of muSpace telemetry server
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

// Express websocket for full duplex communication with openmct
const expressWs = require("express-ws");
const app = require("express")();
expressWs(app);

const sourceConfigs = require("./configs/ExtractorConfigs.js");

const Extractor = require("./Classes/Extractor/Extractor.js");

const Deserializer = require("./Classes/Deserializer/Deserializer.js");

// Express routers
const OpenmctRealtimeServer = require("./api/openmctRealtimeApi.js");
const OpenmctHistoryServer = require("./api/openmctHistoricalApi.js");

// Initialize database driver for development keyspace
const { CassandraDriver } = require("./Classes/DatabaseConnector/Cassandra.js");
const cassandraDriver = new CassandraDriver("development");

// Setup Ref Fprime-gds connection and serve to API
const refExtractor = new Extractor.SocketClient(sourceConfigs.fprime);
app.use(
  "/realtime/" + sourceConfigs.fprime.name,
  OpenmctRealtimeServer(refExtractor, Deserializer.fprimeDeserialize)
);
app.use("/history", OpenmctHistoryServer(cassandraDriver));

const PORT = process.env.PORT || 16969;
app.listen(PORT, () => {
  console.log(`OpenMCT telemetry server is listening on ${PORT}`);
});
