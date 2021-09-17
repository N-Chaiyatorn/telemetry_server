const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: ['192.168.1.155'],
  localDataCenter: 'datacenter1',
  keyspace: 'odc1'
});

const queryCreateTable = `CREATE TABLE IF NOT EXISTS odc1.test (
    components text, tmtcType text, tmtcName text,
    timestamp timestamp, numericArg float, textArg text, tmtcSource text,
    PRIMARY KEY ((components, tmtcName), timestamp, tmtcType)
  ) 
  WITH CLUSTERING ORDER BY (
    timestamp DESC, tmtcName ASC
  )`;

client.execute(queryCreateTable).then(() => console.log('Successfully created the table!'));