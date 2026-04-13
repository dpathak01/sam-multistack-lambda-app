'use strict';

const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { NotFoundError, ValidationError } = require('/opt/nodejs/shared/errors');
const { documentClient } = require('../lib/dynamo-client');

class UserService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getUserById(userId) {
    if (!userId) {
      throw new ValidationError('A user id is required.');
    }

    const result = await documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId }
      })
    );

    if (!result.Item) {
      throw new NotFoundError(`User ${userId} was not found.`);
    }

    return result.Item;
  }
}

module.exports = {
  UserService
};

