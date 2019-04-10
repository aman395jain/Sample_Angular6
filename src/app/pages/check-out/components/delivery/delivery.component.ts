import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog, MatProgressBar } from '@angular/material';
import { Subscription } from 'rxjs';
import {CommonConstants} from '@app/config/common-constants';
import {Address} from '@app/models/Address';
import {AddressValidationDialogComponent} from '@app/shared/components/address-validation-dialog/address-validation-dialog.component';
import {ShippingInfoJ} from '@app/models/ShippingInfoJ';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {SnackNotification} from '@app/models/SnackNotification';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {DueDateComponent} from '@app/pages/check-out/components/delivery/due-date/due-date.component';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {ShippingService} from '@app/pages/check-out/services/shipping/shipping.service';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css']
})

export class DeliveryComponent implements OnInit, OnDestroy {
  private quantityTimeout: any;
  private errorMsgs: any;
  public jobkeyList: any;
  private turnTimeDisabled = false;
  private shippingEnabled = false;
  selectedTab = 0;
  commonConstants = CommonConstants;
  addressType: string = null;
  delivery = 'Pick Up';
  shipping: string;
  service: any = ['UPS Ground', 'UPS Next Day Air'];
  returnedRates: any;
  rates = false;
  sameAddress = true;
  currentKey: any;
  public displayDcs = false;
  shippingEligible: any;
  ineligibleShipMsg: string;

  // Shipping address
  firstNameVal = '';
  lastNameVal = '';
  address1Val = '';
  address2Val = '';
  cityVal = '';
  stateVal = '';
  zipVal: any;

  public showRateSkeleton = true;

  private jobQuantityChangedSub: Subscription;
  private cartChangedSub: Subscription;
  private customerChangedSub: Subscription;
  private translateSub: Subscription;

  public shippingFeatureEnabled = false;

  shippingInfoJ = new ShippingInfoJ(this.firstNameVal, this.lastNameVal, this.address1Val,
      this.address2Val, this.cityVal, this.stateVal, this.zipVal, this.addressType);

  // Validators for error messaging - customer address
  firstName = this.validators.getNameVal();
  lastName = this.validators.getNameVal();
  address1 = this.validators.getAddressVal();
  address2 = this.validators.getAddressVal();
  city = this.validators.getCityVal();
  state = this.validators.getRequiredVal();
  zipCode = this.validators.getZipCodeVal();

  @ViewChild('deliveryForm') deliveryForm;
  @ViewChild('pickUpForm') pickUpForm;
  @Output() openStep = new EventEmitter<number>();
  @Input() mode: 'indeterminate';

  constructor(
    public translate: TranslateService,
    public validators: ValidatorsService,
    public shippingService: ShippingService,
    public orderConfigService: OrderConfigService,
    private configService: ConfigurationScreenService,
    private notificationService: NotificationService,
    private storeInfoService: StoreinfoService,
    private LOGGER: LoggerService,
    private customerSearchService: CustomerSearchService,
    private router: Router,
    private addressValidationService: AddressValidationService,
    public dialog: MatDialog
  ) {
  }

  ngOnDestroy(): void {
    this.jobQuantityChangedSub.unsubscribe();
    this.cartChangedSub.unsubscribe();
    this.customerChangedSub.unsubscribe();
    this.translateSub.unsubscribe();
  }

