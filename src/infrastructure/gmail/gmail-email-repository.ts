import { readFileSync } from 'node:fs';
import { gmail_v1, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Email } from '../../domain/entities/email.js';
import { EmailRepository } from '../../domain/repositories/email-repository.js';

interface GmailEmailRepositoryProps {
  credentialsPath: string;
  tokenPath: string;
  userId?: string;
}

interface InstalledCredentials {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}

interface CredentialsFile {
  installed?: InstalledCredentials;
  web?: InstalledCredentials;
}

export class GmailEmailRepository implements EmailRepository {
  private readonly gmail: gmail_v1.Gmail;
  private readonly userId: string;

  constructor({ credentialsPath, tokenPath, userId = 'me' }: GmailEmailRepositoryProps) {
    this.gmail = this.createClient(credentialsPath, tokenPath);
    this.userId = userId;
  }

  async findBySender(sender: string): Promise<Email[]> {
    const query = `from:${sender}`;

    const listResponse = await this.gmail.users.messages.list({
      userId: this.userId,
      q: query,
      maxResults: 100
    });

    const messages = listResponse.data.messages ?? [];

    const parsedEmails = await Promise.all(
      messages.map(async (message) => {
        if (!message.id) {
          return null;
        }

        const messageResponse = await this.gmail.users.messages.get({
          userId: this.userId,
          id: message.id,
          format: 'full'
        });

        return this.mapMessageToEmail(messageResponse.data);
      })
    );

    return parsedEmails.filter((item): item is Email => item !== null);
  }

  private createClient(credentialsPath: string, tokenPath: string): gmail_v1.Gmail {
    const rawCredentials = readFileSync(credentialsPath, 'utf-8');
    const credentials = JSON.parse(rawCredentials) as CredentialsFile;
    const key = credentials.installed ?? credentials.web;

    if (!key) {
      throw new Error('Invalid credentials file format. Expected installed or web OAuth credentials.');
    }

    const oauth2Client = new OAuth2Client(key.client_id, key.client_secret, key.redirect_uris[0]);

    const rawToken = readFileSync(tokenPath, 'utf-8');
    oauth2Client.setCredentials(JSON.parse(rawToken));

    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  private mapMessageToEmail(message: gmail_v1.Schema$Message): Email | null {
    const id = message.id;

    if (!id) {
      return null;
    }

    const headers = message.payload?.headers ?? [];
    const sender = headers.find((header) => header.name?.toLowerCase() === 'from')?.value ?? '';
    const subject = headers.find((header) => header.name?.toLowerCase() === 'subject')?.value ?? '';

    const body = this.extractBody(message.payload);

    return {
      id,
      sender,
      subject,
      body
    };
  }

  private extractBody(payload?: gmail_v1.Schema$MessagePart): string {
    if (!payload) {
      return '';
    }

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    const parts = payload.parts ?? [];

    for (const part of parts) {
      const partBody = this.extractBody(part);
      if (partBody) {
        return partBody;
      }
    }

    return '';
  }
}
