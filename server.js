/** Main process of muSpace telemetry server
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */


// Express websocket for full duplex communication with openmct
const expressWs = require("express-ws");
const app = require("express")();
expressWs(app);

const sourceConfigs = require("./configs/sourceConfigs.js");

const source = require("./interfaces/source.js");
const sink = require("./interfaces/sink.js");

const transformer = require("./util/transformer.js");

const openmctRealtimeServer = require("./controllers/openmct-realtime-server.js");
const generalRealtimeServer = require("./controllers/general-realtime-server.js");

// Setup Ref Fprime-gds connection, for software development purposes
const refSource = new source.SocketClient(sourceConfigs.fprime);
app.use(
  "/realtime/" + sourceConfigs.fprime.name,
  generalRealtimeServer(refSource, transformer.fprimeDeserialize)
);

// Setup adcs detumbling test connection, for adcs development purposes
const adcsDetumbling = new source.SocketServer(sourceConfigs.adcsTest);
const adcsDetumblingToMct = new sink.OpenMctSink(
  adcsDetumbling,
  transformer.parinDeserialize
);

app.use(
  "/realtime/" + sourceConfigs.adcsTest.name,
  openmctRealtimeServer(adcsDetumblingToMct)
);

const PORT = process.env.PORT || 16969;
app.listen(PORT, () => {
  console.log(`OpenMCT telemetry server is listening on ${PORT}`);
});
