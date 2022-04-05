require('express-async-errors');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'ecommerce'},
    transports: [
        new winston.transports.File({
            filename: './logger/log.log',
            level: 'error',
            handleExceptions: true,
            handleRejections: true
        })
    ]
});

module.exports = logger;
