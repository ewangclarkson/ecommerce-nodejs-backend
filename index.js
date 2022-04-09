const logger = require('./logger/logger');
require('./logger/config')(logger);
const express = require('express');
require('./database/config/database')();
const app = express();
require('./routes/boot')(app);
const port = process.env.PORT || 8089;

app.listen(port, () => logger.info(`This application is running on port ${port}`));
