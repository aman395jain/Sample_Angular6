import { CustomOption } from './CustomOption';

export class AOptionBean {

    public attributeOptionId: number;
    public attributePropertyMap: Object;
    public code: string;
    public customOptionList: CustomOption[];
    public unitPrice: number;
    public quantity: number;
    public priceType: string;

    constructor($attributeOptionId: number, $attributePropertyMap: Object, $code: string, $customOptionList: CustomOption[],
                $unitPrice: number, $quantity: number, $priceType: string) {
        this.attributeOptionId = $attributeOptionId;
        this.attributePropertyMap = $attributePropertyMap;
        this.code = $code;
        this.customOptionList = $customOptionList;
        this.unitPrice = $unitPrice;
        this.quantity = $quantity;
        this.priceType = $priceType;
    }

}
