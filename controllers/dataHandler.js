// telemetry source object for the ODC1
var fs = require('fs');
var path = require('path')
var net = require('net');
var binaryDeserializer = require('../util/deserialize-binary');


function dataHandler(sourceConfigs) {
	this.sourceObject = sourceConfigs;
	this.sourceObject.socket = new net.Socket();
	this.sourceObject.pollInterval = 10;

	this.dictionary = require('../res/RefDictionary.json');
    this.deserializer = new binaryDeserializer(this.dictionary, 'Ref');

    let dict = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'res', 'RefChannelPoints.json')));

	this.state = {};
    this.listeners = [];
    this.data = [];

	(dict.points.map(obj => obj.key)).forEach(function (k) {
		this.state[k] = 0;
	}, this);

	// to notify telemetry server
	this.setupConnections();

    this.updateLADState();

    setInterval(function () {
        this.sendTelemetry();
    }.bind(this), 500);
};


// to update every time new data comes in
dataHandler.prototype.sendTelemetry = function () {
	var message = { timestamp: this.state['timestamp'], value: this.state[this.data[0]], id: this.data[0]};
	this.notify(message);
}


// notifiy function, called in generate Telemetry, notifies listeners
dataHandler.prototype.notify = function (point) {
    this.listeners.forEach(function (l) {
        l(point);
    });
};


// manages listeners for realtime telemetry
dataHandler.prototype.listen = function (listener) {
    this.listeners.push(listener);
    return function () {
        this.listeners = this.listeners.filter(function (l) {
            return l !== listener;
        });
    }.bind(this);
};


dataHandler.prototype.setupConnections = function () {
    this.connectSocket(this.sourceObject).catch( (reject) => {
        this.printRejectNotice(reject, this.sourceObject);
        this.handleConnectionError(reject, this.sourceObject);
    });
}


dataHandler.prototype.printRejectNotice = function (reject, sourceObject) {
    console.log(`${sourceObject.name}: Connection Error: ${reject}`);
    console.log(`${sourceObject.name}: Attempting to reconnect every ${this.sourceObject.pollInterval} seconds`);
}


dataHandler.prototype.handleConnectionError = function (err, sourceObject) {
    setTimeout( () => {
        this.connectSocket(sourceObject).catch( (reject) => {
            this.handleConnectionError(reject, sourceObject);
        });
    }, this.sourceObject.pollInterval * 1000);

}


dataHandler.prototype.connectSocket = function (sourceObject) {
    var port = sourceObject.port,
        ip = sourceObject.ip,
        sourceSocket = sourceObject.socket;

    return new Promise( (resolve, reject) => {
        sourceSocket.connect(port, ip, () => {
            console.log(`Established connection to ${sourceObject.name} on ${ip}:${port}`);
            sourceObject.successFunction()
            resolve(true);
        });

        sourceSocket.on('error', (err) => {
            //clean up event listeners to prevent multiple success or failure messages
            source.removeAllListeners('error');
            source.removeAllListeners('connect')
            reject(err.message)
        });
    });
}


dataHandler.prototype.updateLADState = function () {
    this.sourceObject.socket.on('data', (data) => {
       console.log(data)
		var dataAsJSON = this.deserializer.deserialize(data);
        dataAsJSON.forEach( (data) => {
            console.log(data)
            this.data = [data.name, data.raw_value, data.timestamp];
            this.state[this.data[0]] = this.data[1];
		    this.state['timestamp'] = Math.round(this.data[2]);
        })
	});
};


module.exports = function (sourceObject) {
    return new dataHandler(sourceObject)
};
