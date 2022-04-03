const logger = require('../logger/logger');

module.exports=function (e,req,resp,next){
    logger.error(e.message,e);
    resp.status(500).send(e.message);
}