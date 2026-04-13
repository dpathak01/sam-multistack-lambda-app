'use strict';

const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { documentClient } = require('../lib/dynamo-client');

class ProductService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async listProducts() {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: this.tableName
      })
    );

    return result.Items || [];
  }
}

module.exports = {
  ProductService
};

