export class FileDescriptions {
  id: string;
  fileName: string;
  size: number;
  action: string;
  fileUrl: string;
  fileType: string;

  constructor (id: string, fileName: string, size: number, action: string, fileUrl: string, fileType: string) {
    this.id = id;
    this.fileName = fileName;
    this.size = size;
    this.action = action;
    this.fileUrl = fileUrl;
    this.fileType = fileType;
  }
}
