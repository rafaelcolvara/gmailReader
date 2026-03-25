# gmailReader

Service to read Gmail messages filtered by sender and print each email content to terminal logs.

## Architecture

This project follows DDD and SOLID by separating:

- **Domain**: email entity and repository contract.
- **Application**: use case orchestration (`PrintEmailsBySender`).
- **Infrastructure**: Gmail API implementation and terminal logger.

## Setup

```bash
npm install
```

## Environment variables

- `GMAIL_CREDENTIALS_PATH`: path to OAuth credentials JSON downloaded from Google Cloud Console.
- `GMAIL_TOKEN_PATH`: path to OAuth token JSON for the authenticated user.

## Run

```bash
npm run start -- "sender@example.com"
```

The service fetches all emails from the provided sender and logs each message content in the terminal.

## Quality checks

```bash
npm run lint
npm test
```
