const fs = require('fs')
const path = require('path')
const configPath = path.join(__dirname, './config.json')

class Config {
    constructor() {
        this.load()
    }
    
    async load() {
        fs.readFile(configPath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    this.reset()
                } else {
                    throw err
                }
            }  else {
                Object.assign(this, JSON.parse(data));
            };
        });
    };

    getConfig () {
        return this
    }

    async update() {
        let data = JSON.stringify(this.getConfig());
        fs.writeFile(configPath, data, (err) => {
            if (err) throw err;
            console.log('Configuration updated');
        });
    }

    async reset() {
        let data = JSON.stringify({});
        fs.writeFile(configPath, data, (err) => {
            if (err) throw err;
            this.load()
        });
    }
}

const config = new Config()
module.exports = config