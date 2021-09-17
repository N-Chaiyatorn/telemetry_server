const cassandra = require('cassandra-driver');
var fs = require('fs');
var path = require('path')

const client = new cassandra.Client({
  contactPoints: ['192.168.1.155'],
  localDataCenter: 'datacenter1',
  keyspace: 'odc1'
});

function write(data) {
    const queryWriteTestNum = `INSERT INTO odc1.test (components, tmtcType, tmtcName, timestamp, numericArg) VALUES (?,?,?,?,?)`
                                
    const queryWriteTestText = `INSERT INTO odc1.test (components, tmtcType, tmtcName, timestamp, textArg) VALUES (?,?,?,?,?)`

    let dict = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'res', 'RefDictionary.json')));
  
    if (data.raw_type === 71 || data.raw_type === 72 || data.raw_type === 73) {
        var message = {
            components: dict['Ref']['channels'][data.identifier]['component'],
            tmtcType: 'channels',
            tmtcName: data.name,
            timestamp: data.timestamp,
            numericArg: data.raw_value,
          };
        client.execute(queryWriteTestNum, [message.components, message.tmtcType, message.tmtcName, message.timestamp,
          message.numericArg], {prepare: true}, (err, res) => {
            if (err) {throw err}
            //console.log('successfully write to cassandra!');
          });
    }
    else if (data.raw_type === 74) {
        var message = {
            components: dict['Ref']['channels'][data.identifier]['component'],
            tmtcType: 'channels',
            tmtcName: data.name,
            timestamp: data.timestamp,
            textArg: data.raw_value,
          };
        client.execute(queryWriteTestText, [message.components, message.tmtcType, message.tmtcName, message.timestamp,
          message.textArg], {prepare: true}, (err, res) => {
            if (err) {
              throw err;
            }
            //console.log('successfully write to cassandra!');
          });
    }
};

function read(telemetryName, start, end) {
    var query = `SELECT timestamp, tmtcName, numericArg FROM test WHERE components = ? AND tmtcType = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC`;
    let dict = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'res', 'RefDBMap.json')));

    var datum = client.execute(query, [dict[telemetryName].components, dict[telemetryName].tmtctype, Math.round(start), Math.round(end)], {prepare: true});

    return datum
}

module.exports = {
  write: write,
  read: read
};