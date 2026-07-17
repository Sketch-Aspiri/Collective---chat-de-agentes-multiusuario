import { IStorageProvider, StoredFile } from './storage.interface';

export class GoogleDriveService implements IStorageProvider {
  async upload(): Promise<StoredFile> {
    throw new Error('GoogleDriveService.upload not implemented');
  }

  async download(): Promise<Buffer> {
    throw new Error('GoogleDriveService.download not implemented');
  }

  async delete(): Promise<void> {
    throw new Error('GoogleDriveService.delete not implemented');
  }
}
