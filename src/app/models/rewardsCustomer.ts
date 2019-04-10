export class rewardsCustomer {

    //model to store the data for a rewards enrollment customer

    //customer fields
    public firstname: string;
    public lastname: string;
    public phoneNumber: string;
    public email: string;
    public company: string;
    public address1: string;
    public address2: string;
    public city: string;
    public state: string;
    public zip: string;

    //business fields
    public storeNumber: string;
    public associateNumber: string;
    
    //rewards program account type
    public account: string;

    constructor(firstname, lastname, phoneNumber, email, company, address1, address2,
                city, state, zip, storeNumber, associateNumber, account) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.company = company;
        this.address1 = address1;
        this.address2 = address2;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.storeNumber = storeNumber;
        this.associateNumber = associateNumber;
        this.account = account;
    }
}