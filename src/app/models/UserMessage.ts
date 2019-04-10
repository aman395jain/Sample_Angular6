export class UserMessage {
    userId: string;
    userMessage: string;
   
    constructor(userId, userMessage) {
        this.userId = userId;
        this.userMessage = userMessage;
    }
}