/**
 * Sink classes pipeline the data from source to desired sink
 * The data transformation and logging function will also invoked here
 *
 * @param { Object } sourceObject - Source class's object
 * @param { Object } transformer - (Optional) Transformer class's object
 * @param { Object } databaseDriver - (Optional) DatabaseDriver class's object
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

class OpenMctSink {
  constructor(sourceObject, transformer, databaseDriver) {
    this.sourceObject = sourceObject;
    this.transformer = transformer || null;
    this.databaseDriver = databaseDriver || null;
    this.listeners = [];
    this.dataArray = [];
    this.pipeline();
  }

  // to update every time new data comes in
  pipeline() {
    this.sourceObject.interface.on("received", (data) => {
      if (this.transformer) {
        const jsonDataArray = this.transformer(data);
        jsonDataArray.forEach((data) => {
          this.dataArray.push(data);
        });
      } else {
        this.dataArray.push(data);
      }
      this.sendData();
    });
  }

  sendData() {
    for (let i = this.dataArray.length - 1; i >= 0; i--) {
      const data = this.dataArray[i];
      console.log(data);
      if (this.databaseDriver) this.databaseDriver.write(data);
      this.notify(data);
      this.dataArray.pop();
    }
  }

  // notifiy function, called in generate Telemetry, notifies listeners
  notify(point) {
    this.listeners.forEach(function (l) {
      l(point);
    });
  }

  // manages listeners for realtime telemetry
  listen(listener) {
    this.listeners.push(listener);
    return function () {
      this.listeners = this.listeners.filter(function (l) {
        return l !== listener;
      });
    }.bind(this);
  }
}

module.exports = {
  OpenMctSink: OpenMctSink,
};
