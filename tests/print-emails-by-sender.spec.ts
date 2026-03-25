import { describe, expect, it, vi } from 'vitest';
import { PrintEmailsBySender } from '../src/application/use-cases/print-emails-by-sender.js';
import { EmailRepository } from '../src/domain/repositories/email-repository.js';
import { Logger } from '../src/infrastructure/logging/logger.js';

describe('PrintEmailsBySender', () => {
  it('prints all email content returned by repository', async () => {
    const repository: EmailRepository = {
      findBySender: vi.fn().mockResolvedValue([
        { id: '1', sender: 'alice@example.com', subject: 'Hello', body: 'First body' },
        { id: '2', sender: 'alice@example.com', subject: 'Update', body: 'Second body' }
      ])
    };

    const logs: string[] = [];
    const logger: Logger = {
      info: (message: string) => logs.push(message)
    };

    const useCase = new PrintEmailsBySender(repository, logger);
    await useCase.execute('alice@example.com');

    expect(repository.findBySender).toHaveBeenCalledWith('alice@example.com');
    expect(logs.join('\n')).toContain('First body');
    expect(logs.join('\n')).toContain('Second body');
  });
});