  ngOnInit() {
    this.ineligibleShipMsg = undefined;
    this.shippingFeatureEnabled = this.storeInfoService.isStoreFeature('Shipping_Enabled');
    this.turnTimeDisabled = false;
    this.updateShippingInfo(this.sameAddress);
    this.updateDeliveryMethod(this.delivery);

    this.translateSub = this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });

    if (this.orderConfigService.orderCustomerSelected) {
      this.checkShippingFormValid();
    }

    // Monitors changes to quantity of jobs in cart and job quantity
    // So we can retrieve new shipping rates and adjust total
    this.cartChangedSub = this.orderConfigService.cartChanged.subscribe(result => {
        this.jobkeyList = this.orderConfigService.getCart();
        this.orderConfigService.getCart().subscribe(cartKeys => {
          // check if any job is a dcs job
          this.displayDcs = false;
          cartKeys.forEach(element => {
            if (this.orderConfigService.cart[element].isDCSJob) {
              this.displayDcs = true;
            }
          });
        });
        if (this.turnTimeDisabled) {
            this.getRates(true);
        }
    });
    this.jobQuantityChangedSub = this.orderConfigService.jobQuantityChanged.subscribe(
        (result) => {
            if (this.turnTimeDisabled) {
                this.getRates(true);
            }
        }
    );
    // Reprice on change of customer(order config, not local)
    this.customerChangedSub = this.customerSearchService.orderCustomerChanged.subscribe(result => {
      if (result) {
        this.priceOrder();
        if (this.turnTimeDisabled) {
          this.getRates(true);
        }
        this.customerSearchService.orderCustomerChanged.next(false);
      }
    });
    this.defaultJobsWithOneTurnTimeToFirstOption();

    // this.shippingEligible = this.orderConfigService.getShippingEligibility();

  }

  checkShowEmailPhoneRequired() {
    this.sameAddress = this.orderConfigService.customerHasCompleteAddress;
  }

  checkShippingFormValid() {
    this.returnedRates = null;
    this.orderConfigService.disableShipping();
    this.orderConfigService.calculateOrderTotal(this.orderConfigService.shippingCost);

    if (this.deliveryForm === undefined) {
      return;
    }

    if (this.deliveryForm.form.valid) {
      this.orderConfigService.isShippingInfoValid = true;
    } else {
      this.orderConfigService.isShippingInfoValid = false;
    }
  }

  priceOrder() {
    this.notificationService.showLoader();
    // the cart should have no reference to an active job, all jobs are in cart
    // this.orderConfigService.resetActiveJob();
    this.configService.getPricingandConditionalTicketing(
      // passing null to createTicketingAndPricingObject sets conditional ticketing to 'N'
      this.orderConfigService.createCondTicketingObj(this.orderConfigService.cart, this.orderConfigService.orderCustomer,
        this.orderConfigService.orderCustomerPreferredContact, 'P')).subscribe(
        (pAndCres) => {
          const pAndC: any = pAndCres;
          if (pAndC === null || pAndC === undefined) {
            this.notificationService.hideLoader();
            throw new CustomSBError(this.errorMsgs.pAndCError, 'Pricing Or Conditional Ticketing', false);
          }
          this.orderConfigService.cart = this.orderConfigService.processPriceResponse(pAndC.jobs, this.orderConfigService.cart);
          this.orderConfigService.calculateOrderTotal(this.orderConfigService.shippingCost);
          this.notificationService.hideLoader();
        },
        ( error ) => {
          this.notificationService.hideLoader();
        }
      );
  }


  updateTurnTime() {
    this.updateDeliveryMethod('Pick up');
    this.turnTimeDisabled = false;
    this.shipping = null;
    this.orderConfigService.calculateOrderTotal(null);
    this.orderConfigService.orderPriceData.next(this.orderConfigService.calcOrderPriceData(this.orderConfigService.cart));
    this.orderConfigService.disableShipping();
  }

  /**
   * Updates the local delivery method value and the delivery method value in
   * order config based off of deliveryType
   * @param deliveryMethod
   */
  updateDeliveryMethod(deliveryMethod: string) {
    this.delivery = deliveryMethod;
    this.orderConfigService.setDeliveryMethod(deliveryMethod);

    if (deliveryMethod === 'Shipping') {
      this.orderConfigService.isPickUpInfoValid = false;
    } else {
      this.orderConfigService.isShippingInfoValid = false;
    }
    // this.orderConfigService.calculateOrderTotal(this.orderConfigService.shippingCost);
  }

  /**
   * If sameAddress param is true, set this.shippingInfoJ to the order customer address
   * And set orderConfigService.shippingInfoJ to this.shippingInfoJ
   * And set this.sameAddress = to the param to disable/enabled shipping addr fields
   * @param sameAddress
   */
  updateShippingInfo (sameAddress) {
    this.sameAddress = sameAddress;
    this.returnedRates = null;
    this.orderConfigService.disableShipping();
    this.orderConfigService.calculateOrderTotal(this.orderConfigService.shippingCost);
    this.orderConfigService.shippingOption = null;
    if (sameAddress) {
      this.shippingInfoJ = new ShippingInfoJ(this.orderConfigService.orderCustomer.firstname,
        this.orderConfigService.orderCustomer.lastname,
        this.orderConfigService.orderCustomer.address1, this.orderConfigService.orderCustomer.address2,
        this.orderConfigService.orderCustomer.city,
        this.orderConfigService.orderCustomer.state,
        <string>this.orderConfigService.orderCustomer.zip, this.addressType);
    } else {
      this.shippingInfoJ = new ShippingInfoJ(null, null, null, null, null, null, null, null);
    }
    this.orderConfigService.setShippingInfoCustomer(this.shippingInfoJ);
  }

  updateIsResidentialFlag () {
    this.addressType = this.orderConfigService.shippingInfoJ.addressType;
    if (this.addressType === 'Residential') {
      this.orderConfigService.isResidential = true;
    } else {
      this.orderConfigService.isResidential = false;
    }
  }

  getRates( caculateTotal ) {
      this.orderConfigService.shippingIsLoaded = false;
      this.showRateSkeleton = true;
      this.shippingService.submitShippingRequest(
        this.orderConfigService.createShippingRequestObject()).subscribe(
          ( result ) => {
            this.ineligibleShipMsg = undefined;
            this.returnedRates = result.body.rates;
            this.rates = true;
            this.orderConfigService.shippingIsLoaded = true;
            if ( caculateTotal ) {
              this.selectShippingOption( this.currentKey );
            } else {
              this.shipping = null;
              this.showRateSkeleton = false;
            }
            if (result.body.validProduct == 'N' || result.body.validRates == 'N') {
              this.ineligibleShipMsg = result.body.shippingMessageArray;
              this.orderConfigService.disableShipping();
              this.orderConfigService.calculateOrderTotal(this.orderConfigService.shippingCost);
              this.turnTimeDisabled = false;
              this.showRateSkeleton = true;
              throw new Error(this.errorMsgs.productUnsupportedForShipping);
            }
          },
          ( error ) => {
            this.orderConfigService.disableShipping();
            this.ineligibleShipMsg = 'Unable to get Shipping Rates';
            this.orderConfigService.calculateOrderTotal(this.orderConfigService.shippingCost);
            this.turnTimeDisabled = false;
            this.showRateSkeleton = true;
            throw new Error(this.errorMsgs.shippingFailure);
          },
          ( ) => { }
      );
  }

  /**
   * Validates address and calls gets rates if address is correct
   * This bit of code could be refactored at somepoint to take a call back function
   * So we could reuse it in the stepper
   */
  validateAddressAndGetRates() {
    this.notificationService.showLoader();
    const address = new Address(this.orderConfigService.shippingInfoJ.address1,
      this.orderConfigService.shippingInfoJ.address2,
      this.orderConfigService.shippingInfoJ.city,
      'USA',
      this.orderConfigService.shippingInfoJ.state,
      this.orderConfigService.shippingInfoJ.zip
    );
    this.addressValidationService.verifyAddress(address).subscribe(
      ( response ) => {
        this.notificationService.hideLoader();

        if (response.addressVerified && !response.replaceAddress) {

          this.getRates(undefined);

        } else if (response.addressVerified && response.replaceAddress) {
          // prompt associate to change address

          const dialogRefAdr = this.dialog.open(AddressValidationDialogComponent, {
            width: '315px',
            data: { address: response.suggestedAddress }
          });
          dialogRefAdr.afterClosed().subscribe(closeResult => {
              if (closeResult === 'change') {
                  this.orderConfigService.shippingInfoJ.zip =
                    response.suggestedAddress.zip.substring(0, 5);
                  this.orderConfigService.shippingInfoJ.state = response.suggestedAddress.state;
                  this.orderConfigService.shippingInfoJ.city = response.suggestedAddress.city;

                  this.getRates(undefined);
              }
          });
        } else {
          // invalid address
          this.LOGGER.debug(this.errorMsgs.addressValidation + 'Address unverifiable, confirm address with customer');
          this.notificationService.notify(
            new SnackNotification(this.errorMsgs.addressValidation + 'Address unverifiable, confirm address with customer', 5000)
          );
        }
      },
      ( error ) => {
        throw new Error(this.errorMsgs.addressValidation + 'Shipping Service level error');
      }
    );
  }

  selectShippingOption(key) {
    this.updateDeliveryMethod('Shipping');
    if (this.deliveryForm.valid) {
      this.orderConfigService.isPickUpInfoValid = false;
    }
    if (key !== undefined) {
      // Change all prices of job in cart to base price
      Object.keys(this.orderConfigService.cart).forEach(
        (val) => {
          if (this.orderConfigService.cart[val].turnTimeOptions != null &&
              this.orderConfigService.cart[val].turnTimeOptions[this.orderConfigService.cart[val].selectedTurnTime] !== undefined) {
                this.orderConfigService.cart[val].selectedTurnTime = null;
          }
      });
      this.shipping = key;
      this.orderConfigService.isShippingInfoValid = true;
      this.turnTimeDisabled = true;
      this.currentKey = key;
      this.orderConfigService.calculateOrderTotal(this.returnedRates[key].total);
      this.orderConfigService.shippingOption = this.returnedRates[key];
      this.orderConfigService.setShippingInfo(this.returnedRates[key]);
      this.orderConfigService.setShipping(this.returnedRates[key].total);
    }
  }


    generateTurnTimeId(turnTimeKey, key) {
      return turnTimeKey.replace(' ', '_') + '_' + key;
    }

