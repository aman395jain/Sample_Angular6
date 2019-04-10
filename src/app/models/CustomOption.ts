export class CustomOption {

    private customKey: string;
    private inputValue: string;

    constructor(customKey, inputValue) {
        this.customKey = customKey;
        this.inputValue = inputValue;
    }

    /**
     * Getter customKey
     * @return {string}
     */
    public getCustomKey(): string {
        return this.customKey;
    }

    /**
     * Getter inputValue
     * @return {string}
     */
    public getInputValue(): string {
        return this.inputValue;
    }

    /**
     * Setter customKey
     * @param {string} value
     */
    public setCustomKey(value: string) {
        this.customKey = value;
    }

    /**
     * Setter inputValue
     * @param {string} value
     */
    public setInputValue(value: string) {
        this.inputValue = value;
    }

}
