/* Writable stream to capture docker stdout */
const stream = require('stream')
const Docker = require('dockerode')

class RuntimeStream extends stream.Writable {
    constructor() {
        super()
        this.text = ""
    }
    _write(chunk, encoding, next) {
        this.text += chunk.toString()
        next();
    }
}

module.exports = RuntimeStream