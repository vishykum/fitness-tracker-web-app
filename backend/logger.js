require('dotenv').config(); //Load environment variables
const winston = require('winston');

const cmdLogger = winston.createLogger({
    level: (process.env.NODE_ENV == 'production') ? "error" : "debug",
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
});

module.exports = cmdLogger;