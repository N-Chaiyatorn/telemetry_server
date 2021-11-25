module.exports = {
    fprime: {
        name: 'Ref',
        type: 'socketServer',
        port: 50050,
        ip: '192.168.0.243',
        pollInterval: 10,
        successFunction: function () {
            // ThreadedTCPServer will not send packets until it recieves this command
            this.socket.write('Register GUI\n');
        }
    },
    adcsTest: {
        name: 'development',
        type: 'socketClient',
        port: 10900,
        ip: '192.168.0.77',
        pollInterval: 10,
        successFunction: function () {}
    },
    serialtest: {
        name: 'serialtest',
        type: 'serialport',
        port: 'ttyS2',
        pollInterval: 10,
        successFunction: function () {}
    },
};