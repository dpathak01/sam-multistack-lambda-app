'use strict';

const { createLogger } = require('/opt/nodejs/shared/logger');
const { ok, badRequest, notFound, internalError } = require('/opt/nodejs/shared/http');
const { NotFoundError, ValidationError } = require('/opt/nodejs/shared/errors');
const { CartService } = require('../services/cart-service');

const logger = createLogger(process.env.SERVICE_NAME, process.env.LOG_LEVEL);
const cartService = new CartService(process.env.TABLE_NAME);

exports.handler = async (event, context) => {
  try {
    const cart = await cartService.getCartByUserId(event.queryStringParameters?.userId);
    return ok(cart);
  } catch (error) {
    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details);
    }

    if (error instanceof NotFoundError) {
      return notFound(error.message);
    }

    logger.error('Unexpected error while reading cart.', {
      errorMessage: error.message,
      requestId: context.awsRequestId
    });
    return internalError('Failed to fetch cart.', context.awsRequestId);
  }
};
