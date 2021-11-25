function fprimeDeserialize(data) {
  const fprimeDeserializer = require('../util/fprimeDeserializer');
  const refDictionary = require('../res/RefDictionary.json');
  const deserializer = new fprimeDeserializer(refDictionary, 'Ref');
  const jsonDataArray = deserializer.deserialize(data);
  return jsonDataArray
}

function openmctPacketer(rawDataArray) {
  const dataPacket = {
    timestamp: rawDataArray.timestamp,
    value: rawDataArray.value,
    id: rawDataArray.name
  }
  return dataPacket
}

function parinDeserialize(rawData) {
  const tlmMatching = require('../subsystemMetadata/development/developmentTlmMatching.json');
  const rawDataMetadata = ['q0', 'q1', 'q2', 'q3', 'angularVx', 'angularVy', 'angularVz', 'CmdVolX', 'CmdVolY', 'CmdVolZ', 'CmdCurX', 'CmdCurY', 'CmdCurZ', 'accelX', 'accelY', 'accelZ', 'magX', 'magY', 'magZ', 'roll', 'pitch', 'yaw']
  const dataArray = []
  for (let i = 0; i < rawData.length / 4; i++) {
    let offset = i * 4
    dataArray.push({
      timestamp: Date.now(),
      value: rawData.readFloatLE(offset),
      id: tlmMatching[rawDataMetadata[i]]
    })
  }
  return dataArray
}

module.exports = {
  fprimeDeserialize: fprimeDeserialize,
  openmctPacketer: openmctPacketer,
  parinDeserialize: parinDeserialize
}