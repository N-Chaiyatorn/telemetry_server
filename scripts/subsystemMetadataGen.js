/** 
 * Metadata Generator, to be used in OpenMCT for populating root node
 * 
 * @param { string } target - Target name to specify user-defined metadata path
 * 
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const fs = require('fs')
const path = require('path')

const target = process.argv[2]

if (!target) throw new Error(`Usage: node ${path.basename(__filename)} <target>`)

const targetDirName = path.dirname(__dirname) + `/subsystemMetadata/${target}`

if (!fs.existsSync(targetDirName)) {
  fs.mkdirSync(targetDirName, { recursive: true })
}

const satelliteDictPath = path.dirname(__dirname) + `/res/${target}SatelliteDictionary.json`

const satelliteDict = fs.readFileSync(satelliteDictPath, { encoding: 'UTF-8' })
const satelliteJson = JSON.parse(satelliteDict)

const satelliteMetadataTemplate = {
  satelliteId: target,
  satelliteName: target,
  subsystems: {}
}

const telemetryMatchingDict = {}

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
  unit: 'unit',
  // format: 'float',
  name: 'value',
  hints: {
    range: 1
  }
}

// Generate JS objects representing OpenMCT configuration files
Object.entries(satelliteJson).forEach((subsystem) => {
  const subsystemName = subsystem[0]
  const subsystemMetadata = subsystem[1]

  const satelliteSubsystemDatum = {
    key: `${target}.${subsystemName}`,
    name: `${target}.${subsystemName}`,
    hardwares: {}
  }

  Object.entries(subsystemMetadata.hardware).forEach((hardware) => {
    const hardwareName = hardware[0]
    const telemetryDatumArray = hardware[1]
    const stripHardwareName = hardwareName.replace(/\s/g, '')

    satelliteSubsystemDatum.hardwares[stripHardwareName] = {}
    satelliteSubsystemDatum.hardwares[stripHardwareName].name = `${hardwareName}`
    satelliteSubsystemDatum.hardwares[stripHardwareName].key = `${target}.${subsystemName}.${stripHardwareName}`
    satelliteSubsystemDatum.hardwares[stripHardwareName].points = []

    telemetryDatumArray.forEach((telemetryDatum) => {
      const telemetryDatumDict = {
        key: `${target}.${subsystemName}.${stripHardwareName}.${telemetryDatum.replace(/\s/g, '')}`,
        name: `${telemetryDatum}`,
        values: [timeFormat, valueFormat]
      }
      satelliteSubsystemDatum.hardwares[stripHardwareName].points.push(telemetryDatumDict)
      telemetryMatchingDict[telemetryDatum] = `${target}.${subsystemName}.${stripHardwareName}.${telemetryDatum.replace(/\s/g, '')}`
    })
  })

  satelliteMetadataTemplate.subsystems[subsystemName] = satelliteSubsystemDatum
})

// Write configuration files
const outFilepath = path.dirname(__dirname) + '/' + `subsystemMetadata/${target}/${target}Satellite.json`
const outFileTlmpath = path.dirname(__dirname) + '/' + `subsystemMetadata/${target}/${target}TlmMatching.json`

console.log(`Writing points config file to ${outFilepath}`)
fs.writeFileSync(outFilepath, JSON.stringify(satelliteMetadataTemplate))

console.log(`Writing points config file to ${outFileTlmpath}`)
fs.writeFileSync(outFileTlmpath, JSON.stringify(telemetryMatchingDict))
