const mongoose = require('mongoose');
const database = require('config');
const logger =require('../../logger/logger');

init()
    .then(() => logger.info("Connected to mongoDB"));

async function init() {
    await mongoose.connect(database.get('database.host') +
        database.get('database.port') + '/'
        + database.get('database.name')
    );
}


module.exports.db=mongoose;