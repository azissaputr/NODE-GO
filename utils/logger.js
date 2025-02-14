const CONFIG = require("../config/config");

class Logger {
  constructor(logBox) {
    this.logBox = logBox;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.logBox.log(logMessage);
  }
}

module.exports = Logger;
