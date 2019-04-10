import { QuoteSkuV } from '@app/models/QuoteSkuV';

export class QuoteJob {
    public attributeOptions: QuoteSkuV[];
    public rollupSku: string;
    public name: string;
    public quantity: number;
    public singleSkuPrice: number;
    public jobId: number;
}