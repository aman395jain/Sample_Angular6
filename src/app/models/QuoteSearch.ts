export class QuoteSearch {

    //model used to search for quotes in the manage quotes page

    public company: string;
    public lastName: string;
    public quoteNumber: string;
    public status: string[];

    constructor(company, lastName, quoteNumber, status) {
        this.company = company;
        this.lastName = lastName;
        this.quoteNumber = quoteNumber;
        this.status = status;
    }
}