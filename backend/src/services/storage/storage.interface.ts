export interface StoredFile {
  id: string;
  name: string;
  url: string;
}

export interface IStorageProvider {
  upload(fileName: string, content: Buffer, mimeType: string): Promise<StoredFile>;
  download(fileId: string): Promise<Buffer>;
  delete(fileId: string): Promise<void>;
}
