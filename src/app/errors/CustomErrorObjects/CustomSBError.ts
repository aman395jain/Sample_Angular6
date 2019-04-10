export class CustomSBError extends Error {
    private errorPage = false;
    constructor(m, name, errorPage) {
        super(m);
        this.name = name;
        this.errorPage = errorPage;
    }

}
