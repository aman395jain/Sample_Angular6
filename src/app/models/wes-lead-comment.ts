export class WesLeadComment {
    
    public opportunityId: string;
    public escalationFlag: boolean;
    public comments: string;

    constructor(opportunityId, escalationFlag, comments){
        this.opportunityId = opportunityId;
        this.escalationFlag = escalationFlag;
        this.comments = comments; 
    }
    
    
}
