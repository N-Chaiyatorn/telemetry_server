var serialize = require('../util/commandSerializer').serialize;

var command = {
    id: 363,
    arguments: ['asd']
};

var target = "Ref";

var commandPacket = serialize(command, target);

console.log(commandPacket);