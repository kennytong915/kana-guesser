# Game Logic Function

A simple AWS Lambda function that provides random Japanese vocabulary words for flashcard games. It retrieves words from DynamoDB, hides random kana characters, and generates multiple choice options for gameplay.

## Usage

The function accepts a `jlptLevel` query parameter (N1-N5 or "all") and returns 10 random words with hidden characters and answer options.

## Deployment

Deploy as an AWS Lambda function with DynamoDB read permissions and connect to API Gateway for HTTP access. 