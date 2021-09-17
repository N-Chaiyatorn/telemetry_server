const cassandra = require('./controllers/cassandra');

var telemetryArray = []

cassandra.read('BD_Cycles', 1531260772865, 1731262572865).then((result) => {
    result.rows.forEach((row) => {
        telemetryArray.push({
            timestamp: row.timestamp,
            value: row.numericarg,
            id: row.tmtcname,
        })
    })
    console.log(telemetryArray)
})

