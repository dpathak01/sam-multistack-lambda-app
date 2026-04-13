'use strict';

const { createLogger } = require('/opt/nodejs/shared/logger');
const { ok, internalError } = require('/opt/nodejs/shared/http');
const { ProductService } = require('../services/product-service');

const logger = createLogger(process.env.SERVICE_NAME, process.env.LOG_LEVEL);
const productService = new ProductService(process.env.TABLE_NAME);

exports.handler = async (_, context) => {
  try {
    const products = await productService.listProducts();
    return ok({ items: products, count: products.length });
  } catch (error) {
    logger.error('Unexpected error while listing products.', {
      errorMessage: error.message,
      requestId: context.awsRequestId
    });
    return internalError('Failed to list products.', context.awsRequestId);
  }
};

