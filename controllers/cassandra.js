/**
 * CassandraDriver class for query the data, both writing and reading
 * This will be mainly used in Sink object
 *
 * @param { string } keyspace - Keyspace of the needed target
 * @param { string[] } contactPoints - Array of IP address of the cassandra nodes
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const cassandra = require("cassandra-driver");
const querySet = require("../scripts/cassandraQuery");

class CassandraDriver {
  constructor(keyspace, contactPoints = ["192.168.0.77"]) {
    this.contactPoints = contactPoints;
    this.keyspace = keyspace;

    this.client = new cassandra.Client({
      contactPoints: this.contactPoints,
      localDataCenter: "dc1",
      keyspace: this.keyspace,
    });
  }

  write(data, tableName) {
    if (!tableName) tableName = "test";

    if (typeof data.value === "number") {
      var numericArg = data.value;
    } else {
      var textArg = data.value;
    }

    if (data.id && data.timestamp) {
      this.client.execute(
        querySet.writeQuery.replace("?", tableName),
        [data.id, data.timestamp, numericArg, textArg],
        { prepare: true },
        (err, res) => {
          if (err) {
            throw err;
          }
        }
      );
    } else {
      console.error(data);
    }
  }

  read(tableName, nameId, startTime, endTime) {
    if (!tableName) tableName = "test";
    const query = querySet.readQuery.replace("?", tableName);
    const datum = this.client.execute(
      query,
      [nameId, Math.round(startTime), Math.round(endTime)],
      { prepare: true }
    );
    return datum;
  }
}

module.exports = {
  CassandraDriver: CassandraDriver,
};
