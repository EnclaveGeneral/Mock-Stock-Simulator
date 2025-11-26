import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    QueryCommand,

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

async function checkUserProfileExists(userId) {
    try {
        const command = new GetCommand({
            TableName: TABLES.USER_PROFILES,
            Key: { userId }
        });

        const response = await docClient.send(command);
        return response.Item !== undefined;

    } catch (error) {
        throw error;
    }
}

async function getUserProfile(userId) {
    try {
        const command = new GetCommand({
            TableName: TABLES.USER_PROFILES,
            Key: { userId }
        });

        const response = await docClient.send(command);
        return response.Item !== undefined; 

    } catch (error) {
        throw error; 
    }
}

async function createUserProfile(userId, displayUsername, cashBalance) {
    try {
        const timestamp = new Date().toISOString();

        const command = new PutCommand({
            TableName: TABLES.USER_PROFILES,
            Item: {
                userId,
                displayUsername,
                cashBalance: parseFloat(cashBalance),
                createdAt: timestamp,
                updateAt: timestamp, 
            },
            ConditionExpression: "attribute_not_exists(userId)"
        });

        await docClient.send(command);
        return true; 
    } catch (error) {
        
    }
}

