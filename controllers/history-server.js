// web framework fore nodejs
var express = require('express');
var cassandra = require('./cassandra')

function historyServer() {
    var router = express.Router();

    //allow requesting code from any origin to access the resource
    router.use(function (req, res, next) {
        res.set('Access-Control-Allow-Origin', '*');
        next();
    });
    
    // handle telemetry requests
    router.get('/:telemetryName', function (req, res) {
        var start = req.query.start;
        var end = req.query.end;
        var ids = req.params.telemetryName;

        cassandra.read(ids, start, end).then((result) => {
            var telemetryArray = [] 
            result.rows.forEach((row) => {
                telemetryArray.push({
                    timestamp: row.timestamp,
                    value: row.numericarg,
                    id: row.tmtcname,
                })
            })
            res.status(200).json(telemetryArray).end();
        });
    });
    
    return router;
}

module.exports = historyServer;
