'use strict';

const { createLogger } = require('/opt/nodejs/shared/logger');
const { ok, internalError } = require('/opt/nodejs/shared/http');
const { OrderService } = require('../services/order-service');

const logger = createLogger(process.env.SERVICE_NAME, process.env.LOG_LEVEL);
const orderService = new OrderService(process.env.TABLE_NAME);

exports.handler = async (_, context) => {
  try {
    const orders = await orderService.listOrders();
    return ok({ items: orders, count: orders.length });
  } catch (error) {
    logger.error('Unexpected error while listing orders.', {
      errorMessage: error.message,
      requestId: context.awsRequestId
    });
    return internalError('Failed to list orders.', context.awsRequestId);
  }
};

