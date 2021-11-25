class OpenMctSink {
  constructor (sourceObject, transformer=null, packeter=null, databaseDriver=null) {
    this.sourceObject = sourceObject
    this.transformer = transformer
    this.packeter = packeter
    this.databaseDriver = databaseDriver
    this.listeners = []
    this.dataArray = []
    this.pipeline()
  }

  // to update every time new data comes in
  pipeline () {
    if (this.sourceObject.type === 'serialPort') {
      this.sourceObject.getSerialPort().on('data', (data) => {
        if (this.transformer) {
          const jsonDataArray = this.transformer(data)
          jsonDataArray.forEach((data) => {
            this.dataArray.push(data)
          })
        } else {
          this.dataArray.push(data)
        }
        this.sendData()
      })
    }
    if (this.sourceObject.type === 'socketServer') {
      this.sourceObject.getSocket().on('data', (data) => {
        if (this.transformer) {
          const jsonDataArray = this.transformer(data)
          jsonDataArray.forEach((data) => {
            this.dataArray.push(data)
          })
        } else {
          this.dataArray.push(data)
        }
        this.sendData()
      })
    }
    if (this.sourceObject.type === 'socketClient') {
      this.sourceObject.emitter.on('received', (data) => {
        if (this.transformer) {
          const jsonDataArray = this.transformer(data)
          jsonDataArray.forEach((data) => {
            this.dataArray.push(data)
          })
        } else {
          this.dataArray.push(data)
        }
        this.sendData()
      })
    }
  }

  sendData () {
    for (let i = this.dataArray.length - 1; i >= 0; i--) {
      let data = null
      if (this.packeter) { 
        data = this.packeter(this.dataArray[i]) 
      } else {
        data = this.dataArray[i]
      }
      if (this.databaseDriver) this.databaseDriver.write(data)
      this.notify(data)
      this.dataArray.pop()
    }
  }

  // notifiy function, called in generate Telemetry, notifies listeners
  notify (point) {
    this.listeners.forEach(function (l) {
      l(point)
    })
  }

  // manages listeners for realtime telemetry
  listen (listener) {
    this.listeners.push(listener)
    return function () {
      this.listeners = this.listeners.filter(function (l) {
        return l !== listener
      })
    }.bind(this)
  }
}

module.exports = {
  OpenMctSink: OpenMctSink
}
