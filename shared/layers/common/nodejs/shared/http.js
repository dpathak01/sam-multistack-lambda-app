'use strict';

function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

function ok(body) {
  return response(200, body);
}

function created(body) {
  return response(201, body);
}

function badRequest(message, details) {
  return response(400, {
    message,
    details
  });
}

function notFound(message) {
  return response(404, { message });
}

function internalError(message, requestId) {
  return response(500, {
    message,
    requestId
  });
}

module.exports = {
  ok,
  created,
  badRequest,
  notFound,
  internalError
};

