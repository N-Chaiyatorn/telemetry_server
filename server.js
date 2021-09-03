// main file of the telemtry server, comment/uncomment what is needed
var realtimeServer = require('./controllers/realtime-server');
var dataHandler = require('./controllers/dataHandler');
var clientConfigs = require('./configs/client')
var sourceConfigs = require('./configs/source');

var expressWs = require('express-ws');
var app = require('express')(); 
expressWs(app);

var source = new dataHandler(sourceConfigs.fprime);

app.use('/realtime', realtimeServer(source));

app.listen(clientConfigs.openMCT.port, () => {
    console.log('hi')
});