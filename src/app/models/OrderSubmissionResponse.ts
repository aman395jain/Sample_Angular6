export class OrderSubmissionReponse {

    public pbUrl: string;
    public sbOrderNumber: string;
    public flightDeckJobId:string;
    public fileNames: string[];
    public fileIds: string[];
    public fileName: string[];
    public flightDeckWSResponseMsg: string[];
    public isSdsShip = false;

    constructor(sbOrderNumber) {
        this.sbOrderNumber = sbOrderNumber;
    }



}
