
export class CustomerObject {
  public rewardsNumber: string;
  public consortiumValue: string;
  public layerCode: string;
  public layerName: string;
  public echCustomerId: string;
  public customerId: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public phoneNumber: string;
  public address1: string;
  public address2: string;
  public city: string;
  public state: string;
  public zipcode: string;
  public customerNumber: string;
  public preferredFirstName: string;
  public preferredLastName: string;
  public preferredEmail: string;
  public preferredPhoneNumber: string;
  public company: string;
  public preferredCompany: string;
  public tier: string;
  public masterAccountNumber: string;
  public isContractCustomer = false;
  public yearlySpend: string;
  public industryType: string;
  public preferredContactMode: string;

  public constructor() {
  }

  containsFullInfo (): boolean {
    let allFieldsContainInfo = true;
    if ( this.firstName === null || this.firstName === undefined ) {
      allFieldsContainInfo = false;
    } else if ( this.lastName === null || this.lastName === undefined ) {
      allFieldsContainInfo = false;
    } else if ( this.address1 === null || this.address1 === undefined ) {
      allFieldsContainInfo = false;
    } else if ( this.city === null || this.city === undefined ) {
      allFieldsContainInfo = false;
    } else if ( this.state === null || this.state === undefined ) {
      allFieldsContainInfo = false;
    } else if ( this.zipcode === null || this.zipcode === undefined ) {
      allFieldsContainInfo = false;
    }
    return allFieldsContainInfo;
  }

  populateFieldsFromEchObject(echCustomer: any): CustomerObject {
    // we need to consolidate our cust models. We have two that look like they
    // have almost the same fields
    const customer = new CustomerObject();
    this.firstName = echCustomer.firstname;
    this.lastName = echCustomer.lastname;
    this.address1 = echCustomer.address1;
    this.address2 = echCustomer.address2;
    this.rewardsNumber = echCustomer.rewardsNumber;
    // this.masterAccountNumber = echCustomer
    // this.layerCode = echCustomer
    // this.lastName = echCustomer
    // this.preferredCompany = echCustomer
    // this.preferredEmail = echCustomer
    // this.preferredFirstName = echCustomer
    // this.preferredLastName = echCustomer



    return customer;
  }

}
