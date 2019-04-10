import { Injectable } from '@angular/core';
import {CustomerInformation} from '@app/models/CustomerInformation';
import {ShippingInfoJ} from '@app/models/ShippingInfoJ';
import {PreferredContact} from '@app/models/PreferredContact';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {ActiveJob} from '@app/models/ActiveJob';
import {environment} from '@env/environment';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {ShippingService} from '@app/pages/check-out/services/shipping/shipping.service';
import {TranslateService} from '@ngx-translate/core';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {CustomOption} from '@app/models/CustomOption';
import {AOptionBean} from '@app/models/AOptionBean';
import {CustomerObject} from '@app/models/customer-object';
import {FileInterrogation} from '@app/models/FileInterrogation';
import {ShipDetails} from '@app/models/ShipDetails';
import {OrderSubmission} from '@app/models/OrderSubmission/OrderSubmission';
import {ShippingRequest} from '@app/models/ShippingRequest';
import {Recipient} from '@app/models/Recipient';
import {JobSkuPriceList1} from '@app/models/OrderSubmission/jobSkuPriceList1';
import {SnackNotification} from '@app/models/SnackNotification';
import {JobAttributeOption} from '@app/models/OrderSubmission/JobAttributeOption';
import {JobInput} from '@app/models/OrderSubmission/JobInput';
import {OrderSubmissionJob} from '@app/models/OrderSubmission/OrderSubmissionJob';
import {JobSet} from '@app/models/JobSet';
import {ConfigValueSet} from '@app/models/ConfigValueSet';
import {ExceptionPage} from '@app/models/ExceptionPage';
import {CommonConstants, SubmitType} from '@app/config/common-constants';
import {CondTicketingParam} from '@app/models/CondTicketingParam';
import {DocumentSet} from '@app/models/DocumentSet';
import {Job} from '@app/models/Job';
import {CustomOptionSubmit} from '@app/models/OrderSubmission/CustomOptionSubmit';

@Injectable()
export class OrderConfigService {

  // Variable used to store the selected customer for the order
  public orderCustomer = new CustomerInformation();
  // Variable used to store the customer shipping info for the order
  public shippingInfoJ = new ShippingInfoJ(null, null, null, null, null, null, null, null);
  // Stores selected shipping rates for jobs with shipping
  public selectedShippingOptions: Array<any>;
  // used to track if new customer of if customer was searched and selected
  public orderCustomerSelected = false;
  public orderCustomerPreferredContact = new PreferredContact(null, null, null, null, null, null);

  // subscription for uploading new files
  public fileUploadedSub = new BehaviorSubject(null);
  public templateDoneLoading = new BehaviorSubject(null);

  public saveCustomer = false;
  public optIn = false;
  public activeConfigProduct = {'name': 'N/A'};
  private allowed_workfront_category: Array<any> = CommonConstants.ALLOWED_WORKFRONT_CATEGORY;

  public activeJob = new ActiveJob();


  public orderPricing: any;
  public orderName = '';
  public isOrderNameDefault = true;
  public validShipOrder = true;
  // add to cart function makes the cart map an object literal
  public cart: Map<number, ActiveJob> = new Map<number, ActiveJob>();
  public jobIdCounter = 1;
  public exceptionPageCounter = 1;
  public totalOrderPrice = 0;
  public totalOrderOriginalPrice = 0;
  public totalOrderQuantityDiscount = 0;
  public totalOrderBdpDiscount = 0;
  public totalOrderSavings = 0;
  public template;
  public activeExceptionPage: any;
  public isReorder = false;
  public isOrderCustomerInfoValid = false;
  public isShippingInfoValid = false;
  public isPickUpInfoValid = false;
  public showShipping = false;
  public showImpressions: boolean;
  public shippingOption: any;
  public canProceed: boolean;
  public sidesConfig: Array<number> = [500027, 500025, 500026] ;
  public isEditJob = false;
  public cartChanged = new BehaviorSubject(false);
  public jobQuantityChanged = new BehaviorSubject(false);
  public newProdAddedToCart = new BehaviorSubject(false);
  public jobCancelled = new BehaviorSubject(false);
  public reorderConfigProductMap = {};
  public isResidential = false;
  public isEchCustomer = false;
  public deliveryMethod = 'Pick up';
  public isNewRewardsEnroll = false;
  public pdfSrc = environment.rootURL + '/assets/pdf-test2.pdf';
  public isEditQuote = false;
  public isEditOrder = false;
  public orderNumber: string = null;
  public showEmailPhoneRequired = false;
  public saveCustomerInfo = true;
  public allowCancel = new BehaviorSubject(true);
  public proceedDisabled = new BehaviorSubject(true);
  public customerHasCompleteAddress = true;
  public hasWorkFrontJob = false;

  public orderPriceData = new BehaviorSubject({});

  // Shared Shipping data
  public shippingIsLoaded = true;
  public shippingCost: Number;
  public shippingEnabled = new BehaviorSubject(false);
  public shippingSelected = false;

  public isCustomerSearch = false;

  constructor(
    private notificationService: NotificationService,
    private storeInfoService: StoreinfoService,
    private LOGGER: LoggerService,
    private translate: TranslateService,
    private shippingService: ShippingService,
    private userService: UserInfoService) { }


  setOrderCustomer(customer) {

    let firstName = null;
    if (customer.firstname !== customer.company) {
      firstName = customer.firstname;
    }
    if (customer.isContractCustomer) {
      this.orderCustomer.isContractCustomer = customer.isContractCustomer;
    }
    this.orderCustomer = customer;

    this.orderCustomerPreferredContact = new PreferredContact(firstName,
      customer.lastname, customer.phoneNumber, customer.company, customer.email, customer.preferredContactMode);

    this.isEchCustomer = true;
    this.saveCustomerInfo = false;
  }

  getOrderCustomer() {
    return this.orderCustomer;
  }

  setActiveConfigProduct(product) {
    this.activeConfigProduct = product;
  }

  getActiveConfigProduct() {
    return this.activeConfigProduct;
  }

  setJobQuantities(quantities) {
    this.activeJob.quantities = quantities;
  }

  getJobQuantities() {
    return this.activeJob.quantities;
  }

  setActiveJob(template) {
    this.activeJob = new ActiveJob();
    this.activeJob.showImpressions = false;
    this.template = template;
    const pbFiles = this.activeJob.printBrokerFiles;
    const usePrintReadyFile = this.activeJob.usePrintReadyFile;
    const mediaType = this.activeJob.mediaType;
    const fileNotes = this.activeJob.fileNotes;
    const isRestapleOriginal = this.activeJob.isRestapleOriginal;
    this.activeJob.hasFinishedDimensions = false;
    this.activeJob = this.optionDataAddisSelected(template);
    this.activeJob.price = 0;
    this.activeJob.bDPDiscount = 0;
    this.activeJob.priceResponse = {'baseList': [{'totalSKUPrice': 0.00, 'totalSKUDiscountedPrice': 0.00}]};
    this.activeJob.savingsCatcher = {'discount': 0};
    this.activeJob.totalDiscountedPrice = 0;
    this.activeJob.turnTimeOptions = {};
    this.activeJob.impressions = 1;
    this.activeJob.sheets = 1;
    this.activeJob.quantity = (this.activeJob.quantities && this.activeJob.quantities.length > 0) ? this.activeJob.quantities[0] : 1;
    this.activeJob.exceptionPages = {};
    this.activeJob.specialInstructions = '';
    this.activeJob.printBrokerFiles = pbFiles;
    this.activeJob.usePrintReadyFile = usePrintReadyFile;
    this.activeJob.mediaType = mediaType;
    this.activeJob.fileNotes = fileNotes;
    this.activeJob.dueDate = '';
    this.activeJob.isRestapleOriginal = isRestapleOriginal;
    this.activeJob.isNoneSelected = false;
  }

  // typed replacement for setactvejobtyped
  setActiveJobTyped(template: any, activeJob: ActiveJob): ActiveJob {
    this.template = template;
    const pbFiles = activeJob.printBrokerFiles;
    const usePrintReadyFile = activeJob.usePrintReadyFile;
    const mediaType = activeJob.mediaType;
    const fileNotes = activeJob.fileNotes;
    const isRestapleOriginal = activeJob.isRestapleOriginal;
    activeJob.hasFinishedDimensions = false;
    activeJob.showImpressions = false;
    activeJob = this.optionDataAddisSelectedTyped(template, activeJob);
    activeJob.price = 0;
    activeJob.bDPDiscount = 0;
    activeJob.priceResponse = {'baseList': [{'totalSKUPrice': 0.00, 'totalSKUDiscountedPrice': 0.00}]};
    activeJob.savingsCatcher = {'discount': 0};
    activeJob.totalDiscountedPrice = 0;
    activeJob.turnTimeOptions = {};
    activeJob.impressions = 1;
    activeJob.sheets = 1;
    activeJob.quantity = (activeJob.quantities && activeJob.quantities.length > 0) ? activeJob.quantities[0] : 1;
    activeJob.exceptionPages = {};
    activeJob.specialInstructions = '';
    activeJob.printBrokerFiles = pbFiles;
    activeJob.usePrintReadyFile = usePrintReadyFile;
    activeJob.mediaType = mediaType;
    activeJob.fileNotes = fileNotes;
    activeJob.dueDate = '';
    activeJob.isRestapleOriginal = isRestapleOriginal;
    activeJob.isNoneSelected = false;
    activeJob.selectedTurnTime = null;

    return activeJob;
  }

  resetActiveJobFileInfo() {
    this.activeJob.printBrokerFiles = null;
    this.activeJob.multipleFiles = null;
    this.activeJob.usePrintReadyFile = true;
    this.activeJob.mediaType = 3;
    this.activeJob.fileNotes = null;
    this.activeJob.isRestapleOriginal = false;
  }

  getActiveJob() {
    return this.activeJob;
  }

  getActiveProductDetails() {
    return this.activeJob.productDetails;
  }

  getActiveProductDetailsByKey(key) {
    return this.activeJob.productDetails[key];

  }

