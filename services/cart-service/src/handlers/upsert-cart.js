'use strict';

const { createLogger } = require('/opt/nodejs/shared/logger');
const { created, badRequest, internalError } = require('/opt/nodejs/shared/http');
const { ValidationError } = require('/opt/nodejs/shared/errors');
const { CartService } = require('../services/cart-service');

const logger = createLogger(process.env.SERVICE_NAME, process.env.LOG_LEVEL);
const cartService = new CartService(process.env.TABLE_NAME);

exports.handler = async (event, context) => {
  try {
    const payload = event.body ? JSON.parse(event.body) : null;
    const cart = await cartService.upsertCart(payload);
    return created(cart);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return badRequest('Request body must be valid JSON.');
    }

    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details);
    }

    logger.error('Unexpected error while writing cart.', {
      errorMessage: error.message,
      requestId: context.awsRequestId
    });
    return internalError('Failed to update cart.', context.awsRequestId);
  }
};

