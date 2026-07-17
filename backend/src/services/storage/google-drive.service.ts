import { IStorageProvider, StoredFile } from './storage.interface';

export class GoogleDriveService implements IStorageProvider {
  async upload(_fileName: string, _content: Buffer, _mimeType: string): Promise<StoredFile> {
    throw new Error('GoogleDriveService.upload not implemented');
  }

  async download(_fileId: string): Promise<Buffer> {
    throw new Error('GoogleDriveService.download not implemented');
  }

  async delete(_fileId: string): Promise<void> {
    throw new Error('GoogleDriveService.delete not implemented');
  }
}
