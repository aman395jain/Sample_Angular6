import { AOptionBean } from './AOptionBean';
import { BehaviorSubject } from 'rxjs';
import { EventEmitter, Output } from '@angular/core';

export class Job {
    @Output() setCustInfoFormValid: EventEmitter<any> = new EventEmitter<any>();

    public jobName: string;
    public basePrice = 0;
    private activeJob: boolean;
    private clickedAttributeOptionId: AOptionBean;
    private selectedAttributeOptionIds: AOptionBean[];
    private quantity: number;
    private impressions: number;
    private pageCount: number;
    private templateId: string;
    private preConfProductSKU: string;
    public exceptionPageArray: Job[];
    public showImpressions: boolean;
    public specialInstructions: string;
    public quantities: number[];
    public priceStrategyId: number;
    public height: number;
    public width: number;
    public isExpressEligible: boolean;
    public isAllNoneSelected: boolean;
    private quantity$ = new BehaviorSubject(0);
    public jobIndex: number;

    constructor($showImpressions: boolean, $activeJob: boolean, $clickedAttributeOptionId: AOptionBean, $selectedAttributeOptionIds:
       AOptionBean[], $quantity: number, $impressions: number, $pageCount: number, $templateId: string, $preConfProductSKU: string,
       $exceptionPageArray: Job[], $specialInstructions: string, $quantities: number[], $priceStrategyId: number, $jobIndex: number,
       $height: number, $width: number) {
        this.activeJob = $activeJob;
        this.showImpressions = $showImpressions;
        this.clickedAttributeOptionId = $clickedAttributeOptionId;
        this.selectedAttributeOptionIds = $selectedAttributeOptionIds;
        this.quantity = $quantity;
        this.impressions = $impressions;
        this.pageCount = $pageCount;
        this.templateId = $templateId;
        this.preConfProductSKU  = $preConfProductSKU ;
        this.exceptionPageArray = $exceptionPageArray;
        this.specialInstructions = $specialInstructions;
        this.quantities = $quantities;
        this.priceStrategyId = $priceStrategyId;
        this.jobIndex = $jobIndex;
        this.height = $height;
        this.width = $width;
    }


    /**
     * Getter $activeJob
     * @return {boolean}
     */
    public getActiveJob(): boolean {
        return this.activeJob;
    }

    /**
     * Getter $clickedAttributeOptionId
     * @return {AOptionBean}
     */
    public getClickedAttributeOptionId(): AOptionBean {
        return this.clickedAttributeOptionId;
    }

    /**
     * Getter $selectedAttributeOptionIds
     * @return {AOptionBean[]}
     */
    public getSelectedAttributeOptionIds(): AOptionBean[] {
        return this.selectedAttributeOptionIds;
    }

    /**
     * Getter $quantity
     * @return {number}
     */
    public getQuantity(): number {
        return this.quantity;
    }

    /**
     * Getter $impressions
     * @return {number}
     */
    public getImpressions(): number {
        return this.impressions;
    }

    /**
     * Getter $pageCount
     * @return {number}
     */
    public getPageCount(): number {
        return this.pageCount;
    }

    /**
     * Getter $templateId
     * @return {string}
     */
    public getTemplateId(): string {
        return this.templateId;
    }

    /**
     * Getter $preConfProductSKU
     * @return {string}
     */
    public getPreConfProductSKU (): string {
        return this.preConfProductSKU ;
    }

    /**
     * Getter $specialInstructions
     * @return {string}
     */
    public getSpecialInstruction(): string {
        return this.specialInstructions;
    }

    /**
     * Setter $specialInstructions
     * @param {string} value
     */
    public setSpecialInstructions(value: string) {
        this.specialInstructions = value;
    }

    /**
     * Getter $quantities
     * @return {number[]}
     */
    public getQuantities(): number[] {
        return this.quantities;
    }

    /**
     * Setter $quantities
     * @param {number[]} value
     */
    public setQuantities(value: number[]) {
        this.quantities = value;
    }

    /**
     * Setter $activeJob
     * @param {boolean} value
     */
    public setActiveJob(value: boolean) {
        this.activeJob = value;
    }

    /**
     * Setter $clickedAttributeOptionId
     * @param {AOptionBean} value
     */
    public setClickedAttributeOptionId(value: AOptionBean) {
        this.clickedAttributeOptionId = value;
    }

    /**
     * Setter $selectedAttributeOptionIds
     * @param {AOptionBean[]} value
     */
    public setSelectedAttributeOptionIds(value: AOptionBean[]) {
        this.selectedAttributeOptionIds = value;
    }

    /**
     * Setter $quantity
     * @param {number} value
     */
    public setQuantity(value: number) {
        this.quantity = value;
        this.quantity$.next(value);
    }

    /**
     * Setter $impressions
     * @param {number} value
     */
    public setImpressions(value: number) {
        this.impressions = value;
    }

    /**
     * Setter $pageCount
     * @param {number} value
     */
    public setPageCount(value: number) {
        this.pageCount = value;
    }

    /**
     * Setter $templateId
     * @param {string} value
     */
    public setTemplateId(value: string) {
        this.templateId = value;
    }

    /**
     * Setter $preConfProdSKU
     * @param {string} value
     */
    public setPreConfProductSKU (value: string) {
        this.preConfProductSKU  = value;
    }
}
