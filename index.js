require('express-async-errors');
const express = require('express');
const debug = require('debug')('app:dev');
const helmet = require('helmet');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const error = require('./middleware/error');
const config = require('config');
const winston = require('winston');
const logger = require('./logger/logger');


if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

if (!config.get('auth.jwtTokenizer')) {
    logger.log({level: info, message: 'Fatal error,jwt private key not set'});
    process.exit(1);
}
const app = express();
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));
app.use('/api', apiRoutes);
app.use('/', webRoutes);
app.use(error);


const port = process.env.PORT || 8089;

app.listen(port, () => debug(`This application is running on port ${port}`));
