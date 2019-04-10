export class StatusReason {
    
    public id: number;
    public notes: string;
    public reasonOption: any;

    constructor(id, notes, reasonOption){
        this.id = id;
        this.notes = notes;
        this.reasonOption = reasonOption;
    }
}
