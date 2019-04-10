import {FileDescriptions} from '@app/models/printbroker/FileDescriptions';
import {PrintBrokerThumbnail} from '@app/models/printbroker/PrintBrokerThumbnail';

export class PrintBrokerResponse {
  id: string;
  fileDescriptions: FileDescriptions[];
  errorMessage: Array<any>;
  requestHistory: any;
  thumbnails: PrintBrokerThumbnail[];
  convertedFiles: Array<any>;
  requestStatus: string;
  status: string;

  constructor (id: string, fileDescriptions: FileDescriptions[], errorMessage: Array<any>, requestHistory: any,
               thumbnails: PrintBrokerThumbnail[], convertedFiles: Array<any>, requestStatus: string, status: string) {
    this.id = id;
    this.fileDescriptions = fileDescriptions;
    this.errorMessage = errorMessage;
    this.requestHistory = requestHistory;
    this.thumbnails = thumbnails;
    this.convertedFiles = convertedFiles;
    this.requestStatus = requestStatus;
    this.status = status;
  }
}
