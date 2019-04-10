import { DiscountSet } from './DiscountSet';
import { DocumentSet } from './DocumentSet';
import { TurnTimeSet } from './TurnTimeSet';

export class JobSet {
    public commercialPriceUsed: string;
    public configurationId: string;
    public discountSet: DiscountSet[];
    public documentSet: DocumentSet[];
    public jobExtendedListPrice: number;
    public jobExtendedPrice: number;
    public jobPerUnitPrice: number;
    public jobQty: number;
    public jobQtyOneListPrice: number;
    public multiPriceIndicator: boolean;
    public priceTypeUsed: string;
    public printedSides: number;
    public sku: number;
    public turnTime: number;
    public turnTimeSet: TurnTimeSet[];
}
