import { EmailRepository } from '../../domain/repositories/email-repository.js';
import { Logger } from '../../infrastructure/logging/logger.js';

export class PrintEmailsBySender {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly logger: Logger
  ) {}

  async execute(sender: string): Promise<void> {
    if (!sender.trim()) {
      throw new Error('Sender is required.');
    }

    const emails = await this.emailRepository.findBySender(sender);

    if (emails.length === 0) {
      this.logger.info(`No emails found for sender: ${sender}`);
      return;
    }

    emails.forEach((email, index) => {
      this.logger.info(`Email #${index + 1}`);
      this.logger.info(`ID: ${email.id}`);
      this.logger.info(`From: ${email.sender}`);
      this.logger.info(`Subject: ${email.subject || '(no subject)'}`);
      this.logger.info(`Body:\n${email.body || '(empty body)'}`);
      this.logger.info('---');
    });
  }
}
