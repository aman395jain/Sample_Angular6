export class CreateWesLeadAPI {

    public  customerFirstName: string;
    public  customerLastName: string;
    public  echcustomerid: string;
    public  comments: string;
    public  preferredContactMode: string;
    public  bestTimeToCall: string;
    public  projectDueInHands: string;
    public  associateInitials: string;
    public  company: string;
    public  customerPhoneNumber: string;
    public  customerEmail: string;
    public  storeNumber: string;
    public  rewardsNumber: string;
    public  pricingIssue: boolean;

    constructor($customerFirstName: string, $customerLastName: string, $echcustomerid: string, $comments: string,
         $preferredContactMode: string, $bestTimeToCall: string, $projectDueInHands: string,
          $associateInitials: string, $company: string, $customerPhoneNumber: string, $customerEmail: string,
          $storeNumber: string, $rewardsNumber: string, $pricingIssue: boolean) {
        this.customerFirstName = $customerFirstName;
        this.customerLastName = $customerLastName;
        this.echcustomerid = $echcustomerid;
        this.comments = $comments;
        this.preferredContactMode = $preferredContactMode;
        this.bestTimeToCall = $bestTimeToCall;
        this.projectDueInHands = $projectDueInHands;
        this.associateInitials = $associateInitials;
        this.company = $company;
        this.customerPhoneNumber = $customerPhoneNumber;
        this.customerEmail = $customerEmail;
        this.storeNumber = $storeNumber;
        this.rewardsNumber = $rewardsNumber;
        this.pricingIssue = $pricingIssue;
    }

}
