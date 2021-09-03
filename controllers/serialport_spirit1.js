//Import packages
const serialport = require('serialport');
const ByteLength = require('@serialport/parser-byte-length')
const binaryDeserializer = require('../util/deserialize-binary');


//Build constructor
const port = new serialport('/dev/ttyS2', {
    buadRate: 57600,
    autoOpen: false
});
const parser = port.pipe(new ByteLength({length: 27}))
const deserializer = new binaryDeserializer(require('../res/RefDictionary.json'), 'Ref');


//Logic here
port.open((err) => {
    if (err){
        return console.log('Error opening port: ', err.message);
    }
});

port.on('open', () => {
    
});

parser.on('data', (data) => {
    var dataAsJSON = deserializer.deserialize(data);
    dataAsJSON.forEach((data) => {
        console.log(data);
    });
});
