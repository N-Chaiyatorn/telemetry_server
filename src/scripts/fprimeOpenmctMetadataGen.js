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

const fs = require("fs");
const path = require("path");

const target = process.argv[2];

if (!target)
  throw new Error(`Usage: node ${path.basename(__filename)} <target>`);

const targetDirName = path.dirname(__dirname) + `/metadata/openmct/fprimeMetadata/${target}`;

if (!fs.existsSync(targetDirName)) {
  fs.mkdirSync(targetDirName, { recursive: true });
}

const outFilenameChPoints = targetDirName + `/${target}ChannelPoints.json`;
const outFilenameEvPoints = targetDirName + `/${target}EventPoints.json`;
const outFilenameCmdPoints = targetDirName + `/${target}CommandPoints.json`;
const outFilenameCassandra = targetDirName + `/${target}CassandraMap.json`;
const outFilenamePackets = targetDirName + `/${target}Packets.json`;

const fprimeDictPath =
  path.dirname(__dirname) +
  `/metadata/raw/${target}Dictionary.json`;

const fprimeDict = fs.readFileSync(fprimeDictPath, { encoding: "UTF-8" });
const fprimeJson = JSON.parse(fprimeDict);
const targetDict = fprimeJson[target];
const channelPointDatum = {};
const eventPointDatum = {};
const commandPointDatum = {};
const packetDict = {};
const cassandraDict = {};

if (target !== Object.keys(fprimeJson)[0])
  throw new Error(`No fprime dictionary for target ${target}`);

packetDict[`${target}Channels`] = {
  name: `${target}Channels`,
  points: [],
};

packetDict[`${target}Events`] = {
  name: `${target}Events`,
  points: [],
};

packetDict[`${target}Commands`] = {
  name: `${target}Commands`,
  points: [],
};

const channelPointDict = {
  name: target,
  key: target + "Channels",
  points: [],
};

const eventPointDict = {
  name: target,
  key: target + "Events",
  points: [],
};

const commandPointDict = {
  name: target,
  key: target + "Commands",
  points: [],
};

// OpenMCT format objects for given fields
const timeFormat = {
  key: "utc",
  source: "timestamp",
  name: "Timestamp",
  format: "utc",
  hints: {
    domain: 1,
  },
};

const valueFormat = {
  key: "value",
  name: "value",
  hints: {
    range: 1,
  },
};

// Generate JS objects representing OpenMCT configuration files
Object.entries(targetDict.channels).forEach(function (channel) {
  const id = channel[0];
  const props = channel[1];
  const name = props.name;

  // Add this point to the packet dictionary for channels
  packetDict[`${target}Channels`].points.push(name);

  // Add the definition of this point to the point dictionary for channels
  channelPointDatum[name] = {
    key: id,
    name: name,
    values: [timeFormat, valueFormat],
  };

  channelPointDict.points.push(channelPointDatum[name]);
});

// Generate JS objects representing OpenMCT configuration files
Object.entries(targetDict.events).forEach(function (event) {
  const id = event[0];
  const props = event[1];
  const name = props.name;

  // Add this point to the packet dictionary for channels
  packetDict[`${target}Events`].points.push(name);

  // Add the definition of this point to the point dictionary for events
  eventPointDatum[name] = {
    key: id,
    name: name,
    values: [timeFormat, valueFormat],
  };

  eventPointDict.points.push(eventPointDatum[name]);
});

Object.entries(targetDict.commands).forEach(function (command) {
  const id = command[0];
  const props = command[1];
  const name = props.name;

  // Add this point to the packet dictionary for channels
  packetDict[`${target}Commands`].points.push(name);

  // Add the definition of this point to the point dictionary for events
  commandPointDatum[name] = {
    key: id,
    name: name,
    values: [timeFormat, valueFormat],
  };

  commandPointDict.points.push(commandPointDatum[name]);
});

Object.entries(targetDict).forEach((tmtcType) => {
  Object.values(tmtcType[1]).forEach((value) => {
    cassandraDict[value.name] = {
      components: value.component,
      tmtctype: tmtcType[0],
    };
  });
});

// Write configuration files
console.log(`Writing channel points config file to ${outFilenameChPoints}`);
fs.writeFileSync(outFilenameChPoints, JSON.stringify(channelPointDict));

console.log(`Writing event points config file to ${outFilenameEvPoints}`);
fs.writeFileSync(outFilenameEvPoints, JSON.stringify(eventPointDict));

console.log(`Writing command points config file to ${outFilenameCmdPoints}`);
fs.writeFileSync(outFilenameCmdPoints, JSON.stringify(commandPointDict));

console.log(`Writing packets config file to ${outFilenamePackets}`);
fs.writeFileSync(outFilenamePackets, JSON.stringify(packetDict));

console.log(`Writing cassandra map file to ${outFilenameCassandra}`);
fs.writeFileSync(outFilenameCassandra, JSON.stringify(cassandraDict));

console.log(
  `\nPlease move generated file to the fprimeObject Plugin in OpenMCT before start OpenMCT\n`
);
