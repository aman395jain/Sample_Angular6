
export class User {
  static readonly USER_ROLE_EDITQUOTE: string = 'editQuotePrice';
  static readonly USER_ROLE_QUOTEDESK: string = 'quoteDeskView';

  public id: number;
  public loginId: string;
  public firstName: string;
  public lastName: string;
  public roles: string[];
  public name: string;
  public storeNumber: number;
  public build: string;

  constructor($id: number, $loginId: string, $firstName: string, $lastName: string, $roles: string[], name: string, storeNumber: number) {
    this.id = $id;
    this.loginId = $loginId;
    this.firstName = $firstName;
    this.lastName = $lastName;
    this.roles = $roles;
    this.name = name;
    this.storeNumber = storeNumber;
  }

}
