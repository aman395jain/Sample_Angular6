export class Recipient {
  public firstName: string;
  public lastName: string;
  public email: string;
  public phoneNumber: string;
  public street1: string;
  public street2: string;
  public city: string;
  public state: string;
  public postalCode: string;
  public country: string;
  public isResidential: boolean;

  constructor (firstName: string, lastName: string, street1: string,
    street2: string, $city: string, state: string, postalCode: string,
    country: string, isResidential: boolean, email: string, phoneNumber: string,
     ) {

    this.firstName = firstName;
    this.lastName = lastName;
    this.street1 = street1;
    this.street2 = street2;
    this.city = $city;
    this.state = state;
    this.postalCode = postalCode;
    this.country = country;
    this.isResidential = isResidential;
    this.email = email;
    this.phoneNumber = phoneNumber;
    }
  }
