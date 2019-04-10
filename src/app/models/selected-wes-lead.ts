export class SelectedWesLead {
    
    wesData: any;
    opportunityId: string;
    leadData: any;

    constructor(wesData: any, opportunityId: string, leadData: any){
        this.wesData = wesData;
        this.opportunityId = opportunityId;
        this.leadData = leadData;
    }
}
