export class enrollmentStatus {

    //model that holds the return data from the rewards enrollment API

    //status code
    public status: string;

    //message
    public message: string;

    //rewards number
    public divdNum: string;

    //coupon code
    public cpnCd: string;

    constructor(status, message, divdNum, cpnCd) {
        this.status = status;
        this.message = message;
        this.divdNum = divdNum;
        this.cpnCd = cpnCd;
    }
}