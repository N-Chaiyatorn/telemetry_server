require('dotenv').config();

module.exports = {
    fprime: {
        name: "Fprime Telemetry",
        port: 50050,
        ip: '127.0.0.1',
        successFunction: function () {
            // ThreadedTCPServer will not send packets until it recieves this command
            this.socket.write('Register GUI\n');
        }
    }
};