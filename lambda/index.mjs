import * as fs from 'node:fs';
const html = fs.readFileSync('index.html', { encoding: 'utf8' });

// Importing AWS SDK DynamoDB modules
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB client
const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
    console.log(event); // Log the event for debugging purposes
    let modifiedHTML = dynamicForm(html, event.queryStringParameters);

    if (event.queryStringParameters) {
        const item = {
            TableName: "JV-table", // Use your DynamoDB table name
            Item: {
                PK: "form", // Adjust these keys to match your table's schema
                SK: event.requestContext.requestId, // Use a unique identifier for each submission
                formData: event.queryStringParameters
            }
        };

        try {
            // Perform the put operation in DynamoDB
            await docClient.send(new PutCommand(item));
            console.log('DynamoDB Put Result:', item);
        } catch (error) {
            console.error('DynamoDB Error:', error);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'text/plain' },
                body: "Failed to write data to DynamoDB: " + error.message
            };
        }
    }

    // Parameters for the query to retrieve all entries
    const queryParams = {
        TableName: "JV-table",
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": "form"
        }
    };

    try {
        // Perform the query operation in DynamoDB
        const tableQuery = await docClient.send(new QueryCommand(queryParams));
        console.log('DynamoDB Query Result:', tableQuery);
        // Update HTML with the results from the query
        modifiedHTML = dynamictable(modifiedHTML, tableQuery);
    } catch (error) {
        console.error('DynamoDB Query Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/plain' },
            body: "Failed to query data from DynamoDB: " + error.message
        };
    }

    

    // Construct the HTTP response
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html',
        },
        body: modifiedHTML,
    };

    return response;
};

function dynamicForm(html, queryStringParameters) {
    let formResults = '';
    if (queryStringParameters) {
        Object.values(queryStringParameters).forEach(val => {
            formResults += val + ' ';
        });
    }
    return html.replace('{formResults}', `<h4>Form Submission: ${formResults}</h4>`);
}

function dynamictable(html, tableQuery) {
    let table = "";
    // Check if tableQuery.Items exists and has elements
    if (tableQuery.Items && tableQuery.Items.length > 0) {
        for (let i = 0; i < tableQuery.Items.length; i++) {
            table += "<li>" + JSON.stringify(tableQuery.Items[i]) + "</li>";
        }
        table = "<pre>" + table + "</pre>";
    } else {
        // No items found or Items is undefined
        table = "<p>No data found or query failed.</p>";
    }
    return html.replace("{table}", "<h4>DynamoDB Data:</h4>" + table);
}
