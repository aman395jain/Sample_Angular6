export class CustomerSearch {
    
    //model to store search fields for customer search page.
  
    //Business Advantage Fields
    public masterAccountNumber: string;
    public company: string;
    
    //Retail Customer Fields
    public rewardsNumber: string;
    public phoneNumber: number;
    public email: string;
    public firstName: string;
    public lastName: string;

    public orderNumber: string;
    
    constructor(masterAccount, contractCompany, rewardsNumber, phoneNumber, email, firstName, lastName, orderNumber){
        this.masterAccountNumber = masterAccount; 
        this.company = contractCompany;
        this.rewardsNumber = rewardsNumber;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName; 
        this.orderNumber = orderNumber;
    }
    
}
