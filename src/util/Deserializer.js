/**
 * Raw telemetry data transformer, from buffer to json object
 * This will be mainly used in Sink object
 *
 * @param { Buffer } data - Buffer data from target source interface
 *
 * @return Array of JSON object contains timestamp, value, id fields
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

function fprimeDeserialize(data) {
  const FprimeDeserializer = require("./fprimeDeserializer");
  const refDictionary = require("../res/RefDictionary.json");
  const deserializer = new FprimeDeserializer(refDictionary, "Ref");
  const jsonDataArray = deserializer.deserialize(data);
  return jsonDataArray;
}

function parinDeserialize(data) {
  const tlmMatching = require("../subsystemMetadata/development/developmentTlmMatching.json");
  const rawDataMetadata = [
    "q0",
    "q1",
    "q2",
    "q3",
    "angularVx",
    "angularVy",
    "angularVz",
    "CmdVolX",
    "CmdVolY",
    "CmdVolZ",
    "CmdCurX",
    "CmdCurY",
    "CmdCurZ",
    "accelX",
    "accelY",
    "accelZ",
    "magX",
    "magY",
    "magZ",
    "roll",
    "pitch",
    "yaw",
  ];
  const dataArray = [];
  for (let i = 0; i < data.length / 4; i++) {
    const offset = i * 4;
    dataArray.push({
      timestamp: Date.now(),
      value: data.readFloatLE(offset),
      id: tlmMatching[rawDataMetadata[i]],
    });
  }
  return dataArray;
}

module.exports = {
  fprimeDeserialize: fprimeDeserialize,
  parinDeserialize: parinDeserialize,
};
