import { IStorageProvider, StoredFile } from './storage.interface';

// Fase 2: alternativa de almacenamiento a Google Drive.
export class S3Service implements IStorageProvider {
  async upload(_fileName: string, _content: Buffer, _mimeType: string): Promise<StoredFile> {
    throw new Error('S3Service.upload not implemented');
  }

  async download(_fileId: string): Promise<Buffer> {
    throw new Error('S3Service.download not implemented');
  }

  async delete(_fileId: string): Promise<void> {
    throw new Error('S3Service.delete not implemented');
  }
}
