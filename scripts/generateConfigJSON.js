/**
  * generateConfigJSON.js
  *
  * Given a JSON dictionary for an fprime app, generate JSON configuration
  * files for the openmct bson server. Points and packets files are saved
  * to locations specified in config.js
  *
  * @author Aaron Doubek-Kraft aaron.doubek-kraft@jpl.nasa.gov
  *
  */

const fs = require('fs');
const path = require('path');


const outFilenameChPointsTemplate = 'res/${deployment}ChannelPoints.json',
      outFilenameEvPointsTemplate = 'res/${deployment}EventPoints.json',
      outFilenamePacketsTemplate = 'res/${deployment}Packets.json';

// dictPath.txt is written by autocoder so that this script knows what dictionary
// it should use to build configuration
let dictName = fs.readFileSync(path.dirname(__dirname) + '/res/dictPath.txt');

let dictJSON = fs.readFileSync(path.dirname(__dirname) + '/' + dictName, {encoding: 'UTF-8'}),
    dict = JSON.parse(dictJSON),
    deployment = Object.keys(dict)[0],
    deploymentDict = dict[deployment],
    channelPointDatum = {},
    eventPointDatum = {},
    packetDict = {};

let deploymentName = deployment,
    packetName = deploymentName + " Channels",
    evrPacketName = deploymentName + " EVRs"
    outFilenameChPoints = outFilenameChPointsTemplate.replace('${deployment}', deployment),
    outFilenameEvPoints = outFilenameEvPointsTemplate.replace('${deployment}', deployment),
    outFilenamePackets = outFilenamePacketsTemplate.replace('${deployment}', deployment);

packetDict[packetName] = {
    name: packetName,
    points: []
}

packetDict[evrPacketName] = {
    name: evrPacketName,
    points: []
}

channelPointDict = {
    "name": deployment,
    "key": deployment + 'Channels',
    "points": []
}

eventPointDict = {
    "name": deployment,
    "key": deployment + 'Events',
    "points": []
}

//OpenMCT format objects for given fields
let time_format = {
  'key': 'utc',
  'source': 'timestamp',
  'name': 'Timestamp',
  'format': 'utc',
  'hints': {
    'domain': 1
  }
};

let raw_value_format = {
    key: "value",
    name: "value",
    hints: {
        "range": 2
    }
};

// Generate JS objects representing OpenMCT configuration files
Object.entries(deploymentDict.channels).forEach(function (channel) {
    let id = channel[0],
        props = channel[1],
        name = props.name;

    // Add this point to the packet dictionary for channels
    packetDict[packetName].points.push(name);

    // Add the definition of this point to the point dictionary for channels
    channelPointDatum[name] = {
        name: name,
        key: name,
        values: [time_format, raw_value_format]
    }

    channelPointDict.points.push(channelPointDatum[name])
});

// Generate JS objects representing OpenMCT configuration files
Object.entries(deploymentDict.events).forEach(function (evr) {
    let id = evr[0],
        props = evr[1],
        name = props.name;

    // Add this point to the packet dictionary for channels
    packetDict[evrPacketName].points.push(name);

    // Add the definition of this point to the point dictionary for events
    eventPointDatum[name] = {
        name: name,
        key: name,
        values: [time_format, raw_value_format]
    }

    eventPointDict.points.push(eventPointDatum[name])
});

//Write configuration files
let outFilepathChPoints = path.dirname(__dirname) + '/' + outFilenameChPoints;
let outFilepathEvPoints = path.dirname(__dirname) + '/' + outFilenameEvPoints;
let outFilepathPackets = path.dirname(__dirname) + '/' + outFilenamePackets;

console.log(`Writing points config file to ${outFilepathChPoints}`);
fs.writeFileSync(outFilepathChPoints, JSON.stringify(channelPointDict));
console.log(`Writing points config file to ${outFilepathEvPoints}`);
fs.writeFileSync(outFilepathEvPoints, JSON.stringify(eventPointDict));
console.log(`Writing packets config file to ${outFilepathPackets}`);
fs.writeFileSync(outFilepathPackets, JSON.stringify(packetDict));

console.log(`\nTo start the OpenMCT server configured for this deployment, use deployment key '${deployment}'\n`)
