'use strict';

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function resolveLevel(level) {
  return LEVELS[(level || 'info').toLowerCase()] || LEVELS.info;
}

function write(level, message, meta = {}) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };

  console.log(JSON.stringify(payload));
}

function createLogger(serviceName, logLevel = 'info') {
  const threshold = resolveLevel(logLevel);

  return {
    debug(message, meta) {
      if (threshold <= LEVELS.debug) {
        write('debug', message, { service: serviceName, ...meta });
      }
    },
    info(message, meta) {
      if (threshold <= LEVELS.info) {
        write('info', message, { service: serviceName, ...meta });
      }
    },
    warn(message, meta) {
      if (threshold <= LEVELS.warn) {
        write('warn', message, { service: serviceName, ...meta });
      }
    },
    error(message, meta) {
      if (threshold <= LEVELS.error) {
        write('error', message, { service: serviceName, ...meta });
      }
    }
  };
}

module.exports = {
  createLogger
};

