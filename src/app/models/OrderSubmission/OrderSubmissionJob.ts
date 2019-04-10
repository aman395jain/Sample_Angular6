import { JobAttributeOption } from './JobAttributeOption';
import { JobSkuPriceList1 } from './jobSkuPriceList1';
import {CustomOptionSubmit} from './CustomOptionSubmit';
import {JobInput} from './JobInput';
import {TurnTimeSet} from '@app/models/TurnTimeSet';

export class OrderSubmissionJob {
    public jobName: string;
    public activeJob: boolean;
    public bDPDiscount;
    public categoryId;
    public dueDate;
    public errorMessage;
    public impressions: number;
    public inputMultiplierQuantity;
    public isExpressEligible;
    public isRestapleOriginal;
    public jobAttributeOption: JobAttributeOption[];
    public jobIndex;
    public jobSkuPriceList1: JobSkuPriceList1[];
    public pageCount: number;
    public preconfiguredProductId;
    public price: number;
    public productId;
    public quantity;
    public quoteDiscount;
    public singleSkuDiscountedPrice;
    public singleSkuPrice;
    public specialInstructions;
    public templateId;
    public totalDiscountedPrice;
    public priceBeforeDiscounts: number;
    public customOptionsList: CustomOptionSubmit[];
    public exceptionPageArray: any[];
    public input: JobInput;
    public turnTimeName: string;
    public turnTimeSet: TurnTimeSet[];
    public categoryCode: string;
    public supplierCost = 0.0;
    constructor() {
    }
}
