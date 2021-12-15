/**
 * Query statements for CassandraDriver class
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const createKeyspaceQuery = `
  CREATE KEYSPACE IF NOT EXISTS development 
  WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy', 'dc1' : 0};
`;

const createFprimeTableQuery = `
  CREATE TABLE IF NOT EXISTS odc1.test (
    components text,
    tmtcType text,
    tmtcName text,
    timestamp timestamp,
    numericArg float,
    textArg text,
    tmtcSource text,
    PRIMARY KEY ((components, tmtcType), timestamp, tmtcName)
  ) 
  WITH CLUSTERING ORDER BY (
    timestamp DESC,
    tmtcName ASC
  );
`;

const writeFprimeQuery = `
  INSERT INTO test (
    components,
    tmtcType,
    tmtcName,
    timestamp,
    numericArg,
    textArg,
    tmtcSource
  ) 
  VALUES (
    ?,?,?,?,?,?,?
  );
`;

const readFprimeQuery = `
  SELECT timestamp, tmtcName, numericArg, textArg
  FROM test 
  WHERE components = ? AND tmtcType = ? AND timestamp >= ? AND timestamp <= ? 
  ORDER BY timestamp ASC;
`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS development.test (
    nameId text,
    timestamp timestamp,
    numericArg float,
    textArg text,
    PRIMARY KEY ((nameId), timestamp)
  ) 
  WITH CLUSTERING ORDER BY (
    timestamp DESC
  );
`;

const writeQuery = `
  INSERT INTO ? (nameId, timestamp, numericArg, textArg)
  VALUES (?,?,?,?);
`;

const readQuery = `
  SELECT timestamp, nameId, numericArg, textArg
  FROM ?
  WHERE nameId = ? AND timestamp >= ? AND timestamp <= ? 
  ORDER BY timestamp ASC;
`;

module.exports = {
  readFprimeQuery: readFprimeQuery,
  writeFprimeQuery: writeFprimeQuery,
  createFprimeTableQuery: createFprimeTableQuery,
  createKeyspaceQuery: createKeyspaceQuery,
  createTableQuery: createTableQuery,
  writeQuery: writeQuery,
  readQuery: readQuery,
};
