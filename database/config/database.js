const mongoose = require('mongoose');
const database = require('config');
const logger = require('../../logger/logger');

module.exports = function () {
    init()
        .then(() => logger.info("Connected to mongoDB"));

};

async function init() {
    await mongoose.connect(database.get('database.db'));
}
