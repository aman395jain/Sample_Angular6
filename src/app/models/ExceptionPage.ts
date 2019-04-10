import { AOptionBean } from './AOptionBean';

export class ExceptionPage {
    public pageRange: any;
    public clickedAttributeOptionId: AOptionBean;
    public selectedAttributeOptionIds: AOptionBean[];
    public templateId: string;
    public pageCount: Number;
    public isDoubleSided: Boolean;

    constructor(pageRange, clickedAttributeOptionId, selectedAttributeOptionIds, templateId, pageCount) {
        this.pageRange = pageRange;
        this.clickedAttributeOptionId = clickedAttributeOptionId;
        this.selectedAttributeOptionIds = selectedAttributeOptionIds;
        this.templateId = templateId;
        this.pageCount = pageCount;
    }

}
