export class CustomerInformation {
    public firstname;
    public lastname;
    public email;
    public phoneNumber;
    public address1;
    public address2;
    public echcustomerid;
    public city;
    public state;
    public zip;
    public company;
    public bdpFeedData = {'layerCode': null, 'layerName': null, 'tier': null, 'contractMasterAccountNumber': null };
    public consortiumValue;
    public rewardsNumber;
    public customerNumber;
    public preferredFirstName: string;
    public preferredLastName: string;
    public preferredPhoneNumber: string;
    public preferredCompany: string;
    public preferredEmail: string;
    public contractMasterAccountNumber: string;
    public isContractCustomer = false;
    public isContractCompany = false;

    constructor() {}

    containsFullAddressInfo (): boolean {
      let allFieldsContainInfo = true;
      if ( this.firstname === null || this.firstname === undefined ) {
        allFieldsContainInfo = false;
      } else if ( this.lastname === null || this.lastname === undefined ) {
        allFieldsContainInfo = false;
      } else if ( this.address1 === null || this.address1 === undefined ) {
        allFieldsContainInfo = false;
      } else if ( this.city === null || this.city === undefined ) {
        allFieldsContainInfo = false;
      } else if ( this.state === null || this.state === undefined ) {
        allFieldsContainInfo = false;
      } else if ( this.zip === null || this.zip === undefined ) {
        allFieldsContainInfo = false;
      }
      return allFieldsContainInfo;
    }
}
