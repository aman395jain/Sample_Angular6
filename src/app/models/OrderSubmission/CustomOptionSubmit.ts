export class CustomOptionSubmit {

    public customKey: string;
    public inputValue: string;
    public attributeOptionId: string;
    public customPrompt: string;

    constructor(attributeOptionId , customKey , inputValue, prompt ) {
        this.attributeOptionId = attributeOptionId;
        this.customKey = customKey;
        this.inputValue = inputValue;
        this.customPrompt = prompt;
    }

}
