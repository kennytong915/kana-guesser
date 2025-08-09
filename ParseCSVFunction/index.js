const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { parse } = require('csv-parse');

exports.handler = async (event) => {
    const bucket = 'japanese-flashcards-csv';
    const files = ['n5.csv', 'n4.csv', 'n3.csv', 'n2.csv', 'n1.csv'];
    const tableName = 'JapaneseWords_All';
    
    let globalIdCounter = 1; // Global counter for all records
    const allRecords = [];

    for (const file of files) {
        const level = file.split('.')[0].toUpperCase();
        console.log(`Processing file: ${file}, level: ${level}, table: ${tableName}`);
        const params = { Bucket: bucket, Key: file };
        
        try {
            const data = await s3.getObject(params).promise();
            const csvData = data.Body.toString('utf-8');

            // Parse CSV and collect records
            const records = [];
            const parser = parse(csvData, { columns: true, skip_empty_lines: true });

            parser.on('readable', () => {
                let record;
                while ((record = parser.read())) {
                    records.push({
                        id: globalIdCounter++, // Use global incremented ID as primary key
                        level,
                        expression: record.expression,
                        reading: record.reading,
                        meaning: record.meaning
                    });
                }
            });

            await new Promise((resolve, reject) => {
                parser.on('end', resolve);
                parser.on('error', reject);
            });

            // Add records to global collection
            allRecords.push(...records);
            
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
            throw err;
        }
    }

    // Deduplicate records by expression and level across all files
    const uniqueMap = new Map();
    const duplicates = [];
    for (const rec of allRecords) {
        const uniqueKey = `${rec.level}-${rec.expression}`;
        if (uniqueMap.has(uniqueKey)) {
            duplicates.push(rec);
        } else {
            uniqueMap.set(uniqueKey, rec);
        }
    }
    
    if (duplicates.length > 0) {
        console.log(`Skipped ${duplicates.length} duplicates across all files`);
    }

    // Prepare items for DynamoDB batchWrite
    const uniqueRecords = Array.from(uniqueMap.values()).map(rec => ({
        PutRequest: { Item: rec }
    }));

    // Split into chunks of 25 and write to the single table
    const chunkSize = 25;
    for (let i = 0; i < uniqueRecords.length; i += chunkSize) {
        const chunk = uniqueRecords.slice(i, i + chunkSize);
        console.log(`Writing ${chunk.length} items to ${tableName}`);
        await dynamodb.batchWrite({
            RequestItems: { [tableName]: chunk }
        }).promise();
    }

    console.log(`Total unique items processed: ${uniqueRecords.length}`);
    console.log(`Item IDs range from 1 to ${globalIdCounter - 1}`);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'CSV files parsed and stored in JapaneseWords_All table',
            totalItems: uniqueRecords.length,
            idRange: { min: 1, max: globalIdCounter - 1 }
        })
    };
};