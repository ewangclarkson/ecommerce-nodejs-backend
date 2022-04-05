const winston = require('winston');
const config = require('config');

module.exports=function(logger){
    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston.transports.Console({
            format: winston.format.simple(),
        }));
    }
    if (!config.get('auth.jwtTokenizer')) {
        throw new Error('Fatal error,jwt private key not set');
    }
}