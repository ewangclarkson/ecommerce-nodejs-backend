const mongoose = require('mongoose');
const config = require('config');
const logger = require('../../logger/logger');

module.exports = function () {
    init()
        .then(() => logger.info("Connected to mongoDB"));

};


async function init() {
    await mongoose.connect(config.get('database.appDB'));
}
