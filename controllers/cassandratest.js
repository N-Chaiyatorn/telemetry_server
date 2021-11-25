const { CassandraDriver } = require('./cassandra.js');
const fs = require('fs')
const path = require('path')
const cassandraDriver = new CassandraDriver('development')

const data = {
    id: 'hi',
    value: 'sup',
    timestamp: Date.now()
}

//cassandraDriver.write(data)

cassandraDriver.read('test', 'a', 894984983, 894984985).then((data) => {
    console.log(data)
})

/*
const writableStream = new fs.createWriteStream(path.join(__dirname, './testlog.txt'))

const errorhandling = () => {
    console.log(
        'Error occurred while piping, closing all streams'
    )
    datum.destroy()
    writableStream.end()
}

datum.on('error', errorhandling)
    .pipe(writableStream).on('error', errorhandling)
*/