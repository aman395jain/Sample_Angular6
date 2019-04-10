export class JobInput {

    public fileFullName: string;
    public fileName: string;
    public isHardcopy: string;
    public isSavedToMps: string;
    public notes: string;
    public provideToCustomer: string;
    public isDigitalSD: string;
    public isActive: string;
    public fileId: string;

    constructor(fileFullName: string, fileName: string, isHardcopy: string , isSavedToMps: string, notes: string,
                provideToCustomer: string, isDigitalSD: string, isActive: string, fileId: string) {
        this.fileFullName = fileFullName;
        this.fileName = fileName;
        this.isHardcopy = isHardcopy;
        this.isSavedToMps = isSavedToMps;
        this.notes = notes;
        this.provideToCustomer = provideToCustomer;
        this.isDigitalSD = isDigitalSD;
        this.isActive = isActive;
        this.fileId = fileId;
    }

}
