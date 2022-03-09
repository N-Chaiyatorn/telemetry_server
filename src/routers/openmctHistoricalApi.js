/**
 * HTTP Server responses with historical data
 * Primarily used for OpenMCT requests
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const express = require("express");

function historyServer(cassandraDriver) {
  const router = express.Router();

  // allow requesting code from any origin to access the resource
  router.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    next();
  });

  // handle telemetry requests
  router.get("/:telemetryName", function (req, res) {
    const start = req.query.start;
    const end = req.query.end;
    const nameId = req.params.telemetryName;
    const telemetryArray = [];
    const tableName = "test"
    
    cassandraDriver.read(tableName, nameId, start, end).then((result) => {
      result.rows.forEach((row) => {
        telemetryArray.push({
          timestamp: row.timestamp,
          value: row.numericarg ? row.numericarg : row.textarg,
          id: row.nameid,
        });
      });
      res.json(telemetryArray).end();
    });
  });

  return router;
}

module.exports = historyServer;
