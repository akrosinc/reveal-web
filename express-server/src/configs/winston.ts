import * as winston from 'winston';
import { EXPRESS_MAXIMUM_LOGS_FILE_SIZE, EXPRESS_MAXIMUM_LOG_FILES_NUMBER, EXPRESS_LOGS_FILE_PATH } from './envs';

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: EXPRESS_LOGS_FILE_PATH,
    handleExceptions: true,
    json: true,
    maxsize: EXPRESS_MAXIMUM_LOGS_FILE_SIZE,
    maxFiles: EXPRESS_MAXIMUM_LOG_FILES_NUMBER,
    colorize: false,
    format: winston.format.simple(),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// instantiate a new Winston Logger with the settings defined above
const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file), // output to logs file
    // new winston.transports.File(options.console), // output log to console
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
const winstonStream = {
  write: function(message: string) {
    logger.info(message);
  },
};

export {logger as winstonLogger, winstonStream};
