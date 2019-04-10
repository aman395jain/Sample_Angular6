
import {PrintBrokerResponse} from '@app/models/printbroker/PrintBrokerResponse';


export class ActiveJob {
  public showImpressions: boolean;
  public quantity = 0;
  public impressions = 0;
  public attributeOptionIds: any;
  public sheets = 0;
  public selectedSideConfig = 500025;
  public locale: string;
  public selectedTurnTime = null;
  public groupVO =  [];
  public usePrintReadyFile =  true;
  public mediaType =  3;
  public fileNotes =  null;
  public priceResponse =  {'baseList': [{'totalSKUPrice': 0.00, 'totalSKUDiscountedPrice': 0.00}]};
  public printBrokerFiles: PrintBrokerResponse;
  public multipleFiles: File[];
  public exceptionPageObj =  null;
  public exceptionPages =  {};
  public specialInstructions =  '';
  public quantities =  [];
  public unitPriceMap =  {};
  public quantityOptionMap =  {};
  public priceTypeMap =  {};
  public hasFinishedDimensions =  false;
  public isRestapleOriginal =  false;
  public isNoneSelected =  false;
  public dueDate =  '';
  public savingsCatcher: any;
  public isDCSJob =  false;
  public price = 0;
  public bDPDiscount = 0;
  public totalDiscountedPrice = 0;
  public turnTimeOptions = {};
  public productDetails: any;
  public jobNumber: number;
  public productId: string;
  public priceStrategyId: number;
  public height: number;
  public width: number;
  public sku: string;
  public isExpressEligible: any;
  public jobSkuPriceList: any;
  public configProduct: any;
  public quoteDiscount: any;
  public isDuplicate = false;
  public supplierCost = 0.0;
  /**
   * Price of the job without any additional fees or discounts
   */
  public basePrice = 0;

  /**
   * Guarenteed availability fee
   */
  public availabilityFee =  0;

  /**
   * Discount amount for job
   */
  public jobLevelDiscount = 0;

  public jobSubtotal = 0;

}
