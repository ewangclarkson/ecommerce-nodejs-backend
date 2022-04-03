const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'ecommerce' },
    transports: [
        new winston.transports.File({ filename: './logger/log.log', level: 'error' }),
    ],
});

module.exports = logger;
