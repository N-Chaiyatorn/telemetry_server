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

 let dictName = fs.readFileSync(path.dirname(__dirname) + '/res/dictPath.txt');

 let dictJSON = fs.readFileSync(path.dirname(__dirname) + '/' + dictName, {encoding: 'UTF-8'}),
     dict = JSON.parse(dictJSON),
     deployment = Object.keys(dict)[0],
     deploymentDict = dict[deployment],
     newDict = {};

Object.entries(deploymentDict).forEach((tmtcType) => {
  Object.values(tmtcType[1]).forEach((value) => {
    newDict[value['name']] = { components: value['component'], tmtctype: tmtcType[0] }
  })
});
 
 //Write configuration files
 const outFilenameChPointsTemplate = 'res/${deployment}DBMap.json';
 let outFilenameChPoints = outFilenameChPointsTemplate.replace('${deployment}', deployment);
 let outFilepathChPoints = path.dirname(__dirname) + '/' + outFilenameChPoints;

 console.log(`Writing points config file to ${outFilepathChPoints}`);
 fs.writeFileSync(outFilepathChPoints, JSON.stringify(newDict));
 
 console.log(`\nTo start the OpenMCT server configured for this deployment, use deployment key '${deployment}'\n`)
 