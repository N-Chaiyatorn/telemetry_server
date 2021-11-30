/** 
 * Configuration for target source interface e.g. Satellite, Robot, Test module
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

module.exports = {
  fprime: {
    name: 'Ref',
    type: 'Socket Server',
    port: 50050,
    ip: '192.168.0.243',
    pollInterval: 10,
    successFunction: function () {
      // ThreadedTCPServer will not send packets until it recieves this command
      this.socket.write('Register GUI\n')
    }
  },
  adcsTest: {
    name: 'development',
    type: 'Socket Client',
    port: 10900,
    ip: '192.168.0.77',
    pollInterval: 10,
    successFunction: function () {}
  },
  serialtest: {
    name: 'serialtest',
    type: 'Serial Port',
    port: 'ttyS2',
    pollInterval: 10,
    successFunction: function () {}
  }
}
