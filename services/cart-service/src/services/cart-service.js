'use strict';

const crypto = require('node:crypto');
const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { NotFoundError, ValidationError } = require('/opt/nodejs/shared/errors');
const { documentClient } = require('../lib/dynamo-client');

class CartService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async upsertCart(payload) {
    if (!payload || !payload.userId || !Array.isArray(payload.items)) {
      throw new ValidationError('userId and items are required for cart updates.');
    }

    const cart = {
      cartId: payload.cartId || crypto.randomUUID(),
      userId: payload.userId,
      items: payload.items,
      updatedAt: new Date().toISOString()
    };

    await documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: cart
      })
    );

    return cart;
  }

  async getCartByUserId(userId) {
    if (!userId) {
      throw new ValidationError('userId query parameter is required.');
    }

    const result = await documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId }
      })
    );

    if (!result.Item) {
      throw new NotFoundError(`Cart for user ${userId} was not found.`);
    }

    return result.Item;
  }
}

module.exports = {
  CartService
};
