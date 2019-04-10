export class LogMessage {
  public level: number;
  public timestamp: string;
  public fileName: string;
  public lineNumber: Number;
  public message: string;
  public user: string;
  public storeNumber: number;
  public fullStoryId: string;

  constructor (level: number, timestamp: string, fileName: string, lineNumber: Number, message: string, user: string,
    storeNumber: number, fullStoryId: string) {

    this.level = level;
    this.timestamp = timestamp;
    this.fileName = fileName;
    this.lineNumber = lineNumber;
    this.message = message;
    this.user = user;
    this.storeNumber = storeNumber;
    this.fullStoryId = fullStoryId;

  }
}
