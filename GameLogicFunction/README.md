# 🎌 Japanese Flashcards Game Logic Function

A serverless AWS Lambda function that provides random Japanese vocabulary words for flashcard games with hidden kana characters and multiple choice options.

## 🚀 Features

- **Random Word Retrieval**: Get 10 random Japanese words from DynamoDB
- **JLPT Level Support**: Filter by specific JLPT levels (N1-N5) or get mixed levels
- **Intelligent Kana Hiding**: Randomly hide hiragana/katakana characters for game play
- **Script-Aware Options**: Generate multiple choice options matching the hidden character's script type
- **Efficient Caching**: Table counts cached for 24 hours to minimize database calls
- **CORS Enabled**: Ready for web and mobile app integration

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [API Usage](#api-usage)
- [Game Logic](#game-logic)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Testing](#testing)
- [Performance](#performance)
- [Contributing](#contributing)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│  Lambda Function │───▶│    DynamoDB     │
│                 │    │  (Game Logic)    │    │  (Word Tables)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │              ┌────────┴────────┐
        │                       │              │ JapaneseWords_* │
        │                       │              │   - All         │
        │                       │              │   - N1          │
        │                       │              │   - N2          │
        │                       │              │   - N3          │
        │                       │              │   - N4          │
        │                       │              │   - N5          │
        │                       │              └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Frontend App  │    │   CloudWatch    │
│  (React/Mobile) │    │     Logs        │
└─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Node.js 18.x runtime environment
- DynamoDB tables (see [Database Schema](#database-schema))
- IAM role with required permissions

### Required AWS Services
- **AWS Lambda**: Function execution
- **Amazon DynamoDB**: Word storage
- **Amazon API Gateway**: REST API endpoint
- **AWS CloudWatch**: Logging and monitoring

## ⚙️ Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd JapaneseFlashcards/GameLogicFunction
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure AWS Permissions

Create an IAM role for your Lambda function with these policies:

**Managed Policies:**
- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBReadOnlyAccess`

**Custom Policy (if using specific tables):**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:BatchGetItem",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/JapaneseWords_*"
            ]
        }
    ]
}
```

### 4. Create DynamoDB Tables

You need 6 tables with simple primary key structure:

| Table Name | Primary Key | Type |
|------------|-------------|------|
| `JapaneseWords_All` | `id` | Number |
| `JapaneseWords_N1` | `id` | Number |
| `JapaneseWords_N2` | `id` | Number |
| `JapaneseWords_N3` | `id` | Number |
| `JapaneseWords_N4` | `id` | Number |
| `JapaneseWords_N5` | `id` | Number |

### 5. Deploy Lambda Function

#### Option A: AWS Console
1. Create new Lambda function
2. Upload `function.zip` or copy `index.js` content
3. Set runtime to Node.js 18.x
4. Configure execution role
5. Set timeout to 30 seconds

#### Option B: AWS CLI
```bash
# Package function
zip -r function.zip index.js node_modules/

# Deploy
aws lambda create-function \
  --function-name japanese-flashcards \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30
```

### 6. Setup API Gateway

1. Create new REST API
2. Create GET method on root resource (`/`)
3. Set integration type to "Lambda Function"
4. Enable "Use Lambda Proxy integration"
5. Deploy to stage (e.g., `prod`)

## 🎮 API Usage

### Base URL
```
https://your-api-id.execute-api.region.amazonaws.com/stage/
```

### Get Random Words
```bash
# Default (N5 level)
GET /

# Specific JLPT level
GET /?jlptLevel=N3

# All levels mixed
GET /?jlptLevel=all
```

### Response Format
```json
{
  "success": true,
  "count": 10,
  "level": "N3",
  "words": [
    {
      "id": 184,
      "meaning": "calendar",
      "expression": "カレンダー",
      "reading": "カレンダー",
      "level": "N3",
      "hiddenReading": "_レンダー",
      "correctChar": "カ",
      "options": ["カ", "ダ", "ヴ", "レ"]
    }
  ]
}
```

## 🧠 Game Logic

### Kana Parsing Algorithm
```javascript
// Input: "きゃく" (customer)
// Output: ["きゃ", "く"]
parseKanaUnits("きゃく")
```

The function intelligently parses Japanese text:
- **Digraphs**: きゃ, しゅ, ちょ → Single logical units
- **Long Vowels**: ー preserved but not hidden
- **Mixed Scripts**: Handles hiragana + katakana combinations

### Character Hiding Logic
1. Parse reading into kana units
2. Filter to only hideable characters (hiragana/katakana)
3. Randomly select one unit to hide
4. Replace with single underscore `_`
5. Preserve all non-kana characters (ー, 〜, etc.)

### Option Generation
- Generate 3 random options matching the script type
- Add correct character as 4th option
- Shuffle all options randomly
- Ensure no duplicates

## 💾 Database Schema

### Word Object Structure
```json
{
  "id": 184,
  "expression": "カレンダー",
  "reading": "カレンダー", 
  "meaning": "calendar",
  "level": "N3"
}
```

### Table Distribution Strategy
- **Separate tables per level**: Enables simple random ID generation
- **Combined "All" table**: Pre-mixed for cross-level games
- **Simple primary keys**: Avoids composite key complexity
- **Numeric IDs**: Sequential numbering for range-based random selection

## 🚀 Deployment

### Automated Deployment
```bash
# Build and deploy
npm run build
npm run deploy
```

### Manual Deployment
```bash
# Create deployment package
zip -r function.zip index.js node_modules/

# Update function code
aws lambda update-function-code \
  --function-name japanese-flashcards \
  --zip-file fileb://function.zip
```

### Environment Variables (Optional)
```bash
# Set custom cache duration (default: 24 hours)
CACHE_DURATION_MS=86400000

# Set default word count (default: 10)
DEFAULT_WORD_COUNT=10
```

## 🧪 Testing

### Local Testing
```javascript
// Test event
const testEvent = {
  queryStringParameters: {
    jlptLevel: 'N3'
  }
};

// Run locally
const result = await handler(testEvent);
console.log(result);
```

### AWS Console Testing
1. Go to Lambda function
2. Create test event:
```json
{
  "queryStringParameters": {
    "jlptLevel": "N3"
  }
}
```
3. Click "Test"

### API Gateway Testing
```bash
# Test specific level
curl "https://your-api-url/prod?jlptLevel=N2"

# Test all levels
curl "https://your-api-url/prod?jlptLevel=all"

# Test default
curl "https://your-api-url/prod"
```

## ⚡ Performance

### Optimization Features
- **In-memory caching**: Table counts cached for 24 hours
- **Batch operations**: Uses `batchGetItem` for efficient retrieval
- **Random ID generation**: Avoids expensive `scan` operations
- **Minimal payload**: ~2-5KB response size

### Performance Metrics
- **Cold start**: ~1-2 seconds
- **Warm execution**: ~200-500ms
- **Memory usage**: ~64MB
- **Timeout**: 30 seconds (configurable)

### Scaling Considerations
- **Concurrent executions**: Default AWS limits apply
- **DynamoDB throughput**: Monitor read capacity units
- **API Gateway limits**: 10,000 requests/second default
- **Lambda costs**: ~$0.0000002 per 100ms execution

## 🐛 Troubleshooting

### Common Issues

#### "Missing Authentication Token"
- **Cause**: API Gateway method not configured correctly
- **Fix**: Ensure GET method exists on root resource with Lambda proxy integration

#### "Key element does not match schema"
- **Cause**: DynamoDB key type mismatch
- **Fix**: Ensure IDs are numbers, not strings

#### "Access denied" errors
- **Cause**: Insufficient IAM permissions
- **Fix**: Add DynamoDB read permissions to execution role

#### No words returned
- **Cause**: Empty tables or invalid level
- **Fix**: Verify table data and use valid JLPT levels (N1-N5, all)

### Debug Mode
Enable detailed logging by uncommenting debug statements in `index.js`:
```javascript
// console.log('Debug info:', debugData);
```

## 📈 Monitoring

### CloudWatch Metrics
- **Invocations**: Function call count
- **Duration**: Execution time
- **Errors**: Error rate and types
- **Throttles**: Concurrent execution limits

### Custom Metrics
```javascript
// Add custom metrics (optional)
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

await cloudwatch.putMetricData({
  Namespace: 'JapaneseFlashcards',
  MetricData: [{
    MetricName: 'WordsRetrieved',
    Value: wordCount,
    Unit: 'Count'
  }]
}).promise();
```

## 🤝 Contributing

### Development Setup
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Style
- Use ES6+ features
- Follow AWS Lambda best practices
- Add error handling for all operations
- Document complex logic

### Testing Guidelines
- Test all JLPT levels
- Verify kana parsing edge cases
- Check error handling paths
- Validate response format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- JLPT vocabulary data sources
- AWS serverless architecture patterns
- Japanese language processing libraries

## 📞 Support

For issues and questions:
1. Check [troubleshooting section](#troubleshooting)
2. Review CloudWatch logs
3. Create GitHub issue with details

---

**Built with ❤️ for Japanese language learners** 🎌 