import { PrintEmailsBySender } from './application/use-cases/print-emails-by-sender.js';
import { GmailEmailRepository } from './infrastructure/gmail/gmail-email-repository.js';
import { ConsoleLogger } from './infrastructure/logging/logger.js';

async function bootstrap(): Promise<void> {
  const sender = process.argv[2];

  if (!sender) {
    throw new Error('Usage: npm run start -- "sender@example.com"');
  }

  const credentialsPath = process.env.GMAIL_CREDENTIALS_PATH;
  const tokenPath = process.env.GMAIL_TOKEN_PATH;

  if (!credentialsPath || !tokenPath) {
    throw new Error('Set GMAIL_CREDENTIALS_PATH and GMAIL_TOKEN_PATH environment variables.');
  }

  const emailRepository = new GmailEmailRepository({
    credentialsPath,
    tokenPath
  });

  const logger = new ConsoleLogger();
  const useCase = new PrintEmailsBySender(emailRepository, logger);

  await useCase.execute(sender);
}

bootstrap().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
