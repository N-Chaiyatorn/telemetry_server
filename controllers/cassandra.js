const cassandra = require('cassandra-driver')
const fs = require('fs')
const path = require('path')
const querySet = require('../scripts/cassandraQuery')

class CassandraDriver {
  constructor(keyspace, contactPoints = '192.168.0.77') {
    this.contactPoints = [contactPoints]
    this.keyspace = keyspace
    this.dict = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'res', 'ODC1Dictionary.json')));
    this.dbDict = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'res', 'ODC1DBMap.json')));

    this.client = new cassandra.Client({
      contactPoints: this.contactPoints,
      localDataCenter: 'dc1',
      keyspace: this.keyspace
    });
  }

  write(data, table = 'test') {
    console.log(data)
    if (typeof data.value === 'number') {
      var numericArg = data.value
      var textArg = undefined
    } else {
      var numericArg = undefined
      var textArg = data.value
    }

    if (data.id && data.timestamp) {
      this.client.execute(querySet.writeQuery.replace('?', table), [data.id, data.timestamp, numericArg, textArg], { prepare: true }, (err, res) => {
        if (err) { throw err }
      });
    } else {
      console.error(data)
    }
  }

  read(tableName='test', nameId, startTime, endTime) {
    let query = querySet.readQuery.replace('?', tableName)
    const datum = this.client.execute(query, [nameId, Math.round(startTime), Math.round(endTime)], { prepare: true });
    return datum
  }
}

module.exports = {
  CassandraDriver: CassandraDriver
}

