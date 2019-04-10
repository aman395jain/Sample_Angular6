export class QuoteTicket {
    // Model to store Quote Ticket fields for printing that are not part of OrderTicket model.
    public orderCreationDateWithoutTime: string;
    public customeraddress1: string;
    public customeraddress2: string;
    public customercity: string;
    public customerstate: string;
    public customerzip: string;
    public quoteExpiryDateWithoutTime: string;
    public storeNumber: string;
    public storeAddress1: string;
    public storeCity: string;
    public storeState: string;
    public storeZip: string;
    public storeSundayOpen: string;
    public storeSundayClose: string;
    public storeWeekdayOpen: string;
    public storeWeekdayClose: string;
    public storeSaturdayOpen: string;
    public storeSaturdayClose: string;
    public isAtQuoteDesk: boolean;
    public quoteDiscountOnOrder: number;
    public bdpDiscountOnOrder: number;
    public messageLine1:string;
    public messageLine2:string;
    public storePhonenumber: string;
    public storeAddress2: string;
    public atQuoteDesk: string;

    constructor(orderCreationDateWithoutTime, customeraddress1, customeraddress2, customercity, customerstate, customerzip,
        quoteExpiryDateWithoutTime, storeNumber, storeAddress1, storeCity, storeState, storeZip, storeSundayOpen, storeSundayClose,
        storeWeekdayOpen, storeWeekdayClose, storeSaturdayOpen, storeSaturdayClose, isAtQuoteDesk, quoteDiscountOnOrder,
        bdpDiscountOnOrder, messageLine1, messageLine2, storePhonenumber) {
        this.orderCreationDateWithoutTime = orderCreationDateWithoutTime;
        this.customeraddress1 = customeraddress1;
        this.customeraddress2 = customeraddress2;
        this.customercity = customercity;
        this.customerstate = customerstate;
        this.customerzip = customerzip;
        this.quoteExpiryDateWithoutTime = quoteExpiryDateWithoutTime;
        this.storeNumber = storeNumber;
        this.storeAddress1 = storeAddress1;
        this.storeCity = storeCity;
        this.storeState = storeState;
        this.storeZip = storeZip;
        this.storeSundayOpen = storeSundayOpen;
        this.storeSundayClose = storeSundayClose;
        this.storeWeekdayOpen = storeWeekdayOpen;
        this.storeWeekdayClose = storeWeekdayClose;
        this.storeSaturdayOpen = storeSaturdayOpen;
        this.storeSaturdayClose = storeSaturdayClose;
        this.isAtQuoteDesk = isAtQuoteDesk;
        this.quoteDiscountOnOrder = quoteDiscountOnOrder;
        this.bdpDiscountOnOrder = bdpDiscountOnOrder;
        this.messageLine1 =messageLine1;
        this.messageLine2 = messageLine2;
        this.storePhonenumber = storePhonenumber;
    }
}
