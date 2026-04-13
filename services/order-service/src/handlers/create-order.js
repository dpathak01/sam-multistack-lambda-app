'use strict';

const { createLogger } = require('/opt/nodejs/shared/logger');
const { created, badRequest, internalError } = require('/opt/nodejs/shared/http');
const { ValidationError } = require('/opt/nodejs/shared/errors');
const { OrderService } = require('../services/order-service');

const logger = createLogger(process.env.SERVICE_NAME, process.env.LOG_LEVEL);
const orderService = new OrderService(process.env.TABLE_NAME);

exports.handler = async (event, context) => {
  try {
    const payload = event.body ? JSON.parse(event.body) : null;
    const order = await orderService.createOrder(payload);
    logger.info('Order created successfully.', { orderId: order.orderId, requestId: context.awsRequestId });
    return created(order);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return badRequest('Request body must be valid JSON.');
    }

    if (error instanceof ValidationError) {
      return badRequest(error.message, error.details);
    }

    logger.error('Unexpected error while creating order.', {
      errorMessage: error.message,
      requestId: context.awsRequestId
    });
    return internalError('Failed to create order.', context.awsRequestId);
  }
};

