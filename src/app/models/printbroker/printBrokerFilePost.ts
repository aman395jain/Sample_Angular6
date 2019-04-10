export class PrintBrokerFilePost {
    FileId: string;
    FileName: string;
    JobId: string;

    constructor(fileId: string, fileName: string, jobId: string) {
        this.FileId = fileId;
        this.FileName = fileName;
        this.JobId = jobId;
    }
}