/**
  * In the event that a product only has one turn time
  * Automatically select the only available turn time
  */
  defaultJobsWithOneTurnTimeToFirstOption() {
      Object.keys(this.orderConfigService.cart).forEach(val => {
        if (this.orderConfigService.cart[val].turnTimeOptions !== null && this.orderConfigService.cart[val].turnTimeOptions !== undefined &&
           this.orderConfigService.cart[val].turnTimeOptions[this.orderConfigService.cart[val].selectedTurnTime] === undefined) {
            if (Object.keys(this.orderConfigService.cart[val].turnTimeOptions).length === 1) {
                Object.keys(this.orderConfigService.cart[val].turnTimeOptions).forEach(tTimeKey => {
                    this.orderConfigService.cart[val].selectedTurnTime =
                      this.orderConfigService.cart[val].turnTimeOptions[tTimeKey].turnTimeName;
                });
          }
      }
    });
    this.orderConfigService.checkTurnTimeSelectionCompleted();
  }

  selectDueDate(key) {
    const dialogRef = this.dialog.open(DueDateComponent, {});

    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        this.orderConfigService.cart[key].dueDate = result;
        this.orderConfigService.checkTurnTimeSelectionCompleted();
      }
    });
  }

  fixJobs(): void {
    this.openStep.emit(0);
  }
}
