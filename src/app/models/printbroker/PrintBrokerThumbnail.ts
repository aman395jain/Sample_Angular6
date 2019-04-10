export class PrintBrokerThumbnail {

  fileName: string;
  size: number;
  fileUrl: string;
  page: number;

  constructor (fileName: string, size: number, fileUrl: string, page: number) {
    this.fileName = fileName;
    this.size = size;
    this.fileUrl = fileUrl;
    this.page = page;
  }
}