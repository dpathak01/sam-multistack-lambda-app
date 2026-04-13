'use strict';

const crypto = require('node:crypto');
const { PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { ValidationError } = require('/opt/nodejs/shared/errors');
const { documentClient } = require('../lib/dynamo-client');

class OrderService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async createOrder(payload) {
    if (!payload || !payload.userId || !Array.isArray(payload.items) || payload.items.length === 0) {
      throw new ValidationError('userId and at least one order item are required.');
    }

    const order = {
      orderId: crypto.randomUUID(),
      userId: payload.userId,
      status: payload.status || 'CREATED',
      items: payload.items,
      totalAmount: Number(payload.totalAmount || 0),
      createdAt: new Date().toISOString()
    };

    await documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: order
      })
    );

    return order;
  }

  async listOrders() {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: this.tableName
      })
    );

    return result.Items || [];
  }
}

module.exports = {
  OrderService
};

