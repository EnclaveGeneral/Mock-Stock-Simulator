import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    QueryCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";

const client = new DynamoDBClient({
    region: "us-west-2",
    credentials: async() => {
        const session = await fetchAuthSession();
        return session.credentials;
    }
});


const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
    USER_PROFILES: "UserProfiles",
    HOLDINGS: "Holdings",
    TRANSACTIONS: "Transactions",
};


async function getUserProfile(userId) {
    const command = new GetCommand({
        TableName: TABLES.USER_PROFILES,
        Key: { userId }
    });

    const response = await docClient.send(command);
    return response.Item;
}

async function createUserProfile(userId, displayUsername, cashBalance) {
    const timeStamp = new Date().toISOString();

    const command = new PutCommand({
        TableName: TABLES.USER_PROFILES,
        Item: {
            userId,
            displayUsername,
            cashBalance: parseFloat(cashBalance),
            createdAt: timeStamp,
            updatedAt: timeStamp
        },
        // Prevent overwriting existing profile
        ConditionExpression: "attribute_not_exists(userId)"
    });

    await docClient.send(command);
    return true;
}

async function updateCashBalance(userId, newBalance) {
    const command = new UpdateCommand({
        TableName: TABLES.USER_PROFILES,
        Key: { userId },
        UpdateExpression: "SET cashBalance = :balance, updatedAt = :timestamp",
        ExpressionAttributeValues: {
            ":balance": parseFloat(newBalance),
            ":timestamp": new Date().toISOString()
        }
    });

    await docClient.send(command);
    return true;

}

async function getUserHoldings(userId) {
    const command = new QueryCommand({
        TableName: TABLES.HOLDINGS,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId,
        }
    });

    const response = await docClient.send(command);
    return response.Items || [];
}

async function checkHolding(userId, symbol) {
    const command = new GetCommand({
        TableName: TABLES.HOLDINGS,
        Key: { userId, symbol}
    });

    const response = await docClient.send(command);
    return response.Item || null;
}

async function updateHolding(userId, symbol, quantity, averageCost) {
  // If quantity is 0 or less, delete the holding
  if (quantity <= 0) {
    const command = new DeleteCommand({
      TableName: TABLES.HOLDINGS,
      Key: { userId, symbol }
    });
    await docClient.send(command);
    return true;
  }

  // Otherwise, update/create the holding
  const command = new PutCommand({
    TableName: TABLES.HOLDINGS,
    Item: {
      userId,
      symbol,
      quantity: parseFloat(quantity),
      averageCost: parseFloat(averageCost),
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return true;
}

// Record a transaction (buy or sell)
async function recordTransaction(userId, symbol, type, quantity, pricePerShare, totalAmount) {
  const command = new PutCommand({
    TableName: TABLES.TRANSACTIONS,
    Item: {
      userId,
      transactionId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      type,  // 'BUY' or 'SELL'
      quantity: parseFloat(quantity),
      pricePerShare: parseFloat(pricePerShare),
      totalAmount: parseFloat(totalAmount),
      createdAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return true;
}

// Get transaction history for a user
async function getUserTransactions(userId) {
  const command = new QueryCommand({
    TableName: TABLES.TRANSACTIONS,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    },
    ScanIndexForward: false  // Most recent first
  });

  const response = await docClient.send(command);
  return response.Items || [];
}


export {
    getUserProfile,
    createUserProfile,
    updateCashBalance,
    getUserHoldings,
    checkHolding,
    updateHolding,
    recordTransaction,
    getUserTransactions,
    TABLES
};

