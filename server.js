const source = require('./controllers/source.js');
const sink = require('./controllers/sink.js')
const sourceConfigs = require('./configs/sourceConfigs.js');
const clientConfigs = require('./configs/clientConfigs.js')
const transformer = require('./controllers/transformer.js');
const openmctRealtimeServer = require('./controllers/openmct-realtime-server.js');
const openmctHistoryServer = require('./controllers/openmct-history-server.js');


const expressWs = require('express-ws');
const { CassandraDriver } = require('./controllers/cassandra.js');
const app = require('express')(); 
expressWs(app);

const cassandraDriver = new CassandraDriver('development')

const refSource = new source.SocketServerSource(sourceConfigs.fprime)
const refToMct = new sink.OpenMctSink(refSource, transformer.fprimeDeserialize, transformer.openmctPacketer)
app.use('/realtime/' + sourceConfigs.fprime.name, openmctRealtimeServer(refToMct));

const adcsDetumbling = new source.SocketClientSource(sourceConfigs.adcsTest)
const adcsDetumblingToMct = new sink.OpenMctSink(adcsDetumbling, transformer.parinDeserialize, null, cassandraDriver)
app.use('/realtime/' + sourceConfigs.adcsTest.name, openmctRealtimeServer(adcsDetumblingToMct));

app.use('/history', openmctHistoryServer(cassandraDriver));

app.listen(clientConfigs.openmct.port, () => {
    console.log(`OpenMCT telemetry server is listening on ${clientConfigs.openmct.port}`)
});