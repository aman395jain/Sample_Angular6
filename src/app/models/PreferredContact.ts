export class PreferredContact {
    public preferredFirstName: string;
    public preferredLastName: string;
    public preferredPhoneNumber: string;
    public preferredCompany: string;
    public preferredEmail: string;
    public preferredContactMode: string;

    constructor( firstName, lastName, phoneNumber, company, email, preferredContactMode) {
        this.preferredFirstName = firstName;
        this.preferredLastName = lastName;
        this.preferredEmail = email;
        this.preferredPhoneNumber = phoneNumber;
        this.preferredCompany = company;
        this.preferredContactMode = preferredContactMode;
    }
}
