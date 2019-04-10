export class OrderTicket {
    // Model to store Order Ticket fields for printing.

    public customerLastName: string;
    public customerFirstName: string;
    public dueDate: string;
    public orderNo: string;
    public orderCreationDate: string;
    public customerPreferredContactNo: string;
    public preferredEmail: string;
    public customerRewardNumber: string;
    public customerCompany: string;
    public jobs: string;
    public jobDueDate: any;
    public unitPrice: string;
    public totalQuantity: string;
    public totalOrderPrice: string;
    public discountPrice: string;
    public totalDiscountOnOrder: number;
    public totalOrderDiscountedPrice: string;
    public coupons = [];
    public preferredContactMode: string;
    public printBarcodeOff: boolean;
    public bdpTier: string;
    public customerPhoneNumber: string;
    public contractCustomer: boolean;
    public formattedContractTotal: string;
    public isDiscounted: boolean;
    public bdpPriceCallSuccess: boolean;
    public bdpEnrolled;
    public rewardsEnrolled;
    public isbdpPriceCallSuccess;

    constructor(customerLastName, customerFirstName, dueDate, orderNo, orderCreationDate, customerPreferredContactNo,
            preferredEmail, customerRewardNumber, customerCompany, jobs, jobDueDate, unitPrice, totalQuantity,
            totalOrderPrice, discountPrice, totalDiscountOnOrder, totalOrderDiscountedPrice, coupons, preferredContactMode,
            printBarcodeOff, bdpTier, customerPhoneNumber, contractCustomer, formattedContractTotal, isDiscounted,
            bdpPriceCallSuccess) {
        this.customerLastName = customerLastName;
        this.customerFirstName = customerFirstName;
        this.dueDate = dueDate;
        this.orderNo = orderNo;
        this.orderCreationDate = orderCreationDate;
        this.customerPreferredContactNo = customerPreferredContactNo;
        this.preferredEmail = preferredEmail;
        this.customerRewardNumber = customerRewardNumber;
        this.customerCompany = customerCompany;
        this.jobs = jobs;
        this.jobDueDate = jobDueDate;
        this.unitPrice = unitPrice;
        this.totalQuantity = totalQuantity;
        this.totalOrderPrice = totalOrderPrice;
        this.discountPrice = discountPrice;
        this.totalDiscountOnOrder = totalDiscountOnOrder;
        this.totalOrderDiscountedPrice = totalOrderDiscountedPrice;
        this.coupons = coupons;
        this.preferredContactMode = preferredContactMode;
        this.printBarcodeOff = printBarcodeOff;
        this.bdpTier = bdpTier;
        this.customerPhoneNumber = customerPhoneNumber;
        this.contractCustomer = contractCustomer;
        this.formattedContractTotal = formattedContractTotal;
        this.isDiscounted = isDiscounted;
        this.bdpPriceCallSuccess = bdpPriceCallSuccess;
    }
}