  // loops through optionData and adds isSelected as well as position in array for quicker changes when item is selected
  optionDataAddisSelected(optionData) {
    this.showImpressions = false;
    let exceptionPos = 0;
    let impressionsPos = 0;
    let spliceExceptionPage = false;
    let spliceImpresstions = false;
    // create impressions and exception page objects but remove them from the group list so they don't show on the side
    for (let gc = 0; gc < optionData.groupVO.length; gc++) {
      if ( optionData.groupVO[gc].attributeGroupTypeId === 6) {
        exceptionPos = gc;
        optionData.exceptionPageObj = this.optionDataAddisSelectedExceptionPage(optionData.groupVO[gc], optionData.productDetails);
        spliceExceptionPage = true;
      }

      if (optionData.groupVO[gc].name === 'Impressions') {
        impressionsPos = gc;
        optionData.impressionObj = optionData.groupVO[gc];
        spliceImpresstions = true;
        this.showImpressions = true;
        this.activeJob.showImpressions = true;
      }
    }

    if (spliceExceptionPage) {
      optionData.groupVO.splice(exceptionPos, 1);
    }

    if (spliceImpresstions) {
      optionData.groupVO.splice(impressionsPos, 1);
    }
    optionData.hasFinishedDimensions = false;
    for (let gc = 0; gc < optionData.groupVO.length; gc++) {
      for (let kc = 0; kc < optionData.groupVO[gc].keyVO.length; kc++) {
        Object.keys( optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
          if (optionData.groupVO[gc].keyVO[kc].code === 'N6') {
            optionData.hasFinishedDimensions = true;
          }
          for (let grc = 0; grc < optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected =
              optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDefault;

            if (optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDefault === 'Y' &&
              this.sidesConfig.includes(optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id)) {
              this.updateSheets(optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id);
              optionData.selectedSideConfig = optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id;
            }

            if (optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDCS === 'Y') {
              optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].dcsAnimate = false;
              if (optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y') {
                this.activeJob.isDCSJob = true;
              }
            }
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDisabled = false;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].groupPos = gc;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].keyPos = kc;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].groupingPos = grc;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].groupingKey = key;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptions = [];
            if ( optionData.productDetails[optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id]) {
              optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptions =
                optionData.productDetails[optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id].customOptions;
            }
          }
        });
        const keysSorted = Object.keys(optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO).sort((a, b) => {
          return optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[a][0].displaySequence -
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[b][0].displaySequence;
        });

        optionData.groupVO[gc].keyVO[kc].optionVO.groupingVOKeyList = keysSorted;
      }
    }
    return optionData;
  }

  // loops through optionData and adds isSelected as well as position in array for quicker changes when item is selected
  optionDataAddisSelectedTyped(optionData: any, activeJob: ActiveJob): ActiveJob {
    this.showImpressions = false;
    let exceptionPos = 0;
    let impressionsPos = 0;
    let spliceExceptionPage = false;
    let spliceImpresstions = false;
    // create impressions and exception page objects but remove them from the group list so they don't show on the side
    for (let gc = 0; gc < optionData.groupVO.length; gc++) {
      if ( optionData.groupVO[gc].attributeGroupTypeId === 6) {
        exceptionPos = gc;
        optionData.exceptionPageObj = this.optionDataAddisSelectedExceptionPage(optionData.groupVO[gc], optionData.productDetails);
        spliceExceptionPage = true;
      }

      if (optionData.groupVO[gc].name === 'Impressions') {
        impressionsPos = gc;
        optionData.impressionObj = optionData.groupVO[gc];
        spliceImpresstions = true;
        this.showImpressions = true;
        this.activeJob.showImpressions = true;
      }
    }

    if (spliceExceptionPage) {
      optionData.groupVO.splice(exceptionPos, 1);
    }

    if (spliceImpresstions) {
      optionData.groupVO.splice(impressionsPos, 1);
    }
    optionData.hasFinishedDimensions = false;
    for (let gc = 0; gc < optionData.groupVO.length; gc++) {
      for (let kc = 0; kc < optionData.groupVO[gc].keyVO.length; kc++) {
        Object.keys( optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
          if (optionData.groupVO[gc].keyVO[kc].code === 'N6') {
            optionData.hasFinishedDimensions = true;
          }
          for (let grc = 0; grc < optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected =
              optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDefault;

            if (optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDefault === 'Y' &&
              this.sidesConfig.includes(optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id)) {
              this.updateSheets(optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id);
              optionData.selectedSideConfig = optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id;
            }

            if (optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDCS === 'Y') {
              optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].dcsAnimate = false;
              if (optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y') {
                this.activeJob.isDCSJob = true;
              }
            }
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDisabled = false;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].groupPos = gc;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].keyPos = kc;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].groupingPos = grc;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].groupingKey = key;
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptions = [];
            if ( optionData.productDetails[optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id]) {
              optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptions =
                optionData.productDetails[optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id].customOptions;
            }
          }
        });
        const keysSorted = Object.keys(optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO).sort((a, b) => {
          return optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[a][0].displaySequence -
            optionData.groupVO[gc].keyVO[kc].optionVO.groupingVO[b][0].displaySequence;
        });

        optionData.groupVO[gc].keyVO[kc].optionVO.groupingVOKeyList = keysSorted;
      }
    }
    activeJob.attributeOptionIds = optionData.attributeOptionIds;
    activeJob.exceptionPageObj = optionData.exceptionPageObj;
    activeJob.groupVO = optionData.groupVO;
    activeJob.hasFinishedDimensions = optionData.hasFinishedDimensions;
    activeJob.locale = optionData.locale;
    activeJob.priceStrategyId = optionData.priceStrategyId;
    activeJob.productDetails = optionData.productDetails;
    activeJob.productId = optionData.productId;
    activeJob.quantities = optionData.quantities;
    activeJob.selectedSideConfig = optionData.selectedSideConfig;
    activeJob.sku = optionData.sku;
    return activeJob;
  }

  // loops through optionData and adds isSelected as well as position in array for quicker changes when item is selected
  optionDataAddisSelectedExceptionPage(optionData, productDetails) {

    for (let kc = 0; kc < optionData.keyVO.length; kc++) {
      Object.keys( optionData.keyVO[kc].optionVO.groupingVO).forEach(key => {
        for (let grc = 0; grc < optionData.keyVO[kc].optionVO.groupingVO[key].length; grc++) {

          optionData.keyVO[kc].optionVO.groupingVO[key][grc].isSelected =
            optionData.keyVO[kc].optionVO.groupingVO[key][grc].isDefault;

          optionData.keyVO[kc].optionVO.groupingVO[key][grc].isDisabled = false;
          optionData.keyVO[kc].optionVO.groupingVO[key][grc].keyPos = kc;
          optionData.keyVO[kc].optionVO.groupingVO[key][grc].groupingPos = grc;
          optionData.keyVO[kc].optionVO.groupingVO[key][grc].groupingKey = key;
          optionData.keyVO[kc].optionVO.groupingVO[key][grc].customOptions = [];
          optionData.keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList = {};
          if ( productDetails[optionData.keyVO[kc].optionVO.groupingVO[key][grc].id]) {
            optionData.keyVO[kc].optionVO.groupingVO[key][grc].customOptions =
              productDetails[optionData.keyVO[kc].optionVO.groupingVO[key][grc].id].customOptions;
          }
        }
      });
      const keysSorted = Object.keys(optionData.keyVO[kc].optionVO.groupingVO).sort((a, b) => {
        return optionData.keyVO[kc].optionVO.groupingVO[a][0].displaySequence -
          optionData.keyVO[kc].optionVO.groupingVO[b][0].displaySequence;
      });

      optionData.keyVO[kc].optionVO.groupingVOKeyList = keysSorted;
    }
    optionData.unitPriceMap = {};
    optionData.quantityOptionMap = {};
    optionData.priceTypeMap = {};
    return optionData;
  }

  /**
   *changes the isSelectedValue item when an item is selected. also sets the other value to not selected since
   *only one can be selected at a time.
   *@param option the option that is selected
   */
  changeSelectedItem(option) {
    if (option !== null) {
        Object.keys(this.activeJob.groupVO[option.groupPos].keyVO[option.keyPos].optionVO.groupingVO).forEach(key => {
          this.activeJob.groupVO[option.groupPos].keyVO[option.keyPos].optionVO.groupingVO[key].forEach( o => {
            if (this.sidesConfig.includes(o.id) ) {
              this.updateSheets(option.id);
            }
            if (o.id === option.id ) {
              o.isSelected = 'Y';
              this.activeJob.groupVO[option.groupPos].keyVO[option.keyPos].optionVO.selectedGroup = key;
            } else {
              o.isSelected = 'N';
            }
          });

        });
    }
  }

  updateSheets(selectedSideConfig) {
    selectedSideConfig = parseInt(selectedSideConfig, 10);
    if (selectedSideConfig === 500027) {
      this.activeJob.selectedSideConfig = selectedSideConfig;
      this.activeJob.sheets = this.activeJob.impressions;
    } else if (selectedSideConfig === 500025 || selectedSideConfig === 500026) {
      this.activeJob.selectedSideConfig = selectedSideConfig;
      const impressions = this.activeJob.impressions;
      this.activeJob.sheets = ( Math.trunc((impressions / 2)) + (impressions % 2) );
    }
  }

  /**
   *changes the isSelectedValue item when exception page item is selected. also sets the other value to not selected since
   *only one can be selected at a time.
   *@param option the option that is selected
   */
  changeSelectedItemExceptionPage(option) {
    Object.keys(this.activeExceptionPage.keyVO[option.keyPos].optionVO.groupingVO).forEach(key => {
      this.activeExceptionPage.keyVO[option.keyPos].optionVO.groupingVO[key].forEach( o => {
        if (o.id === option.id ) {
          o.isSelected = 'Y';
          this.activeExceptionPage.keyVO[option.keyPos].optionVO.selectedGroup = key;
        } else {
          o.isSelected = 'N';
        }
      });
    });
  }

  /**
   * gets all the selected items and returns an array of the attributeoptionIds
   * @param job
   * @return selecteItems array of attributeOptionIds
   */
  getSelectedItems(job) {
    const selectedItems = [];
    for (let gc = 0; gc < job.groupVO.length; gc++) {
      for (let kc = 0; kc < job.groupVO[gc].keyVO.length; kc++) {
        Object.keys( job.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
          for (let grc = 0; grc < job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {

            if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y'
              && job.groupVO[gc].attributeGRoupTypeId !== 6) {
              let tempMap = null;
              if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id in job.productDetails) {
                tempMap = job.productDetails[job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id].attributePropertyMap;
              }

              const customOptionsList = [];
              if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList) {

                for ( const key2 of Object.keys(job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList)) {
                  if (key2.includes('_')) {
                    const splitArr = key2.split('_');
                    customOptionsList.push(new CustomOption(splitArr[0], job.groupVO[gc].keyVO[kc]
                                          .optionVO.groupingVO[key][grc].customOptionsList[key2]));
                  } else {
                    customOptionsList.push(new CustomOption(key2, job.groupVO[gc].keyVO[kc]
                                          .optionVO.groupingVO[key][grc].customOptionsList[key2]));
                  }
                }
              }

              let quantity = 0;
              if (job.quantityOptionMap) {
                quantity = job.quantityOptionMap[job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id];
              }

              let unitPrice = 0;
              if (job.unitPriceMap) {
                unitPrice = job.unitPriceMap[job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id];
              }

              let discountType = '';
              if (job.priceTypeMap) {
                discountType = job.priceTypeMap[job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id];
              }

              const tempAOB = new AOptionBean( job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id,
                tempMap, job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].code,
                customOptionsList, unitPrice, quantity, discountType);

              selectedItems.push(tempAOB);
            }
          }
        });
      }
    }
    return selectedItems;
  }

  /**
   * gets the selected stock sheet size for custom option validation
   * @param job
   * @return stockSheetSize the max size of the stock sheet
   */
  getSelectedStockSheetSize() {
    const job = this.activeJob;
    let maxSize = null;
    for (let gc = 0; gc < job.groupVO.length; gc++) {
      for (let kc = 0; kc < job.groupVO[gc].keyVO.length; kc++) {
        Object.keys( job.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
          for (let grc = 0; grc < job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
            if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y'
                && job.groupVO[gc].attributeGRoupTypeId !== 6) {
              if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id in this.activeJob.productDetails) {
                const tempMap = this.activeJob.productDetails[job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id]
                                .attributePropertyMap;
                if (Object.keys(tempMap).includes('Stock Sheet Size')) {
                  const sizes = tempMap['Stock Sheet Size'].split(',');
                  maxSize = sizes[sizes.length - 1];
                }
              }
            }
          }
        });
      }
    }
    return maxSize;
  }

  /*
   * Function to check if a given vcode is selected in the active job. Returns true if it is selected
   */
  checkIfVCodeIsSelected(vcode) {
    const job = this.activeJob;
    let selected = null;
    for (let gc = 0; gc < job.groupVO.length; gc++) {
      for (let kc = 0; kc < job.groupVO[gc].keyVO.length; kc++) {
        Object.keys( job.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
          for (let grc = 0; grc < job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
            if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y' && job.groupVO[gc].attributeGRoupTypeId !== 6 &&
              job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].code === vcode ) {
              selected = job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc];
            }
          }
        });
      }
    }
    return selected;
  }

  /*
   * Function to get an option for a given Vcode
   */
  getOptionByVCode(vcode) {
    const job = this.activeJob;
    let selected = null;
    for (let gc = 0; gc < job.groupVO.length; gc++) {
      for (let kc = 0; kc < job.groupVO[gc].keyVO.length; kc++) {
        Object.keys( job.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
          for (let grc = 0; grc < job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
            if (job.groupVO[gc].attributeGRoupTypeId !== 6 && job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].code === vcode ) {
              selected = job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc];
            }
          }
        });
      }
    }
    return selected;
  }

  /*
   * Function to add/update customOptionsList to a given vcode.
   */
  addCustomOptionsListToOption(option, customOptionsList) {
    this.activeJob.groupVO[option.groupPos].keyVO[option.keyPos].optionVO.groupingVO[option.groupingKey][option.groupingPos]
      .customOptionsList = customOptionsList;
  }

  /*
   * Function to add/update customOptionsList to a given vcode Exception pages.
   */
  addCustomOptionsListToOptionExceptionPage(option, customOptionsList) {
    this.activeExceptionPage.keyVO[option.keyPos].optionVO.groupingVO[option.groupingKey][option.groupingPos]
      .customOptionsList = customOptionsList;
  }


  getSelectedItemsExceptionPage(job, cartKey) {
    const selectedItems = [];
    for (let kc = 0; kc < job.keyVO.length; kc++) {
      Object.keys( job.keyVO[kc].optionVO.groupingVO).forEach(key => {
        for (let grc = 0; grc < job.keyVO[kc].optionVO.groupingVO[key].length; grc++) {
          if (job.keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y') {

            let tempMap = null;

            if (job.keyVO[kc].optionVO.groupingVO[key][grc].id in this.activeJob.productDetails) {
              tempMap = this.activeJob.productDetails[job.keyVO[kc].optionVO.groupingVO[key][grc].id].attributePropertyMap;
            } else if (cartKey !== null) {
              tempMap = this.cart[cartKey].productDetails[job.keyVO[kc].optionVO.groupingVO[key][grc].id].attributePropertyMap;
            }

            const customOptionsList = [];
            if (job.keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList) {
              for ( const key2 of Object.keys(job.keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList)) {
                if (key2.includes('_')) {
                  const splitArr = key2.split('_');
                  customOptionsList.push(new CustomOption(splitArr[0], job.keyVO[kc].optionVO.groupingVO[key][grc]
                    .customOptionsList[key2]));
                } else {
                  customOptionsList.push(new CustomOption(key2, job.keyVO[kc].optionVO.groupingVO[key][grc]
                    .customOptionsList[key2]));
                }
              }
            }

            let quantity = 0;
            if (job.quantityOptionMap) {
              quantity = job.quantityOptionMap[job.keyVO[kc].optionVO.groupingVO[key][grc].id];
            }

            let unitPrice = 0;
            if (job.unitPriceMap) {
              unitPrice = job.unitPriceMap[job.keyVO[kc].optionVO.groupingVO[key][grc].id];
            }

            let discountType = '';
            if (job.priceTypeMap) {
              discountType = job.priceTypeMap[job.keyVO[kc].optionVO.groupingVO[key][grc].id];
            }

            const tempAOB = new AOptionBean( job.keyVO[kc].optionVO.groupingVO[key][grc].id,
              tempMap, job.keyVO[kc].optionVO.groupingVO[key][grc].code, customOptionsList, unitPrice, quantity, discountType);

            selectedItems.push(tempAOB);
          }
        }
      });
    }
    return selectedItems;
  }

  /**
   * used to set all the selected options in the active excetption page from reorder
   * @param selectedOptionArray
   */
  setSelectedOptionsExceptionPageReorder(attributeOptionSelectedBean) {
    const selectedOptionsMap = {};

    // loop through selected options of exception page
    attributeOptionSelectedBean.forEach( selectedBean => {
      if (this.valueContainsDoubleSided(selectedBean.description)) {
        this.activeExceptionPage.isDoubleSided = true;
      }
      selectedOptionsMap[selectedBean.id] = selectedBean;
    });
    const selectedOptionArray = Object.keys(selectedOptionsMap);
    for (let kc = 0; kc < this.activeExceptionPage.keyVO.length; kc++) {
      Object.keys( this.activeExceptionPage.keyVO[kc].optionVO.groupingVO).forEach(key => {
        for (let grc = 0; grc < this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key].length; grc++) {
          if (selectedOptionArray.includes(String(this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].id))) {
            const optionId = this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].id;

            this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].isSelected = 'Y';
            this.activeExceptionPage.keyVO[kc].optionVO.selectedGroup = key;
            const cOpt = {};
            let tabPageCount = 0;
            let tabCopyCount = 0;
            selectedOptionsMap[ optionId ].attributeCustomOptionBeanList.forEach( customOption => {
              if ( customOption.customKey === 'GetTabPage' ) {
                cOpt[ customOption.customKey + '_' + tabPageCount ] = customOption.inputValue;
                tabPageCount++;
              } else if ( customOption.customKey === 'GetTabCopy' ) {
                cOpt[ customOption.customKey + '_' + tabCopyCount ] = customOption.inputValue;
                tabCopyCount++;
              } else {
                cOpt[ customOption.customKey ] = customOption.inputValue;
              }
            });

            this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList = cOpt;
          } else {
            this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].isSelected = 'N';
          }
        }
      });
    }
  }

  /**
   * creates a PricingAndTicketingObject which contains the information to send to the pricing and ticketing API
   * @param clickedOptionId
   */
  // null, false, p
  createTicketingAndPricingObject(clickedOption, exceptionPage, action) {
    const customerObj: CustomerObject = new CustomerObject();

    if (this.orderCustomer != null) {
      customerObj.consortiumValue = this.orderCustomer.consortiumValue;
      customerObj.rewardsNumber = this.orderCustomer.rewardsNumber;
      if (this.orderCustomer.bdpFeedData) {
        customerObj.layerCode = this.orderCustomer.bdpFeedData.layerCode;
        customerObj.layerName = this.orderCustomer.bdpFeedData.layerName;
        customerObj.tier = this.orderCustomer.bdpFeedData.tier;
      }
      customerObj.masterAccountNumber = this.orderCustomer.contractMasterAccountNumber;
      customerObj.firstName = this.orderCustomer.firstname;
      customerObj.lastName = this.orderCustomer.lastname;
      customerObj.email = this.orderCustomer.email;
      customerObj.preferredCompany = this.orderCustomerPreferredContact.preferredCompany;
      customerObj.preferredEmail = this.orderCustomerPreferredContact.preferredEmail;
      customerObj.preferredFirstName = this.orderCustomerPreferredContact.preferredFirstName;
      customerObj.preferredLastName = this.orderCustomerPreferredContact.preferredLastName;
      customerObj.preferredPhoneNumber = this.orderCustomerPreferredContact.preferredPhoneNumber;
    }

    const jobs: Job[] = [];

    let activeJobAdded = false;

    // Create job object of jobs in cart
    if (Object.keys(this.cart).length > 0) {
      Object.keys(this.cart).forEach(key => {
        if (this.activeJob === null) {

        }
        /**
         * TODO: update code to handle not having an active job
         */
        if (this.cart[key].jobNumber !== this.activeJob.jobNumber) {
          // add jobs from cart to pricing object that are not the active job
          const exceptionPageArrayJB = [];
          if (this. cart[ key ].exceptionPages !== undefined && Object.keys( this.cart[ key ].exceptionPages).length > 0) {
            for (const exPageId in  this.cart[ key ].exceptionPages) {
              const exPage =  this.cart[ key ].exceptionPages[exPageId];
              if ( this.activeExceptionPage !== null &&
                this.activeExceptionPage.exceptionPageCounterId === exPage.exceptionPageCounterId) {
                continue;
              }
              exceptionPageArrayJB.push(new ExceptionPage(exPage.pageRange, null,
                this.getSelectedItemsExceptionPage(exPage, key),
                this.cart[ key ].productId, exPage.pageCount));
            }
          }

          const tempJob = new Job(this.cart[ key ].showImpressions, false, null,
            this.getSelectedItems(this.cart[ key ]),
            this.cart[ key ].quantity, this.cart[ key ].impressions, this.cart[ key ].sheets,
            this.cart[ key ].productId, this.cart[ key ].sku, exceptionPageArrayJB,
              this.cart[ key ].specialInstructions, [], this.cart[ key ].priceStrategyId, this.cart[ key ].jobNumber,
              this.cart[ key ].height,  this.cart[ key ].width);
          tempJob.basePrice = this.cart[ key ].basePrice;
          jobs.push(tempJob);
        } else {
          // if we have an active job that is in the cart add it
          jobs.push(this.createActiveJobObject(clickedOption, exceptionPage, action));
          activeJobAdded = true;
        }
      });
    }

    if (!activeJobAdded && this.activeJob.groupVO.length > 0) {
      jobs.push(this.createActiveJobObject(clickedOption, exceptionPage, action));
    }

    return new CondTicketingParam(
      this.storeInfoService.getLanguageValue(),
      action,
      ['BASE'],
      customerObj,
      this.storeInfoService.getStoreNumber(),
      this.storeInfoService.getStoreId(),
      this.storeInfoService.getLanguageValue(),
      jobs
    );
  }

  /**
   * @param cart
   * @param orderCustomer CustomerInformation
   * @param orderCustomerPreferredContact PreferredContact
   * @param action
   * @returns CondTicketingParam
   */
  createCondTicketingObj(cart: any, orderCustomer: CustomerInformation,
     orderCustomerPreferredContact: PreferredContact, action: any): CondTicketingParam {
    const jobs: Array<Job> = new Array<Job>();
    const customerObject = this.convertOrderCustomerToCustomerObject(orderCustomer, orderCustomerPreferredContact);

    Object.keys(cart).forEach(
      ( key ) => {
        const activeJob = cart[key];
        let exceptionPagesArray = null;
        if (!this.isEmpty(activeJob.exceptionPages)) {
          exceptionPagesArray = Object.keys(activeJob.exceptionPages).forEach(
            (exceptionPageKey) => {
              this.convertActiveJobExceptionPage(activeJob.exceptionPages[exceptionPageKey], activeJob.productId);
            });
        }
        jobs.push(this.convertActiveJobToPricingJob(activeJob, exceptionPagesArray));
      });

    return new CondTicketingParam(
      this.storeInfoService.getLanguageValue(),
      action,
      ['BASE'],
      customerObject,
      this.storeInfoService.getStoreNumber(),
      this.storeInfoService.getStoreId(),
      this.storeInfoService.getLanguageValue(),
      jobs
    );
  }

  /**
   * @param activeJobExcpetionPage
   * @param productId
   * @returns ExceptionPage
   */
  convertActiveJobExceptionPage(activeJobExcpetionPage: any, productId: any): ExceptionPage {
    if (activeJobExcpetionPage !== null) {
      return new ExceptionPage(activeJobExcpetionPage.pageRange, null, this.getSelectedItemsExceptionPage(activeJobExcpetionPage, null),
        productId, activeJobExcpetionPage.pageCount);
    } else {
      return new ExceptionPage(null, null, null, null, null);
    }
  }
  /**
   * @param orderCustomer: CustomerInformation
   * @param orderCustomerPreferredContact: preferredContact
   * @returns CustomerInformation
   */
  convertOrderCustomerToCustomerObject(orderCustomer: CustomerInformation,
      orderCustomerPreferredContact: PreferredContact ): CustomerObject {
    const customerObject = new CustomerObject();

    if (orderCustomer != null) {
      customerObject.consortiumValue = orderCustomer.consortiumValue;
      customerObject.rewardsNumber = orderCustomer.rewardsNumber;
      if (orderCustomer.bdpFeedData) {
        customerObject.layerCode = orderCustomer.bdpFeedData.layerCode;
        customerObject.layerName = orderCustomer.bdpFeedData.layerName;
        customerObject.tier = orderCustomer.bdpFeedData.tier;
      }
      customerObject.masterAccountNumber = orderCustomer.contractMasterAccountNumber;
      customerObject.firstName = orderCustomer.firstname;
      customerObject.lastName = orderCustomer.lastname;
      customerObject.email = orderCustomer.email;
      customerObject.preferredCompany = orderCustomerPreferredContact.preferredCompany;
      customerObject.preferredEmail = orderCustomerPreferredContact.preferredEmail;
      customerObject.preferredFirstName = orderCustomerPreferredContact.preferredFirstName;
      customerObject.preferredLastName = orderCustomerPreferredContact.preferredLastName;
      customerObject.preferredPhoneNumber = orderCustomerPreferredContact.preferredPhoneNumber;
    } else {
      return new CustomerObject();
    }

    return customerObject;
  }

  /**
   * @param activeJob Active Job
   * @param exceptionPageArrayJB
   * @returns Job
   */
  convertActiveJobToPricingJob(activeJob: ActiveJob, exceptionPageArrayJB: any[]): Job {
    let pricingJob = null;
    if ( activeJob ) {
      pricingJob = new Job(
        activeJob.showImpressions, false, null, this.getSelectedItems(activeJob),
        activeJob.quantity, activeJob.impressions, activeJob.sheets, activeJob.productId,
        activeJob.sku, exceptionPageArrayJB, activeJob.specialInstructions,
        [], activeJob.priceStrategyId, activeJob.jobNumber, activeJob.height,  activeJob.width);
    } else {
      return new Job(null, null, null, null, null, null,
         null, null, null, null, null, null, null, null, null, null );
    }

    return pricingJob;
  }

  createActiveJobObject(clickedOption, exceptionPage, action): Job {
    let activeAOptionBean = null;
    let activeAOptionBeanExp = null;
    if (clickedOption !== null && !exceptionPage) {
      activeAOptionBean = this.createAOptionBean(clickedOption);
    } else if (clickedOption !== null && exceptionPage) {
      activeAOptionBeanExp = this.createAOptionBean(clickedOption);
    }

    const selectedOptions = this.getSelectedItems(this.activeJob);
    const exceptionPageArray = [];

    if (exceptionPage) {
      exceptionPageArray.push(new ExceptionPage(this.activeExceptionPage.pageRange, activeAOptionBeanExp,
        this.getSelectedItemsExceptionPage(this.activeExceptionPage, null),
        this.activeJob.productId, this.activeExceptionPage.pageCount));
    }

    if (this.activeJob.exceptionPages !== undefined && Object.keys(this.activeJob.exceptionPages).length > 0) {
      for (const exPageId in this.activeJob.exceptionPages) {
        const exPage = this.activeJob.exceptionPages[exPageId];
        if (  this.activeExceptionPage !== null && this.activeExceptionPage.exceptionPageCounterId === exPage.exceptionPageCounterId) {
          continue;
        }
        exceptionPageArray.push(new ExceptionPage(exPage.pageRange, null,
          this.getSelectedItemsExceptionPage(exPage, null),
          this.activeJob.productId, exPage.pageCount));
      }
    }

    /* if impressions is null pricing won't work so set to 1 */
    if ( this.activeJob.impressions == null) {
      this.activeJob.impressions = 1;
    }
    const activeJob = new Job(this.activeJob.showImpressions, true, activeAOptionBean,
      selectedOptions, this.activeJob.quantity, this.activeJob.impressions, this.activeJob.sheets,
      this.activeJob.productId, this.activeJob.sku, exceptionPageArray,
      this.activeJob.specialInstructions, this.activeJob.quantities, this.activeJob.priceStrategyId, 0,
      this.activeJob.height,  this.activeJob.width );
    return activeJob;
  }


  createAOptionBean (option) {
    let tempMap = null;
    if (option.id in this.activeJob.productDetails) {
      tempMap = this.activeJob.productDetails[option.id].attributePropertyMap;
    }
    const customOptionsList = [];
    if (option.customOptionsList) {
      for ( const key2 of Object.keys(option.customOptionsList)) {
        if (key2.includes('_')) {
          const splitArr = key2.split('_');
          customOptionsList.push(new CustomOption(splitArr[0], option.customOptionsList[key2]));
        } else {
          customOptionsList.push(new CustomOption(key2, option.customOptionsList[key2]));
        }
      }
    }

    let quantity = 0;
    if (this.activeJob.quantityOptionMap) {
      quantity = this.activeJob.quantityOptionMap[option.id];
    }

    let unitPrice = 0;
    if (this.activeJob.unitPriceMap) {
      unitPrice = this.activeJob.unitPriceMap[option.id];
    }

    let discountType = '';
    if (this.activeJob.priceTypeMap) {
       discountType = this.activeJob.priceTypeMap[option.id];
    }

    return new AOptionBean(option.id, tempMap, option.code, customOptionsList, unitPrice, quantity, discountType);
  }

  /**
   * Function to create shipping request object which is used to get shipping rates for an order
   */
  createShippingRequestObject() {
    const shippingRequest = new ShippingRequest();
    shippingRequest.sourceSystem = 'SB';
    shippingRequest.storeNumber = this.storeInfoService.getStoreNumber();

    if (this.orderCustomer != null && this.orderCustomer.rewardsNumber) {
      shippingRequest.rewardsNumber = this.orderCustomer.rewardsNumber;
    }

    const jobSets = new Array<JobSet>();
    Object.keys(this.cart).forEach( jobKey => {
      const job = this.cart[jobKey];
      const jobSet = new JobSet();
      jobSet.sku = job.jobSkuPriceList[0].rollupSku;
      jobSet.jobQty = job.quantity;
      jobSet.turnTime = 22;
      const documentSets = new Array<DocumentSet>();
      const documentSet = new DocumentSet();
      const configValueSet = new Array<ConfigValueSet>();

      for (let gc = 0; gc < job.groupVO.length; gc++) {
        for (let kc = 0; kc < job.groupVO[gc].keyVO.length; kc++) {
          Object.keys( job.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
            for (let grc = 0; grc < job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
              if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y' &&
                job.groupVO[gc].keyVO[kc].description === 'Flat Size') {

                documentSet.productWidth = job.width;
                documentSet.productHeight = job.height;

                documentSet.sheetQty = job.sheets;
                documentSet.impressionQty = job.impressions;
              }
              // Add all selected V codes to the configValueSet
              if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y' &&
                job.groupVO[gc].attributeGRoupTypeId !== 6) {
                const configValue = new ConfigValueSet();
                configValue.configAttrValueId = job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].code;
                configValueSet.push(configValue);
              }
            }
          });
        }
      }
      documentSet.configValueSet = configValueSet;
      documentSets.push(documentSet);
      jobSet.documentSet = documentSets;
      jobSets.push(jobSet);
    });
    shippingRequest.jobSet = jobSets;

    // populate ShipDetails
    shippingRequest.shipDetails = new ShipDetails(null,
      new Recipient(this.shippingInfoJ.firstName, this.shippingInfoJ.lastName,
        this.shippingInfoJ.address1, this.shippingInfoJ.address2, this.shippingInfoJ.city,
        this.shippingInfoJ.state, this.shippingInfoJ.zip, 'US', this.isResidential,
        this.orderCustomer.email, this.orderCustomer.phoneNumber)
      );

    return shippingRequest;
  }

  // getShippingEligibility() {

  //   let isEligible = { validRates : 'N', validProducts : 'N' };

  //     this.shippingService.submitShippingRequest(
  //       this.createShippingRequestObject()).subscribe(
  //         ( result ) => {
  //           console.log('result: '+JSON.stringify(result));
  //           isEligible.validRates = result.body.validRates;
  //           isEligible.validProducts = result.body.validProducts;
  //         },
  //         ( error ) => {

  //           this.disableShipping();
  //           // POPULATE USER FRIENDLY MESSAGE
  //         },
  //         ( ) => { }
  //     );

  //     return isEligible;
  //   }

  /**
   * Function to create order submission object which is used to submit an order
   */
  createOrderSubmissionObject() {
    this.isEditJob = false;
    const orderSubmission = new OrderSubmission();
    orderSubmission.orderName = this.orderName;
    orderSubmission.country = this.storeInfoService.storeDetails.country.shortName;
    orderSubmission.dueDate = this.getLatestTurnTime();
    orderSubmission.customer = this.createOrderSubmissionCustomerObject();
    orderSubmission.orderType = SubmitType.Order;
    orderSubmission.storeId = this.storeInfoService.getStoreId();
    orderSubmission.storeNumber = this.storeInfoService.getStoreNumber();
    orderSubmission.jobs = this.createOrderSubmissionJobsObject();
    orderSubmission.totalOrderPrice = this.totalOrderPrice;
    orderSubmission.userName = this.userService.user.id.toString();
    orderSubmission.deliveryMode = this.deliveryMethod;
    orderSubmission.isCustomerSearch = this.isCustomerSearch;
    // TODO Refactor shippingInfoJ to not refer to address/cust info outside of Recipient object
    if (orderSubmission.deliveryMode.toLowerCase() === 'shipping') {
      orderSubmission.shippingInfoJ = this.shippingInfoJ;
      orderSubmission.shippingInfoJ.recipient = this.createOrderSubmissionShippingRecipient();
      orderSubmission.shippingInfoJ.deliveryDate =
        new Date(orderSubmission.shippingInfoJ.deliveryDate);
    } else {
      orderSubmission.shippingInfoJ = null;
    }

    return orderSubmission;
  }

  createOrderSubmissionShippingRecipient() {
    return new Recipient(
      this.shippingInfoJ.firstName, this.shippingInfoJ.lastName, this.shippingInfoJ.address1,
      this.shippingInfoJ.address2, this.shippingInfoJ.city, this.shippingInfoJ.state,
      this.shippingInfoJ.zip, 'US', this.isResidential, this.orderCustomer.email,
      this.orderCustomer.phoneNumber
    );
  }

  createOrderSubmissionCustomerObject() {
    const customerObj: CustomerObject = new CustomerObject();
    if (this.orderCustomer != null) {
      customerObj.consortiumValue = this.orderCustomer.consortiumValue;
      customerObj.rewardsNumber = this.orderCustomer.rewardsNumber;
      if (this.orderCustomer.bdpFeedData) {
        customerObj.layerCode = this.orderCustomer.bdpFeedData.layerCode;
        customerObj.layerName = this.orderCustomer.bdpFeedData.layerName;
        customerObj.tier = this.orderCustomer.bdpFeedData.tier;
      }
      customerObj.masterAccountNumber = this.orderCustomer.contractMasterAccountNumber;
      customerObj.firstName = this.orderCustomer.firstname;
      customerObj.lastName = this.orderCustomer.lastname;
      customerObj.email = this.orderCustomer.email;
      customerObj.address1 = this.orderCustomer.address1;
      customerObj.address2 = this.orderCustomer.address2;
      customerObj.phoneNumber = this.orderCustomer.phoneNumber;
      customerObj.city = this.orderCustomer.city;
      customerObj.state = this.orderCustomer.state;
      customerObj.zipcode = this.orderCustomer.zip;
      customerObj.company = this.orderCustomer.company;
      let customerNumber = this.orderCustomer.echcustomerid;
      if ( this.orderCustomer.rewardsNumber) {
        customerNumber = this.orderCustomer.rewardsNumber;
      }
      customerObj.customerNumber = customerNumber; // getting Error need to figure out what ID to
      // customerObj.setCustomerId('7243691');
      customerObj.preferredCompany = this.orderCustomerPreferredContact.preferredCompany;
      customerObj.preferredEmail = this.orderCustomerPreferredContact.preferredEmail;
      customerObj.preferredFirstName = this.orderCustomerPreferredContact.preferredFirstName;
      customerObj.preferredLastName = this.orderCustomerPreferredContact.preferredLastName;
      customerObj.preferredPhoneNumber = this.orderCustomerPreferredContact.preferredPhoneNumber;
      customerObj.preferredContactMode = this.orderCustomerPreferredContact.preferredContactMode;
    }
    return customerObj;
  }

  createOrderSubmissionJobsObject() {
    const restapleOriginals = this.translate.instant('CONFIG.restapleOriginals');
    const jobs = [];
    Object.keys(this.cart).forEach( jobKey => {
      const job = this.cart[jobKey];
      const orderSubJob = new OrderSubmissionJob();
      orderSubJob.jobName = job.configProduct.name;
      orderSubJob.activeJob = false;
      orderSubJob.bDPDiscount = job.bDPDiscount;
      orderSubJob.categoryId = job.configProduct.categoryId;
      orderSubJob.categoryCode = job.configProduct.categoryCode;
      // orderSubJob.dueDate = job.turnTimeOptions[job.selectedTurnTime].dueDate.replace(/,/g, ' ');

      if (job.selectedTurnTime) {
          orderSubJob.dueDate = job.turnTimeOptions[job.selectedTurnTime].dueDate;
          orderSubJob.price = job.turnTimeOptions[job.selectedTurnTime].totalPrice;
      } else {
          orderSubJob.dueDate = job.dueDate;
          orderSubJob.price = job.totalDiscountedPrice;
      }
      orderSubJob.supplierCost = job.supplierCost;
      orderSubJob.errorMessage = 'string';
      orderSubJob.impressions = job.impressions;

      // may have to update to get other than 0
      orderSubJob.inputMultiplierQuantity = job.jobSkuPriceList.length > 0 ? job.jobSkuPriceList[0].inputMultiplierQuantity : 0;

      orderSubJob.isExpressEligible = job.isExpressEligible;
      orderSubJob.isRestapleOriginal = job.isRestapleOriginal;
      orderSubJob.jobIndex = job.jobNumber;
      orderSubJob.pageCount = job.sheets;
      orderSubJob.preconfiguredProductId = job.configProduct.preconfiguredProductId;
      orderSubJob.productId = job.configProduct.productId;
      orderSubJob.quantity = job.quantity;
      orderSubJob.quoteDiscount = 0;
      orderSubJob.singleSkuDiscountedPrice = !!job.priceResponse ? job.priceResponse.mappingItemBeans[0].singleSkuDiscountedPrice : 0;
      orderSubJob.singleSkuPrice = !!job.priceResponse ? job.priceResponse.mappingItemBeans[0].singleSkuPrice : 0;

      if (!!job.priceResponse && !!job.priceResponse.baseList) {
        orderSubJob.priceBeforeDiscounts = 0;
        for (const idx of Object.keys(job.priceResponse.baseList)) {
          orderSubJob.priceBeforeDiscounts += job.priceResponse.baseList[idx].totalSKUPrice;
        }
      }

      if (job.isRestapleOriginal && job.specialInstructions !== '') {
        orderSubJob.specialInstructions = job.specialInstructions + ' | ' + restapleOriginals;
      } else if (job.isRestapleOriginal && job.specialInstructions === '') {
        orderSubJob.specialInstructions = restapleOriginals;
      } else {
        orderSubJob.specialInstructions = job.specialInstructions;
      }
      orderSubJob.templateId = job.configProduct.code;
      orderSubJob.totalDiscountedPrice = job.totalDiscountedPrice;
      orderSubJob.jobAttributeOption = [];
      orderSubJob.jobSkuPriceList1 = [];
      for (let gc = 0; gc < job.groupVO.length; gc++) {
        for (let kc = 0; kc < job.groupVO[gc].keyVO.length; kc++) {
          Object.keys( job.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
            for (let grc = 0; grc < job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
              if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y' &&
                job.groupVO[gc].attributeGRoupTypeId !== 6) {
                const tempAO = new JobAttributeOption();
                const customOptionsSubmitList = [];
                tempAO.attributeOptionGroupKey = job.groupVO[gc].keyVO[kc].key;
                tempAO.attributeOptionId = job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id;
                tempAO.description = job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].description;
                tempAO.extendedPrice = 0;
                tempAO.inputMultiplierQuantity = job.jobSkuPriceList.length > 0 ? job.jobSkuPriceList[0].inputMultiplierQuantity : 0;
                tempAO.jobAttributeOptionId = 0;
                tempAO.jobId = 0;
                tempAO.orderId = 1;
                tempAO.name = job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].value;
                tempAO.productId = job.configProduct.productId;
                tempAO.quantity = this.activeJob.quantityOptionMap[tempAO.attributeOptionId];
                tempAO.priceType = this.activeJob.priceTypeMap[tempAO.attributeOptionId];
                tempAO.unitPrice = job.unitPriceMap[tempAO.attributeOptionId];
                if (job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList) {
                  for ( const key2 of Object.keys(job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList)) {
                    const customOption: any = job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptions;
                    let customPrompt = '';
                    for (let count = 0; count < customOption.length; count++) {
                        if ( customOption[count]['customKey'] === key2 ) {
                          customPrompt = customOption[count]['customPrompt'];
                        }
                    }
                    if (key2.includes('_')) {
                      const splitArr = key2.split('_');
                      customOptionsSubmitList.push(new CustomOptionSubmit(job.groupVO[gc].keyVO[kc]
                        .optionVO.groupingVO[key][grc].id, splitArr[0], job.groupVO[gc].keyVO[kc]
                        .optionVO.groupingVO[key][grc].customOptionsList[key2], customPrompt));
                    } else {
                      customOptionsSubmitList.push(new CustomOptionSubmit(job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id,
                        key2, job.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].customOptionsList[key2], customPrompt));
                    }
                  }
                  tempAO.customOptionsList = customOptionsSubmitList;
                }
                orderSubJob.jobAttributeOption.push(tempAO);
              }
            }
          });
        }
      }
     
      for (let count = 0; count < job.jobSkuPriceList.length; count++) {
        let jobSkuPriceList = new JobSkuPriceList1();
        jobSkuPriceList.inputMultiplierQuantity = job.jobSkuPriceList[count].inputMultiplierQuantity;
        jobSkuPriceList.rollupSku = job.jobSkuPriceList[count].rollupSku;
        jobSkuPriceList.singleSkuDiscountedPrice = job.jobSkuPriceList[count].singleSkuDiscountedPrice;
        jobSkuPriceList.singleSkuPrice = job.jobSkuPriceList[count].singleSkuPrice;
        orderSubJob.jobSkuPriceList1.push(jobSkuPriceList);
      }  


      if (job.selectedTurnTime) {
        orderSubJob.turnTimeName = job.turnTimeOptions[job.selectedTurnTime].turnTimeName;
        if ( job.turnTimeOptions[job.selectedTurnTime].hasOwnProperty('sku') ) {
          let jobSkuPriceList = new JobSkuPriceList1();
          jobSkuPriceList.inputMultiplierQuantity = 1;
          jobSkuPriceList.rollupSku = job.turnTimeOptions[job.selectedTurnTime].sku;
          jobSkuPriceList.singleSkuDiscountedPrice =
            Number.parseFloat(Number.parseFloat(job.turnTimeOptions[job.selectedTurnTime].priceAdjustment).toFixed(2));
          jobSkuPriceList.singleSkuPrice =
            Number.parseFloat(Number.parseFloat(job.turnTimeOptions[job.selectedTurnTime].priceAdjustment).toFixed(2));
          orderSubJob.jobSkuPriceList1.push(jobSkuPriceList);
        }
      }
      orderSubJob.turnTimeSet = job.turnTimeOptions;


      if ( this.shippingEnabled.value ) {

        const shippingSku = new JobSkuPriceList1();
        // Currently victor returns a Template, so stripping T until issue is patched
        shippingSku.inputMultiplierQuantity = 1;
        shippingSku.rollupSku = this.shippingOption.feeTemplateSku;
        shippingSku.singleSkuPrice = Number.parseFloat(this.shippingOption.total);
        shippingSku.singleSkuDiscountedPrice = Number.parseFloat(this.shippingOption.total);
        orderSubJob.jobSkuPriceList1.push(shippingSku);
      }

      const exceptionPageArray = [];

      if (Object.keys(this.cart[jobKey].exceptionPages).length > 0) {
       for (const i in this.cart[jobKey].exceptionPages) {
          exceptionPageArray.push(new ExceptionPage(this.cart[jobKey].exceptionPages[i].pageRange, null,
            this.getSelectedItemsExceptionPage(this.cart[jobKey].exceptionPages[i], null),
            this.cart[jobKey].productId, this.cart[jobKey].exceptionPages[i].pageCount));

        }
      }
      orderSubJob.exceptionPageArray = exceptionPageArray;

      // Set input object for file
      const jobInput = new JobInput(null, null, null, null, job.fileNotes,
        null, null, 'Y', null);
      this.LOGGER.debug('usePrintReadyFile: ' + job.usePrintReadyFile);
      if (job.mediaType === 0 && !!job.printBrokerFiles && job.usePrintReadyFile) {
        this.LOGGER.debug('using print ready');
        const pos = job.printBrokerFiles.fileDescriptions.length > 1 ? 1 : 0;
        jobInput.fileFullName = job.printBrokerFiles.fileDescriptions[pos].fileUrl;
        jobInput.fileName = job.printBrokerFiles.fileDescriptions[pos].fileName;
        jobInput.isDigitalSD = 'N';
        jobInput.fileId = job.printBrokerFiles.fileDescriptions[pos].id;
      } else if (job.mediaType === 0 && !!job.printBrokerFiles && !job.usePrintReadyFile ) {
        this.LOGGER.debug('using original');
        jobInput.fileFullName = job.printBrokerFiles.fileDescriptions[0].fileUrl;
        jobInput.fileName = job.printBrokerFiles.fileDescriptions[0].fileName;
        jobInput.isDigitalSD = 'N';
        jobInput.fileId = job.printBrokerFiles.fileDescriptions[0].id;
      } else if (job.mediaType === 0 && !!job.multipleFiles ) {
        this.LOGGER.debug('DS Multiple Files');
        // TODO Add any DS logic here
      } else if (job.mediaType === 1) {
        // jobInput.isSavedToMps = 'N';
        jobInput.isHardcopy = 'Y';
      }

      orderSubJob.input = jobInput;
      this.LOGGER.debug('Order Sub Job {createOrderSubmissionJobsObject()}');
      this.LOGGER.debug(orderSubJob);
      jobs.push(orderSubJob);
    });
    return jobs;
  }

  getLatestTurnTime() {
    let turnTime = null;
    Object.keys(this.cart).forEach(key => {
      if (turnTime === null) {
        if (this.cart[key].selectedTurnTime) {
          turnTime = this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime].dueDate;
          const tT = new Date(turnTime);
          const cT = new Date(this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime].dueDate);
          if ( tT.getTime() < cT.getTime() ) {
            turnTime = this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime].dueDate;
          }
        } else if (this.cart[key].turnTimeOptions) {
          Object.keys(this.cart[key].turnTimeOptions).forEach(tTimeKey => {
            turnTime = this.cart[key].turnTimeOptions[tTimeKey].dueDate;
            this.cart[key].selectedTurnTime = this.cart[key].turnTimeOptions[tTimeKey].turnTimeName;
          });
          const tT = new Date(turnTime);
          const cT = new Date(this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime].dueDate);
          if ( tT.getTime() < cT.getTime() ) {
            turnTime = this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime].dueDate;
          }
        } else if (this.cart[key].dueDate) {
            // No turn time = design service product
            turnTime = this.cart[key].dueDate;
        }
      }
    });
    return turnTime;
  }

  processConditionalTicketing(job) {
    const affectedArray = [];
    if (job.affectedAttributeOptionIds !== undefined) {
      for (let i = 0 ; i < job.affectedAttributeOptionIds.length; i++) {
        affectedArray.push(job.affectedAttributeOptionIds[i].attributeOptionId);
      }
    }

    const selectedArray = [];
    if (job.selectedAttributeOptionIds !== undefined) {
      for (let i = 0 ; i < job.selectedAttributeOptionIds.length; i++) {
        selectedArray.push(job.selectedAttributeOptionIds[i].attributeOptionId);
      }
    }

    this.activeJob.isNoneSelected = job.isAllNoneSelected;

    this.activeJob.height = job.productHeight;
    this.activeJob.width = job.productWidth;

    for (let gc = 0; gc < this.activeJob.groupVO.length; gc++) {
      for (let kc = 0; kc < this.activeJob.groupVO[gc].keyVO.length; kc++) {
        Object.keys( this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO).forEach(key => {
          for (let grc = 0; grc < this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key].length; grc++) {
            if (selectedArray.includes(this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id)) {
              this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected = 'Y';
              this.activeJob.groupVO[gc].keyVO[kc].optionVO.selectedGroup = key;
              if (this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDCS === 'Y') {
                this.activeJob.isDCSJob = true;
              }
            } else {
              this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isSelected = 'N';
            }

            if (affectedArray.includes(this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].id)) {
              this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDisabled = true;
            } else {
              this.activeJob.groupVO[gc].keyVO[kc].optionVO.groupingVO[key][grc].isDisabled = false;
            }
          }
        });
      }
    }
    this.canProceed = true;
  }

  processConditionalTicketingExceptionPage(job) {
    const affectedArray = [];
    if (job.affectedAttributeOptionIds !== undefined) {
      for (let i = 0 ; i < job.affectedAttributeOptionIds.length; i++) {
        affectedArray.push(job.affectedAttributeOptionIds[i].attributeOptionId);
      }
    }

    const selectedArray = [];
    if (job.selectedAttributeOptionIds !== undefined) {
      for (let i = 0 ; i < job.selectedAttributeOptionIds.length; i++) {
        selectedArray.push(job.selectedAttributeOptionIds[i].attributeOptionId);
      }
    }

    for (let kc = 0; kc < this.activeExceptionPage.keyVO.length; kc++) {
      Object.keys( this.activeExceptionPage.keyVO[kc].optionVO.groupingVO).forEach(key => {
        for (let grc = 0; grc < this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key].length; grc++) {
          if (selectedArray.includes(this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].id)) {
            this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].isSelected = 'Y';
            this.activeExceptionPage.keyVO[kc].optionVO.selectedGroup = key;
          } else {
            this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].isSelected = 'N';
          }

          if (affectedArray.includes(this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].id)) {
            this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].isDisabled = true;
          } else {
            this.activeExceptionPage.keyVO[kc].optionVO.groupingVO[key][grc].isDisabled = false;
          }
        }
      });
    }
  }

  processPricing (orderPricing, jobs) {
    this.orderPricing = orderPricing;
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[ i ].jobIndex === 0 && jobs[ i ].activeJob && this.activeJob !== null) {
        this.activeJob.price = jobs[ i ].price;
        this.activeJob.bDPDiscount = jobs[ i ].bDPDiscount;
        this.activeJob.priceResponse = jobs[ i ].priceResponse;

        // set variables for displaying price
        if (!!jobs[i].priceResponse && !!jobs[i].priceResponse.baseList) {
          this.activeJob.basePrice = 0;
          this.activeJob.jobLevelDiscount = 0;
          for (const idx of Object.keys(jobs[i].priceResponse.baseList)) {
            this.activeJob.basePrice += jobs[i].priceResponse.baseList[idx].totalSKUPrice;
            this.activeJob.jobLevelDiscount = (jobs[i].priceResponse.baseList[idx].totalSKUPrice -
              jobs[i].priceResponse.baseList[idx].totalSKUDiscountedPrice);
          }
        }

        this.activeJob.jobSubtotal = this.activeJob.basePrice - this.activeJob.jobLevelDiscount;


        this.activeJob.totalDiscountedPrice = jobs[ i ].totalDiscountedPrice;
        this.activeJob.turnTimeOptions = jobs[ i ].turnTimeOptions;
        this.activeJob.supplierCost = jobs[i].supplierCost;

        // If selected turn time no longer valid due to change deselect it
        if (!!this.activeJob.turnTimeOptions && !this.activeJob.turnTimeOptions[ this.activeJob.selectedTurnTime ]) {
          this.activeJob.selectedTurnTime = null;
        }

        this.activeJob.isExpressEligible = jobs[ i ].isExpressEligible;
        this.activeJob.jobSkuPriceList = jobs[ i ].jobSkuPriceList;
        this.activeJob.unitPriceMap = {};
        this.activeJob.quantityOptionMap = {};
        this.activeJob.priceTypeMap = {};

        // Set turntime if only one option is available
        this.defaultJobsWithOneTurnTimeToFirstOption();

        for (const aOption of jobs[ i ].selectedAttributeOptionIds) {
          this.activeJob.unitPriceMap[ aOption.attributeOptionId ] = aOption.unitPrice;
          this.activeJob.quantityOptionMap[ aOption.attributeOptionId ] = aOption.quantity;
          this.activeJob.priceTypeMap[ aOption.attributeOptionId ] = aOption.priceType;
        }
        if (jobs[ i ].exceptionPageArray.length > 0) {
          for (let exceptionPageCount = 0; exceptionPageCount < jobs[ i ].exceptionPageArray.length; exceptionPageCount++) {
            const exceptionPage = jobs[ i ].exceptionPageArray[ exceptionPageCount ];
            if (exceptionPage.selectedAttributeOptionIds !== undefined) {
              for (const exPageId in  this.activeJob.exceptionPages) {
                const exPage = this.activeJob.exceptionPages[ exPageId ];
                if (exPage.pageRange === exceptionPage.pageRange) {
                  for (let e = 0; e < exceptionPage.selectedAttributeOptionIds.length; e++) {
                    if (this.activeExceptionPage === null) {
                      this.activeJob.exceptionPages[ exPageId ].unitPriceMap[
                        exceptionPage.selectedAttributeOptionIds[ e ].attributeOptionId ] =
                        jobs[ i ].selectedAttributeOptionIds[ e ].unitPrice;
                      this.activeJob.exceptionPages[ exPageId ].quantityOptionMap[
                        exceptionPage.selectedAttributeOptionIds[ e ].attributeOptionId ] =
                        jobs[ i ].selectedAttributeOptionIds[ e ].quantity;
                      this.activeJob.exceptionPages[ exPageId ].priceTypeMap[
                        exceptionPage.selectedAttributeOptionIds[ e ].attributeOptionId ] =
                        jobs[ i ].selectedAttributeOptionIds[ e ].priceType;
                    } else {
                      this.activeExceptionPage.unitPriceMap[ exceptionPage.selectedAttributeOptionIds[ e ].attributeOptionId ] =
                        jobs[ i ].selectedAttributeOptionIds[ e ].unitPrice;
                      this.activeExceptionPage.quantityOptionMap[ exceptionPage.selectedAttributeOptionIds[ e ].attributeOptionId ] =
                        jobs[ i ].selectedAttributeOptionIds[ e ].quantity;
                      this.activeExceptionPage.priceTypeMap[ exceptionPage.selectedAttributeOptionIds[ e ].attributeOptionId ] =
                        jobs[ i ].selectedAttributeOptionIds[ e ].priceType;
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        const jobKey = jobs[ i ].jobIndex;

        // set variables for displaying price
        if (jobs[i].priceResponse && jobs[i].priceResponse.baseList) {
        this.cart[jobKey].basePrice = 0;
        this.cart[jobKey].jobLevelDiscount = 0;
          for (const idx of Object.keys(jobs[i].priceResponse.baseList)) {
            this.cart[jobKey].basePrice += jobs[i].priceResponse.baseList[idx].totalSKUPrice;
            this.cart[jobKey].jobLevelDiscount += (jobs[i].priceResponse.baseList[idx].totalSKUPrice -
            jobs[i].priceResponse.baseList[idx].totalSKUDiscountedPrice);
          }
        }

        this.cart[jobKey].jobSubtotal = this.cart[jobKey].basePrice - this.cart[jobKey].jobLevelDiscount;
        this.cart[jobKey].price = jobs[ i ].price;
        this.cart[jobKey].bDPDiscount = jobs[ i ].bDPDiscount;
        this.cart[jobKey].priceResponse = jobs[ i ].priceResponse;
        this.cart[jobKey].savingsCatcher = jobs[ i ].savingsCatcher;
        this.cart[jobKey].totalDiscountedPrice = jobs[ i ].totalDiscountedPrice;
        this.cart[jobKey].turnTimeOptions = jobs[ i ].turnTimeOptions;
        this.cart[jobKey].supplierCost = jobs[i].supplierCost;

        // If selected turn time no longer valid due to change deselect it
        if (!!this.cart[jobKey].turnTimeOptions && !this.cart[jobKey].turnTimeOptions[ this.cart[jobKey].selectedTurnTime ]) {
          this.cart[jobKey].selectedTurnTime = null;
        }

        this.cart[jobKey].isExpressEligible = jobs[ i ].isExpressEligible;
        this.cart[jobKey].jobSkuPriceList = jobs[ i ].jobSkuPriceList;
        this.cart[jobKey].unitPriceMap = {};
        this.cart[jobKey].quantityOptionMap = {};
        this.cart[jobKey].priceTypeMap = {};


        for (const aOption of jobs[ i ].selectedAttributeOptionIds) {
          this.cart[jobKey].unitPriceMap[ aOption.attributeOptionId ] = aOption.unitPrice;
          this.cart[jobKey].quantityOptionMap[ aOption.attributeOptionId ] = aOption.quantity;
          this.cart[jobKey].priceTypeMap[ aOption.attributeOptionId ] = aOption.priceType;
        }
        if (jobs[i].exceptionPageArray.length > 0) {
          for (let exceptionPageCount = 0; exceptionPageCount < jobs[i].exceptionPageArray.length; exceptionPageCount++) {
            const exceptionPage = jobs[i].exceptionPageArray[exceptionPageCount];
            if (exceptionPage.selectedAttributeOptionIds !== undefined) {
              for (const exPageId in this.cart[jobKey].exceptionPages) {
                const exPage = this.cart[jobKey].exceptionPages[exPageId];
                if (exPage.pageRange === exceptionPage.pageRange) {
                  for (let e = 0; e < exceptionPage.selectedAttributeOptionIds.length; e++) {
                    this.cart[jobKey].exceptionPages[exPageId].unitPriceMap[
                      exceptionPage.selectedAttributeOptionIds[e].attributeOptionId] =
                      jobs[i].selectedAttributeOptionIds[e].unitPrice;
                    this.cart[jobKey].exceptionPages[exPageId].quantityOptionMap[
                      exceptionPage.selectedAttributeOptionIds[e].attributeOptionId] =
                      jobs[i].selectedAttributeOptionIds[e].quantity;
                    this.cart[jobKey].exceptionPages[exPageId].priceTypeMap[
                      exceptionPage.selectedAttributeOptionIds[e].attributeOptionId] =
                      jobs[i].selectedAttributeOptionIds[e].priceType;
                  }
                }
              }
            }
          }
        }
      }
    }
  this.orderPriceData.next(this.calcOrderPriceData(this.cart));
  this.calcJobPriceData(this.activeJob);
  this.canProceed = true;
  }


  processPriceResponse(updatedJobs: any, currentJobsInCart: any): any {
    const updatedActiveJobs = {};
    for (let i = 0; i < updatedJobs.length; i++) {
      const jobKey = updatedJobs[i].jobIndex;
      // make a copy of the corresponding active job in cart
      const activeJob = JSON.parse(JSON.stringify(currentJobsInCart[jobKey]));
      activeJob.multipleFiles = currentJobsInCart[jobKey].multipleFiles;
      // set variables for displaying price
      if (updatedJobs[i].priceResponse && updatedJobs[i].priceResponse.baseList) {
        activeJob.basePrice = 0;
        activeJob.jobLevelDiscount = 0;
        for (const idx of Object.keys(updatedJobs[i].priceResponse.baseList)) {
          activeJob.basePrice += updatedJobs[i].priceResponse.baseList[idx].totalSKUPrice;
          activeJob.jobLevelDiscount += (updatedJobs[i].priceResponse.baseList[idx].totalSKUPrice -
            updatedJobs[i].priceResponse.baseList[idx].totalSKUDiscountedPrice);
        }
      }
      // subtotal calc
      activeJob.jobSubtotal = activeJob.basePrice - activeJob.jobLevelDiscount;
      activeJob.price = updatedJobs[i].price;
      activeJob.bDPDiscount = updatedJobs[i].bDPDiscount;
      activeJob.priceResponse = updatedJobs[i].priceResponse;
      activeJob.savingsCatcher = updatedJobs[i].savingsCatcher;
      // Hmmmm?
      activeJob.totalDiscountedPrice = updatedJobs[i].totalDiscountedPrice;
      activeJob.turnTimeOptions = updatedJobs[i].turnTimeOptions;

      // If selected turn time no longer valid due to change deselect it
      if (!!activeJob.turnTimeOptions && !activeJob.turnTimeOptions[activeJob.selectedTurnTime]) {
        activeJob.selectedTurnTime = null;
      }

      activeJob.isExpressEligible = updatedJobs[i].isExpressEligible;
      activeJob.jobSkuPriceList = updatedJobs[i].jobSkuPriceList;
      activeJob.unitPriceMap = {};
      activeJob.quantityOptionMap = {};
      activeJob.priceTypeMap = {};


      for (const aOption of updatedJobs[i].selectedAttributeOptionIds) {
        activeJob.unitPriceMap[aOption.attributeOptionId] = aOption.unitPrice;
        activeJob.quantityOptionMap[aOption.attributeOptionId] = aOption.quantity;
        activeJob.priceTypeMap[aOption.attributeOptionId] = aOption.priceType;
      }
      if (updatedJobs[i].exceptionPageArray !== undefined) {
        if (updatedJobs[i].exceptionPageArray.length > 0) {
          for (let exceptionPageCount = 0; exceptionPageCount < updatedJobs[i].exceptionPageArray.length; exceptionPageCount++) {
            const exceptionPage = updatedJobs[i].exceptionPageArray[exceptionPageCount];
            if (exceptionPage.selectedAttributeOptionIds !== undefined) {
              for (const exPageId in activeJob.exceptionPages) {
                const exPage = activeJob.exceptionPages[exPageId];
                if (exPage.pageRange === exceptionPage.pageRange) {
                  for (let e = 0; e < exceptionPage.selectedAttributeOptionIds.length; e++) {
                    activeJob.exceptionPages[exPageId].unitPriceMap[
                      exceptionPage.selectedAttributeOptionIds[e].attributeOptionId] =
                      updatedJobs[i].selectedAttributeOptionIds[e].unitPrice;
                    activeJob.exceptionPages[exPageId].quantityOptionMap[
                      exceptionPage.selectedAttributeOptionIds[e].attributeOptionId] =
                      updatedJobs[i].selectedAttributeOptionIds[e].quantity;
                    activeJob.exceptionPages[exPageId].priceTypeMap[
                      exceptionPage.selectedAttributeOptionIds[e].attributeOptionId] =
                      updatedJobs[i].selectedAttributeOptionIds[e].priceType;
                  }
                }
              }
            }
          }
        }
      }
      updatedActiveJobs[jobKey] = activeJob;
    }
    this.orderPriceData.next(this.calcOrderPriceData(updatedActiveJobs));
    this.calcJobPriceData(this.activeJob);
    return updatedActiveJobs;
  }



  /**
   * Get the first selected option if you need to price and conditional ticket without having an option clicked
   * (ie on config load)
   */
  getFirstSelectedOption() {
    let itemKey = null;
    let itemC = 0;

    Object.keys( this.activeJob.groupVO[0].keyVO[0].optionVO.groupingVO).forEach(key => {
      for (let grc = 0; grc < this.activeJob.groupVO[0].keyVO[0].optionVO.groupingVO[key].length; grc++) {
        if ( this.activeJob.groupVO[0].keyVO[0].optionVO.groupingVO[key][grc].isSelected === 'Y' ) {
          itemKey = key;
          itemC = grc;
        }
      }
    });
    return this.activeJob.groupVO[0].keyVO[0].optionVO.groupingVO[itemKey][itemC];
  }

  /**
   * Get the selected options for an order with options selected other than default to be used for
   * pricing and conditional ticketing (e.g. on reorder).
   */
  getSelectedOptions(selectedOptions) {

    const selectedOptionsMap = {};
    selectedOptions.forEach( option => {
      selectedOptionsMap[option.id] = option;
    });
    const selectedMapKeys = Object.keys(selectedOptionsMap);
    let returnSelectedOption = null;
    for (let g = 0; g < this.activeJob.groupVO.length; g++) {
      for (let z = 0; z < this.activeJob.groupVO[ g ].keyVO.length; z++) {
        Object.keys(this.activeJob.groupVO[ g ].keyVO[ z ].optionVO.groupingVO).forEach(key => {
          for (let grc = 0; grc < this.activeJob.groupVO[ g ].keyVO[ z ].optionVO.groupingVO[ key ].length; grc++) {
            if (selectedMapKeys.includes(String(this.activeJob.groupVO[ g ].keyVO[ z ].optionVO.groupingVO[ key ][ grc ].id))) {
              const optionId = String(this.activeJob.groupVO[ g ].keyVO[ z ].optionVO.groupingVO[ key ][ grc ].id);
              this.activeJob.groupVO[g].keyVO[z].optionVO.groupingVO[key][grc].isSelected = 'Y';
              this.activeJob.groupVO[g].keyVO[z].optionVO.selectedGroup = key;
              // custom options
              if (selectedOptionsMap[ optionId ].attributeCustomOptionBeanList.length > 0) {
                const cOpt = {};
                let tabPageCount = 0;
                let tabCopyCount = 0;
                selectedOptionsMap[ optionId ].attributeCustomOptionBeanList.forEach( customOption => {
                  if ( customOption.customKey === 'GetTabPage' ) {
                    cOpt[ customOption.customKey + '_' + tabPageCount ] = customOption.inputValue;
                    tabPageCount++;
                  } else if ( customOption.customKey === 'GetTabCopy' ) {
                    cOpt[ customOption.customKey + '_' + tabCopyCount ] = customOption.inputValue;
                    tabCopyCount++;
                  } else {
                    cOpt[ customOption.customKey ] = customOption.inputValue;
                  }
                });

                this.activeJob.groupVO[ g ].keyVO[ z ].optionVO.groupingVO[ key ][ grc ].customOptionsList = cOpt;

              }
              this.updateSheets(optionId);
              returnSelectedOption =  this.activeJob.groupVO[ g ].keyVO[ z ].optionVO.groupingVO[ key ][ grc ];
            } else {
              this.activeJob.groupVO[ g ].keyVO[ z ].optionVO.groupingVO[ key ][ grc ].isSelected = 'N';
            }
          }
        });
      }
    }
    return  returnSelectedOption;
  }

  /**
   * adds a job to the cart object
   */
  addToCart() {
    if (this.isReorder) {
      this.activeJob.configProduct = this.reorderConfigProductMap[this.jobIdCounter];
    } else {
      this.activeJob.configProduct = this.activeConfigProduct;
    }
    this.activeJob.jobNumber = this.jobIdCounter;
    this.cart[this.activeJob.jobNumber] = JSON.parse(JSON.stringify(this.activeJob));
    this.cart[this.activeJob.jobNumber].multipleFiles = this.activeJob.multipleFiles;
    history.replaceState({}, '', 'config?job=' + this.activeJob.jobNumber);
    this.jobIdCounter++;
    this.calculateOrderTotal(null);
    this.orderPriceData.next(this.calcOrderPriceData(this.cart));
    this.cartChanged.next(true);
    this.newProdAddedToCart.next(true);
  }

  /**
   * Takes a cart object and returns an object with order level price data
   * orderDiscount, orderSubtotal, orderTotal, expressFee
   * @param cart
   */
  calcOrderPriceData(cart): object {
    const priceMetaData = {};
    const discount = [];
    const sub = [];
    const turnTime = [];
    let orderDiscount = 0;
    let orderSubtotal = 0;
    let expressFee = 0;
    let orderTotal = 0;

    if (!this.isEmpty(cart)) {
      // aggregate discount, express fees and job base prices for each job
      Object.keys(cart).forEach(jobKey => {
        if (cart[jobKey] !== undefined && cart[jobKey].turnTimeOptions !== undefined && !this.isEmpty(cart[jobKey].turnTimeOptions)) {
          discount.push(cart[jobKey].jobLevelDiscount);
          sub.push(cart[jobKey].basePrice);
          if (cart[jobKey].turnTimeOptions[cart[jobKey].selectedTurnTime] !== undefined &&
              cart[jobKey].turnTimeOptions[cart[jobKey].selectedTurnTime].priceAdjustment !== undefined) {
            turnTime.push(cart[jobKey].turnTimeOptions[cart[jobKey].selectedTurnTime].priceAdjustment);
            cart[jobKey].availabilityFee = cart[jobKey].turnTimeOptions[cart[jobKey].selectedTurnTime].priceAdjustment;
          } else {
            turnTime.push(0);
            cart[jobKey].availabilityFee = 0;
          }
        } else {
          turnTime.push(0);
          cart[jobKey].availabilityFee = 0;
          discount.push(cart[jobKey].jobLevelDiscount);
          sub.push(cart[jobKey].basePrice);
        }
      });

      // calc order level properties from job level properties
      orderDiscount = this.calcOrderDiscount(discount);
      orderSubtotal = (this.calcOrderSubtotal(sub) + this.calcTurnTimeTotal(turnTime));
      expressFee = this.calcTurnTimeTotal(turnTime);
      orderTotal = this.calcOrderTotal(discount, turnTime, sub );
    }

    // create object fields
    priceMetaData['orderDiscount'] = orderDiscount;
    priceMetaData['orderSubtotal'] = orderSubtotal;
    priceMetaData['expressFee'] = expressFee;
    priceMetaData['orderTotal'] = orderTotal;

    return priceMetaData;
  }


  calcJobPriceData(activeJob: ActiveJob): void {
    let priceAdjust = 0;
    if (activeJob.turnTimeOptions !== undefined && activeJob.turnTimeOptions[activeJob.selectedTurnTime] !== undefined
      && activeJob.turnTimeOptions[activeJob.selectedTurnTime].priceAdjustment !== undefined) {
      priceAdjust = activeJob.turnTimeOptions[activeJob.selectedTurnTime].priceAdjustment;
    }
    activeJob.availabilityFee = priceAdjust;
    activeJob.jobSubtotal = this.activeJob.basePrice + priceAdjust;
    activeJob.jobSubtotal = activeJob.jobSubtotal - this.activeJob.jobLevelDiscount;
  }

  isEmpty(obj) {
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop) ) {
            return false;
        }
    }

    return true;
}


  calcOrderSubtotal(jobSubTotalArray: number []): number {
    let subtotal = 0;
    jobSubTotalArray.forEach( jobSubTotal => {
      subtotal = subtotal + jobSubTotal;
    });
    return subtotal;
  }

  calcOrderDiscount(jobDiscountArray: number []): number {
    let orderDiscount = 0;
    jobDiscountArray.forEach( jobDiscount => {
      orderDiscount = orderDiscount + jobDiscount;
    });
    return orderDiscount;
  }

  calcOrderTotal(jobDiscountArray: number[], jobTurnTimePriceArray: number[], jobSubTotalArray: number[]): number {
    let orderTotal = 0;
    orderTotal = (this.calcOrderSubtotal(jobSubTotalArray) + this.calcTurnTimeTotal(jobTurnTimePriceArray));
    orderTotal = (orderTotal - this.calcOrderDiscount(jobDiscountArray));
    return orderTotal;
  }

  calcTurnTimeTotal(turnTimeArray: number []): number {
    let turnTimeTotal = 0;
    turnTimeArray.forEach( jobTurnTimePrice => {
      turnTimeTotal = turnTimeTotal + jobTurnTimePrice;
    });
    return turnTimeTotal;
  }

  /**
   * Updates job in cart.
   */
  updateActiveJob() {
    this.activeJob.configProduct = this.activeConfigProduct;
    this.cart[this.activeJob.jobNumber] = JSON.parse(JSON.stringify(this.activeJob));
    this.cart[this.activeJob.jobNumber].multipleFiles = this.activeJob.multipleFiles;
    this.orderPriceData.next(this.calcOrderPriceData(this.cart));
    this.calcJobPriceData(this.activeJob);
    this.calculateOrderTotal(null);
  }


  addSpecialInstructionsToJob(specialInstructions) {
    this.activeJob.specialInstructions = specialInstructions;
  }

  /**
   * Function to add exception page to job
   */
  addExceptionPageToJob(pageRange, impressionCnt) {
    this.activeExceptionPage.pageRange = pageRange;
    this.activeExceptionPage.pageRangeImpressions = impressionCnt;
    this.activeExceptionPage.exceptionPageCounterId = this.exceptionPageCounter;
    this.activeExceptionPage.pageCount = this.calculatePageCount(pageRange);
    this.activeJob.exceptionPages[this.exceptionPageCounter] = JSON.parse(JSON.stringify(this.activeExceptionPage));
    this.exceptionPageCounter++;
    this.activeExceptionPage = null;
  }

  calculatePageCount(pageRange) {
    const pageRangeArray = pageRange.split('-');
    if (pageRangeArray.length === 1) {
      return 1;
    } else {
      let numberOfPages = Number(pageRangeArray[1]) - Number(pageRangeArray[0]);
      if (this.activeExceptionPage.isDoubleSided !== null && this.activeExceptionPage.isDoubleSided !== false) {
        numberOfPages = numberOfPages / 2;
      }
      return numberOfPages;
    }
  }


  calculateNumberOfDoubleSidedSheetsFromSingleSidedImpressions(impressions) {
    return Math.trunc((impressions / 2)) + (impressions % 2);
  }

  deleteExceptionPageFromJob(id) {
     delete this.activeJob.exceptionPages[id];
  }


  editExceptionPage(id) {
    this.activeExceptionPage = JSON.parse(JSON.stringify(this.activeJob.exceptionPages[id]));
  }

  updateExceptaionPage(id) {
    this.activeJob.exceptionPages[id] = JSON.parse(JSON.stringify(this.activeExceptionPage));
    this.activeExceptionPage = null;
  }

  /**
   * function to return an object of selected exception page values to show in list of config screen
   */
  getSelectedExceptionPageValues(job) {
    const selectedItems = {};
    for (let kc = 0; kc < job.keyVO.length; kc++) {
      Object.keys( job.keyVO[kc].optionVO.groupingVO).forEach(key => {
        for (let grc = 0; grc < job.keyVO[kc].optionVO.groupingVO[key].length; grc++) {
          if (job.keyVO[kc].optionVO.groupingVO[key][grc].isSelected === 'Y' && job.attributeGRoupTypeId !== 6) {
            selectedItems[job.keyVO[kc].key] = job.keyVO[kc].optionVO.groupingVO[key][grc];
          }
        }
      });
    }
    return selectedItems;
  }

  /**
   * returns the number of items in the cart. Created for use by the top nav bar to show the number of Items as a badge
   * on the cart icon.
   */
  cartCount() {
    return Object.keys(this.cart).length;
  }

  getTemplateId() {
    return this.template.productId;
  }

  getTemplate() {
    return this.template;
  }

  changeActiveJob(jobNumber) {
    this.activeJob = JSON.parse(JSON.stringify(this.cart[jobNumber]));
    this.activeJob.multipleFiles = this.cart[jobNumber].multipleFiles;
    this.activeConfigProduct = this.cart[jobNumber].configProduct;
    this.isEditJob = true;
    // this.notificationService.hideLoader();
  }

  deleteJobFromCart(jobNumber) {
    this.isEditJob = false;
    delete this.cart[jobNumber];

    this.hasWorkFrontJob = false;

    Object.keys(this.cart).forEach(key => {
      let keyN = parseInt(key);
      if (this.allowed_workfront_category.indexOf(this.cart[key].configProduct.categoryCode) >= 0) {
        this.hasWorkFrontJob = true;
      }
      if (keyN > jobNumber) {
        this.cart[(keyN - 1).toString()] = this.cart[key];
        this.cart[(keyN - 1).toString()].jobNumber = keyN - 1;
        delete this.cart[key];
      }
    });

    this.jobIdCounter -= 1;

    this.cartChanged.next(true);
  }

  deleteOrder() {
    for (const key in this.cart) {
      delete this.cart[key];
    }

    this.orderCustomer = new CustomerInformation();
    this.orderCustomerSelected = false;
    this.jobIdCounter = 1;
    this.isOrderCustomerInfoValid = false;
    this.isPickUpInfoValid = false;
    this.isEditJob = false;
    this.orderCustomerPreferredContact = new PreferredContact(null, null, null, null, null, null);
    this.orderName = '';
    this.isOrderNameDefault = true;
    this.isEchCustomer = false;
    this.saveCustomer = true;
    this.isEditQuote = false;
    this.orderNumber = null;
    this.hasWorkFrontJob = false;
    this.resetActiveJob();

    this.deleteShippingInfo();
  }

  /**
   * Returns shipping values to default
   */
  deleteShippingInfo() {
    this.showShipping = false;
    this.disableShipping();
    this.shippingInfoJ = new ShippingInfoJ(null, null, null, null, null, null, null, null);
    this.isShippingInfoValid = false;
  }

  resetTotals() {
    this.totalOrderPrice = 0;
    this.totalOrderOriginalPrice = 0;
    this.totalOrderQuantityDiscount = 0;
    this.totalOrderBdpDiscount = 0;
    this.totalOrderSavings = 0;
  }

  calculateOrderTotal(shipCost) {
    this.resetTotals();

    for (const key of Object.keys(this.cart)) {
      // If a turntime is selected use that for pricing else use the standard discounted price
      if (this.cart[key].turnTimeOptions != null &&
        this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime] !== undefined) {
        this.cart[key].totalDiscountedPrice = this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime].totalPrice;
        this.totalOrderPrice += this.cart[key].turnTimeOptions[this.cart[key].selectedTurnTime].totalPrice;
      } else {
        if (this.cart[key].priceResponse) {
          if (  Object.keys(this.cart[key].priceResponse).length > 0) {
            this.cart[key].totalDiscountedPrice = 0;
            for (const idx of Object.keys(this.cart[key].priceResponse.baseList)) {
              this.cart[key].totalDiscountedPrice += this.cart[key].priceResponse.baseList[idx].totalSKUDiscountedPrice;
            }
          }
        }
        this.totalOrderPrice += this.cart[key].totalDiscountedPrice;
      }

      if (this.cart[key].priceResponse && (this.cart[key].priceResponse !== null || this.cart[key].priceResponse !== undefined)) {
        if (this.cart[key].priceResponse.baseList !== undefined && this.cart[key].priceResponse.baseList[0].totalSKUPrice !== undefined) {
          this.totalOrderOriginalPrice = 0;
          for (const idx of Object.keys(this.cart[key].priceResponse.baseList)) {
           this.totalOrderOriginalPrice += this.cart[key].priceResponse.baseList[idx].totalSKUPrice;
          }
        }
      }

      if (this.cart[key].savingsCatcher) {
        this.totalOrderQuantityDiscount += +this.cart[key].savingsCatcher.quantityDiscount;
        this.totalOrderSavings += +this.cart[key].savingsCatcher.savings;
      }
      this.totalOrderBdpDiscount += +this.cart[key].bDPDiscount;
      this.checkValues();
    }
    if (shipCost !== null && shipCost !== undefined) {
      this.totalOrderPrice += +shipCost;
    }
  }

  checkValues() {
    if (Number.isNaN(this.totalOrderOriginalPrice)) {
      this.totalOrderOriginalPrice = 0;
    }
    if (Number.isNaN(this.totalOrderQuantityDiscount)) {
      this.totalOrderQuantityDiscount = 0;
    }
    if (Number.isNaN(this.totalOrderSavings)) {
      this.totalOrderSavings = 0;
    }
    if (Number.isNaN(this.totalOrderBdpDiscount)) {
      this.totalOrderBdpDiscount = 0;
    }
  }

  getCart(): Observable<any> {
    return of(Object.keys(this.cart));
  }

  getCartJobs(): Observable<any> {
    return of(Object(this.cart));
  }
  setIsReorder(val: boolean) {
    this.isReorder = val;
  }

  getIsReorder() {
    return this.isReorder;
  }

  setDeliveryMethod(val: string) {
    this.deliveryMethod = val;
  }

  getDeliveryMethod() {
    return this.deliveryMethod;
  }

  setShippingInfo (rate) {
    if (rate !== null && rate !== undefined) {
      this.shippingInfoJ.serviceName = rate.serviceName;
      this.shippingInfoJ.carrierName = rate.carrierName;
      this.shippingInfoJ.serviceCode = rate.serviceCode;
      this.shippingInfoJ.feeTemplateSku = rate.feeTemplateSku;
      this.shippingInfoJ.deliveryDate = rate.deliveryDate;
      this.shippingInfoJ.shippingFee = rate.total;
    }
  }

  setShippingInfoCustomer(customerInfo: ShippingInfoJ) {
    if (customerInfo !== null && customerInfo !== undefined) {
      this.shippingInfoJ.firstName = customerInfo.firstName;
      this.shippingInfoJ.lastName = customerInfo.lastName;
      this.shippingInfoJ.address1 = customerInfo.address1;
      this.shippingInfoJ.address2 = customerInfo.address2;
      this.shippingInfoJ.city = customerInfo.city;
      this.shippingInfoJ.state = customerInfo.state;
      this.shippingInfoJ.zip = customerInfo.zip;
    }
  }


  clearSelectedShippingOptions() {
    this.selectedShippingOptions = new Array<any>();
  }

  setZip(val: string) {
    if (val !== undefined) {
      val = val.substring(0, 5);
    }
    this.orderCustomer.zip = val;
  }

  getZip() {
    return this.orderCustomer.zip;
  }

  processFileData(fileData: FileInterrogation) {
    this.activeJob.impressions = fileData.impressions;
    this.updateSheets(this.activeJob.selectedSideConfig);
    if (fileData.color) {
      try {
        this.changeSelectedItem(this.getOptionByVCode('V1'));
      } catch (e) {
        this.LOGGER.debug('V1 Does not exist, Trying V638');
        try {
          this.changeSelectedItem(this.getOptionByVCode('V638'));
        } catch (e) {
          this.LOGGER.debug('V638 Does not exist, Trying V26');
          try {
              // Wide Format Color
              this.changeSelectedItem(this.getOptionByVCode('V26'));
          } catch (e) {
              this.notificationService.notify(new SnackNotification(
                this.translate.instant('COMMON.error.printbroker.setColorFailure'), null));
          }
        }
      }

    } else if (!fileData.color) {
      try {
        this.changeSelectedItem( this.getOptionByVCode('V51'));
      } catch (e) {
        this.LOGGER.debug('V51 Does not exist, Trying V236');
        try {
          this.changeSelectedItem(this.getOptionByVCode('V236'));
        } catch (e) {
          this.notificationService.notify(new SnackNotification(this.translate.instant('COMMON.error.printbroker.setBWFailure'), null));
        }
      }
    }

    if (fileData.portrait) {
      this.changeSelectedItem(this.getOptionByVCode('V241'));
    } else {
      this.changeSelectedItem(this.getOptionByVCode('V240'));
    }
  }

  setFilePreview() {
    let returnValue = true;
    this.pdfSrc = environment.rootURL +  '/assets/pdf-test2.pdf';
    if (this.activeJob.printBrokerFiles) {
      const pos = this.activeJob.printBrokerFiles.fileDescriptions.length > 1 ? 1 : 0;
      if (this.activeJob.printBrokerFiles.fileDescriptions[pos].fileUrl.endsWith('.pdf')) {
        this.pdfSrc = this.activeJob.printBrokerFiles.fileDescriptions[pos].fileUrl;
        returnValue = false;
      }
    }

    // Remove https if running locally
    if (!environment.production) {
      this.pdfSrc = this.pdfSrc.replace('https', 'http');
    }
    return  returnValue;
  }

  clearCart() {
    this.cart = new Map<number, ActiveJob>();
  }

  // Sets order config customer to its default values
  // sets customer selected flag to false
  clearCustomer(): void {
    this.orderCustomer = new CustomerInformation();
    this.clearPreferredContact();
    this.isEchCustomer = false;
    this.orderCustomerSelected = false;
  }

  clearPreferredContact(): void {
    this.orderCustomerPreferredContact = new PreferredContact(null, null, null, null, null, null);
  }

  valueContainsDoubleSided(value) {
    if (value.toLowerCase().includes('double') && value.toLowerCase().includes('sided')) {
      return true;
    } else if (value.toLowerCase().includes('single') && value.toLowerCase().includes('sided')) {
      return false;
    }
  }

  /**
   * In the event that a product only has one turn time
   * Automatically select the only available turn time
   */
  defaultJobsWithOneTurnTimeToFirstOption() {
    if (this.activeJob.turnTimeOptions !== null && this.activeJob.turnTimeOptions !== undefined &&
      this.activeJob.turnTimeOptions[this.activeJob.selectedTurnTime] === undefined) {
      if (Object.keys(this.activeJob.turnTimeOptions).length === 1) {
        Object.keys(this.activeJob.turnTimeOptions).forEach(tTimeKey => {
          this.activeJob.selectedTurnTime =
            this.activeJob.turnTimeOptions[tTimeKey].turnTimeName;
        });
      }
    }
  }

  resetActiveJob() {
      this.activeJob = new ActiveJob();
  }

  /**
   * Loops through orderConfigService.cart to check if there is a selectedTurnTime
   * for each key in the cart, then sets this.orderConfigService.isPickupInfoValid based
   * of result
   */
  checkTurnTimeSelectionCompleted() {
    let selectedCount = 0;
    let cartCount = 0;
    Object.keys(this.cart).forEach (
      ( key ) => {
        cartCount ++;
        if (( this.cart[key].selectedTurnTime !== undefined &&
              this.cart[key].selectedTurnTime !== null) ||
            (this.isEmpty(this.cart[key].turnTimeOptions) &&
              this.cart[key].dueDate)) {
          selectedCount ++;
        }
      }
    );

    this.isPickUpInfoValid = (cartCount === selectedCount);
  }

  isWorkFrontJob(productID: any) {
    const configuredProduct: any = this.getActiveConfigProduct();
    if (this.allowed_workfront_category.indexOf(configuredProduct.categoryCode) >= 0) {
      return true;
    }
    return false;
  }

  /**
   * Returns all shipping values to their disabled state
   */
  disableShipping() {
    this.shippingCost = 0;
    this.shippingIsLoaded = true;
    this.shippingEnabled.next(false);
    this.shippingSelected = false;
  }

  /**
   * Sets shipping values[enabled, selected, shipping cost]
   * @param shippingCost
   */
  setShipping(shippingCost) {
    this.shippingCost = shippingCost;
    this.shippingEnabled.next(true);
    this.shippingSelected = true;
  }

  allJobsAreDigital(): boolean {
    let allDigital = true;

    Object.keys(this.cart).forEach(
      x => {
        if (this.cart[x].mediaType !== 0) {
          allDigital = false;
        }
      });
    return allDigital;
  }

}
