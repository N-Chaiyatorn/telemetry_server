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

const fs = require('fs')
const path = require('path')

const target = process.argv[2]

if (!target) throw new Error(`Usage: node ${path.basename(__filename)} <target>`)

const targetDirName = path.dirname(__dirname) + `fprimeMetadata/${target}`

if (!fs.existsSync(targetDirName)) {
  fs.mkdirSync(targetDirName, { recursive: true })
}

const outFilenameChPoints = `fprimeMetadata/${target}/${target}ChannelPoints.json`
const outFilenameEvPoints = `fprimeMetadata/${target}/${target}EventPoints.json`
const outFilenameCmdPoints = `fprimeMetadata/${target}/${target}CommandPoints.json`
const outFilenameCassandra = `fprimeMetadata/${target}/${target}CassandraMap.json`
const outFilenamePackets = `fprimeMetadata/${target}/${target}Packets.json`

const fprimeDictPath = path.dirname(__dirname) + `/fprimeMetadata/${target}/${target}Dictionary.json`

const fprimeDict = fs.readFileSync(fprimeDictPath, { encoding: 'UTF-8' })
const fprimeJson = JSON.parse(fprimeDict)
const targetDict = fprimeJson[target]
const channelPointDatum = {}
const eventPointDatum = {}
const commandPointDatum = {}
const packetDict = {}
const cassandraDict = {}

if (target !== Object.keys(fprimeJson)[0]) throw new Error(`No fprime dictionary for target ${target}`)

packetDict[`${target}Channels`] = {
  name: `${target}Channels`,
  points: []
}

packetDict[`${target}Events`] = {
  name: `${target}Events`,
  points: []
}

packetDict[`${target}Commands`] = {
  name: `${target}Commands`,
  points: []
}

const channelPointDict = {
  name: target,
  key: target + 'Channels',
  points: []
}

const eventPointDict = {
  name: target,
  key: target + 'Events',
  points: []
}

const commandPointDict = {
  name: target,
  key: target + 'Commands',
  points: []
}

// OpenMCT format objects for given fields
const timeFormat = {
  key: 'utc',
  source: 'timestamp',
  name: 'Timestamp',
  format: 'utc',
  hints: {
    domain: 1
  }
}

const valueFormat = {
  key: 'value',
  name: 'value',
  hints: {
    range: 1
  }
}

// Generate JS objects representing OpenMCT configuration files
Object.entries(targetDict.channels).forEach(function (channel) {
  const id = channel[0]
  const props = channel[1]
  const name = props.name

  // Add this point to the packet dictionary for channels
  packetDict[`${target}Channels`].points.push(name)

  // Add the definition of this point to the point dictionary for channels
  channelPointDatum[name] = {
    key: id,
    name: name,
    values: [timeFormat, valueFormat]
  }

  channelPointDict.points.push(channelPointDatum[name])
})

// Generate JS objects representing OpenMCT configuration files
Object.entries(targetDict.events).forEach(function (event) {
  const id = event[0]
  const props = event[1]
  const name = props.name

  // Add this point to the packet dictionary for channels
  packetDict[`${target}Events`].points.push(name)

  // Add the definition of this point to the point dictionary for events
  eventPointDatum[name] = {
    key: id,
    name: name,
    values: [timeFormat, valueFormat]
  }

  eventPointDict.points.push(eventPointDatum[name])
})

Object.entries(targetDict.commands).forEach(function (command) {
  const id = command[0]
  const props = command[1]
  const name = props.name

  // Add this point to the packet dictionary for channels
  packetDict[`${target}Commands`].points.push(name)

  // Add the definition of this point to the point dictionary for events
  commandPointDatum[name] = {
    key: id,
    name: name,
    values: [timeFormat, valueFormat]
  }

  commandPointDict.points.push(commandPointDatum[name])
})

Object.entries(targetDict).forEach((tmtcType) => {
  Object.values(tmtcType[1]).forEach((value) => {
    cassandraDict[value.name] = { components: value.component, tmtctype: tmtcType[0] }
  })
})

// Write configuration files
const outFilepathChPoints = path.dirname(__dirname) + '/' + outFilenameChPoints
const outFilepathEvPoints = path.dirname(__dirname) + '/' + outFilenameEvPoints
const outFilepathCmdPoints = path.dirname(__dirname) + '/' + outFilenameCmdPoints
const outFilepathPackets = path.dirname(__dirname) + '/' + outFilenamePackets
const outFilepathCassandra = path.dirname(__dirname) + '/' + outFilenameCassandra

console.log(`Writing channel points config file to ${outFilepathChPoints}`)
fs.writeFileSync(outFilepathChPoints, JSON.stringify(channelPointDict))

console.log(`Writing event points config file to ${outFilepathEvPoints}`)
fs.writeFileSync(outFilepathEvPoints, JSON.stringify(eventPointDict))

console.log(`Writing command points config file to ${outFilepathCmdPoints}`)
fs.writeFileSync(outFilepathCmdPoints, JSON.stringify(commandPointDict))

console.log(`Writing packets config file to ${outFilepathPackets}`)
fs.writeFileSync(outFilepathPackets, JSON.stringify(packetDict))

console.log(`Writing cassandra map file to ${outFilepathCassandra}`)
fs.writeFileSync(outFilepathCassandra, JSON.stringify(cassandraDict))

console.log(`\nTo start the OpenMCT server configured for this deployment, use deployment key '${target}'\n`)
