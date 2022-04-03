const mongoose = require('mongoose');
const debug = require('debug')('app:dev');
const database = require('config');

init()
    .then(() => debug("Connected to mongoDB"))
    .catch((error) => debug(error.message));

async function init() {
    await mongoose.connect(database.get('database.host') +
        database.get('database.port') + '/'
        + database.get('database.name')
    );
}


module.exports.db=mongoose;