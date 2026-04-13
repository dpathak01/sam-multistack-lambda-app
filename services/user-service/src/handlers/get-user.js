'use strict';

const { createLogger } = require('/opt/nodejs/shared/logger');
const { ok, badRequest, notFound, internalError } = require('/opt/nodejs/shared/http');
const { NotFoundError, ValidationError } = require('/opt/nodejs/shared/errors');
const { UserService } = require('../services/user-service');

const logger = createLogger(process.env.SERVICE_NAME, process.env.LOG_LEVEL);
const userService = new UserService(process.env.TABLE_NAME);

exports.handler = async (event, context) => {
  try {
    const user = await userService.getUserById(event.pathParameters?.id);
    return ok(user);
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details);
    }

    if (error instanceof NotFoundError) {
      return notFound(error.message);
    }

    logger.error('Unexpected error while reading user.', {
      errorMessage: error.message,
      requestId: context.awsRequestId
    });
    return internalError('Failed to fetch user.', context.awsRequestId);
  }
};

