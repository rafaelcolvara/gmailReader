import { Email } from '../entities/email.js';

export interface EmailRepository {
  findBySender(sender: string): Promise<Email[]>;
}
