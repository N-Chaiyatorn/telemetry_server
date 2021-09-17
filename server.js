var realtimeServer = require('./controllers/realtime-server');
var historyServer = require('./controllers/history-server');
var dataHandler = require('./controllers/dataHandler');
var clientConfigs = require('./configs/client')
var sourceConfigs = require('./configs/source');

var expressWs = require('express-ws');
var app = require('express')(); 
expressWs(app);

var source = new dataHandler(sourceConfigs.fprime);

app.use('/realtime', realtimeServer(source));
app.use('/history', historyServer())

app.listen(clientConfigs.openMCT.port, () => {
    console.log(`Telemetry server is listening on ${clientConfigs.openMCT.port}`)
});