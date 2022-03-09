/** Main process of muSpace telemetry server
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

// Express websocket for full duplex communication with openmct
const expressWs = require("express-ws");
const app = require("express")();
expressWs(app);

const sourceConfigs = require("./configs/ExtractorConfigs.js");

const Source = require("./Classes/Extractor/Extractor.js");

// Deserializer
const Deserializer = require("./util/Deserializer.js");

// Express routers
const OpenmctRealtimeServer = require("./routers/openmct-realtime-server.js");
const OpenmctHistoryServer = require("./routers/openmct-history-server.js");

// Initialize database driver for development keyspace
const { CassandraDriver } = require("./Classes/Database/Cassandra.js");
const cassandraDriver = new CassandraDriver("development");

// Setup Ref Fprime-gds connection and serve to API
const refSource = new Source.SocketClient(sourceConfigs.fprime);
app.use(
  "/realtime/" + sourceConfigs.fprime.name,
  OpenmctRealtimeServer(refSource, Deserializer.fprimeDeserialize)
);
app.use("/history", OpenmctHistoryServer(cassandraDriver));

const PORT = process.env.PORT || 16969;
app.listen(PORT, () => {
  console.log(`OpenMCT telemetry server is listening on ${PORT}`);
});
