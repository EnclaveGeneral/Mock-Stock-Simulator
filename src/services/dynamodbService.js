import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Update } from "@mui/icons-material";
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

export {
    getUserProfile,
    createUserProfile,
    updateCashBalance,
    TABLES
};

