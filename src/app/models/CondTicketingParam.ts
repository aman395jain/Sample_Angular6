import { CustomerObject } from './customer-object';
import { Job } from './Job';

export class CondTicketingParam {
    private locale: string;
    private processConditionalTicketing: string;
    private pricingType: string[];
    private customer: CustomerObject;
    private storeNumber: number;
    private storeId: number;
    private country: string;
    private jobs: Job[];


    constructor($locale: string, $processConditionalTicketing: string, $pricingType: string[],
                $customer: CustomerObject, $storeNumber: number, $storeId: number, $country: string, $jobs: Job[]) {
        this.locale = $locale;
        this.processConditionalTicketing = $processConditionalTicketing;
        this.pricingType = $pricingType;
        this.customer = $customer;
        this.storeNumber = $storeNumber;
        this.storeId = $storeId;
        this.country = $country;
        this.jobs = $jobs;
    }


    /**
     * Getter $locale
     * @return {string}
     */
    public getLocale(): string {
        return this.locale;
    }

    /**
     * Getter $processConditionalTicketing
     * @return {string}
     */
    public getProcessConditionalTicketing(): string {
        return this.processConditionalTicketing;
    }

    /**
     * Getter $pricingType
     * @return {string[]}
     */
    public getPricingType(): string[] {
        return this.pricingType;
    }

    /**
     * Getter $customer
     * @return {CustomerObject}
     */
    public getCustomer(): CustomerObject {
        return this.customer;
    }

    /**
     * Getter $storeNumber
     * @return {number}
     */
    public getStoreNumber(): number {
        return this.storeNumber;
    }

    /**
     * Getter $storeId
     * @return {number}
     */
    public getStoreId(): number {
        return this.storeId;
    }

    /**
     * Getter $country
     * @return {string}
     */
    public getCountry(): string {
        return this.country;
    }

    /**
     * Getter $jobs
     * @return {Job[]}
     */
    public getJobs(): Job[] {
        return this.jobs;
    }

    /**
     * Setter $locale
     * @param {string} value
     */
    public setLocale(value: string) {
        this.locale = value;
    }

    /**
     * Setter $processConditionalTicketing
     * @param {string} value
     */
    public setProcessConditionalTicketing(value: string) {
        this.processConditionalTicketing = value;
    }

    /**
     * Setter $pricingType
     * @param {string[]} value
     */
    public setPricingType(value: string[]) {
        this.pricingType = value;
    }

    /**
     * Setter $customer
     * @param {CustomerObject} value
     */
    public setCustomer(value: CustomerObject) {
        this.customer = value;
    }

    /**
     * Setter $storeNumber
     * @param {number} value
     */
    public setStoreNumber(value: number) {
        this.storeNumber = value;
    }

    /**
     * Setter $storeId
     * @param {number} value
     */
    public setStoreId(value: number) {
        this.storeId = value;
    }

    /**
     * Setter $country
     * @param {string} value
     */
    public setCountry(value: string) {
        this.country = value;
    }

    /**
     * Setter $jobs
     * @param {Job[]} value
     */
    public setJobs(value: Job[]) {
        this.jobs = value;
    }

}
