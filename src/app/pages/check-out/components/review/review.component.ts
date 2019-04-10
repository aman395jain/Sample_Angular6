import {Component, OnInit, Input, ViewChild, OnDestroy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog, MatTooltip} from '@angular/material';
import {OrderConfirmationDialogComponent} from '@app/shared/components/OrderConfirmationDialog/OrderConfirmationDialog.component';
import {OrderSubmission} from '@app/models/OrderSubmission/OrderSubmission';
import {OrderConfiratmationData} from '@app/models/OrderConfirmationData';
import {OrderSubmissionReponse} from '@app/models/OrderSubmissionResponse';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {InformationDialogComponent} from '@app/shared/components/information-dialog/information-dialog.component';
import {SaveForLaterDialogComponent} from '@app/shared/components/save-for-later-dialog/save-for-later-dialog.component';
import {ConfirmationDialogComponent} from '@app/shared/components/ConfirmationDialog/ConfirmationDialog.component';
import {BackgroundTaskStatusService} from '@app/core/Services/background-task-status/background-task-status.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {CommonConstants, SubmitType} from '@app/config/common-constants';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {EchCustomerService} from '@app/shared/services/EchCustomer/EchCustomer.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {FilePreviewModalWrapperComponent} from '@app/shared/components/FileComponents';
import {FileUploadComponent} from '@app/shared/components/FileComponents';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import { Subject, Subscription } from 'rxjs';



@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})

export class ReviewComponent implements OnInit, OnDestroy {

  @Input() shakeLinks: Subject<any>;
  public SubmitType = SubmitType;
  private errorMsgs: any;
  public commonConstants = CommonConstants;
  addressValidationError: string;
  serverSideError: string;
  saveForLaterError: string;
  model = new OrderSubmissionReponse(null);
  tooltipText = '';
  addressValidationSuggestion = false;
  public zip: any;
  deliveryMethod = '';
  public jobkeyList: any;
  public isEditQuote = false;
  public left = 'left';
  isSubmitted = false;
  private readonly EXPRESS_TURN_TIME = '1 Hour';
  private allowed_workfront_category: Array<any> = CommonConstants.ALLOWED_WORKFRONT_CATEGORY;

  @ViewChild(MatTooltip) tooltip: MatTooltip;

  constructor(
    public translate: TranslateService,
    public validators: ValidatorsService,
    public orderConfigService: OrderConfigService,
    private orderService: OrderService,
    private sharedDataService: SharedDataService,
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService,
    private addressValidation: AddressValidationService,
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigurationScreenService,
    public dialog: MatDialog,
    private echCustomerService: EchCustomerService,
    private statusService: BackgroundTaskStatusService,
    private LOG: LoggerService,
  ) {
  }

  ngOnInit() {
    this.zip = this.orderConfigService.orderCustomer.zip;
    if (this.zip !== undefined && this.zip !== null && this.zip.length >= 5) {
      this.zip = this.zip.substring(0, 5);
    }

    this.orderConfigService.cartChanged.subscribe(result => {
      this.jobkeyList = this.orderConfigService.getCart();
    });

    this.translate.get('COMMON.error').subscribe(
      data => {
        this.addressValidationError = data.addressValidation;
        this.serverSideError = data.serverSide;
        this.saveForLaterError = data.saveForLater;
      }
    );
    this.isEditQuote = this.orderConfigService.isEditQuote;

  }

  submit(submitType: SubmitType) {

    switch (submitType) {
      case SubmitType.Order:
        this.isSubmitted = true;
        this.notificationService.showLoader();
        this.submitOrder();
        break;
      case SubmitType.Quote:
        this.verifyQuoteEligibilityAndSubmit();
        break;
      case SubmitType.SaveForLater:
        this.isSubmitted = true;
        this.notificationService.showLoader();
        this.saveOrder();
        break;
      default:
        this.LOG.error('Received invalid input.');
    }

  }


  openFilePreview(key) {
    const dialogRef = this.dialog.open(FilePreviewModalWrapperComponent, {
      width: '900px',
      height: 'auto',
      data: {
        fileFullName: this.orderConfigService.cart[key].printBrokerFiles.fileDescriptions[1].fileUrl,
        fileName: this.orderConfigService.cart[key].printBrokerFiles.fileDescriptions[1].fileName
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }

  openFileSelectionDialog(key) {
    let workfront = false;
    this.orderConfigService.allowCancel.next(true);
    if (this.allowed_workfront_category.indexOf(this.orderConfigService.cart[key].configProduct.categoryCode) >= 0) {
        workfront = true;
    }
    const activeJob = JSON.parse(JSON.stringify(this.orderConfigService.cart[key]));
    activeJob.multipleFiles = this.orderConfigService.cart[key].multipleFiles;
    const dialogRef = this.dialog.open(FileUploadComponent, {
        width: '800px',
        height: 'auto',
        data: { activeJob: activeJob, isWesUpload: false, showChangeFileWarning: true, isWorkFront: workfront }
    });
        dialogRef.afterClosed().subscribe(result => {
        if (result) {
        // this.router.navigate(['/product']);
        this.orderConfigService.fileUploadedSub.next(true);
          this.orderConfigService.cart[key] = JSON.parse(JSON.stringify(this.orderConfigService.activeJob));
          this.orderConfigService.cart[key].multipleFiles = this.orderConfigService.activeJob.multipleFiles;
            if (this.orderConfigService.cart[key].printBrokerFiles &&
              this.orderConfigService.cart[key].printBrokerFiles.fileDescriptions.length > 1) {
            this.notificationService.showLoader();
            this.fileUploadService.getXMLFile(this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions[2]
                .fileUrl).subscribe(result2 => {
                this.orderConfigService.processFileData(this.fileUploadService.processXMLFile(result2));
                this.configService.getPricingandConditionalTicketing(
                // passing null to createTicketingAndPricingObject sets conditional ticketing to 'N'
                this.orderConfigService.createTicketingAndPricingObject(null, false, 'P')).subscribe(pc => {
                const pAndC: any = pc;
                if (pAndC === null || pAndC === undefined) {
                    this.notificationService.hideLoader();
                    throw new CustomSBError(this.errorMsgs.pAndCError, this.errorMsgs.pAndCErrorName, false);
                }
                this.orderConfigService.processPricing(pAndC.orderPricing, pAndC.jobs);
                this.notificationService.hideLoader();
                });
            });
            }
            if (this.orderConfigService.cart[key].mediaType === 1
                    || this.orderConfigService.cart[key].mediaType === 2) {
                      this.orderConfigService.cart[key].printBrokerFiles = null;
                      this.orderConfigService.cart[key].multipleFiles = null;
            }
        } else {
          this.sharedDataService.configPageIsLoaded = true;
        }
    });
}

  /**
   * Saves the current order. If the customer is being added to ECH, we need
   * to get back the new customer information to include in the call to save
   * the order. Otherwise, just call the API with the information as is. If the
   * call to ECH fails, we still want to save the order.
   */
  saveOrder() {
    const orderSubmissionObject = this.orderConfigService.createOrderSubmissionObject();

    if (this.orderConfigService.saveCustomer ) {

      this.echCustomerService.addCustomerToEch(orderSubmissionObject.customer)
        .subscribe(result => {
          orderSubmissionObject.customer = result;
          this.saveOrderHelper(orderSubmissionObject, true);
        }, error => {
          this.saveOrderHelper(orderSubmissionObject, true);
          throw new CustomSBError(error, this.translate.instant('COMMON.error.addEchFail'), false);
        });
    } else {
      this.saveOrderHelper(orderSubmissionObject, true);
    }
  }


  /**
   * Submits the current order. If the customer is being added to ECH, we need
   * to get back the new customer information to include in the call to submit
   * the order. Otherwise, just call the API with the information as is. If the
   * call to ECH fails, we still want to submit the order.
   */
  submitOrder() {
    this.notificationService.showLoader();
    this.orderConfigService.isOrderCustomerInfoValid = false;
    const orderSubmissionObject = this.orderConfigService.createOrderSubmissionObject();
    if (this.orderConfigService.saveCustomer) {
      this.echCustomerService.addCustomerToEch(orderSubmissionObject.customer)
        .subscribe(result => {
          orderSubmissionObject.customer.customerNumber = result.customerNumber;
          this.submitOrderHelper(orderSubmissionObject);
        }, error => {
          this.submitOrderHelper(orderSubmissionObject);
          throw new CustomSBError(error, this.translate.instant('COMMON.error.addEchFail'), false);
        });
    } else {
      this.submitOrderHelper(orderSubmissionObject);
    }
  }


  /**
   * Checks if the quote being submitted has express pricing for any of the jobs and
   * warns the user the express pricing will be removed if they continue.
   */
  verifyQuoteEligibilityAndSubmit() {
    const orderSubmissionObject = this.orderConfigService.createOrderSubmissionObject();
    let hasExpressTurnTime = false;

    for (const job of orderSubmissionObject.jobs) {
      if (this.EXPRESS_TURN_TIME === job.turnTimeName) {
        hasExpressTurnTime = true;
        break;
      }
    }

    if (hasExpressTurnTime || this.orderConfigService.shippingEnabled.value) {
      this.dialog.open(InformationDialogComponent, {
        width: '400px',
        data: {
          title: this.translate.instant('COMMON.attention'),
          messages: [this.translate.instant('QUOTES.InvalidDeliveryForQuote')],
          closeTitle: this.translate.instant('BUTTON.close')
        }
      });
    } else {
      this.isSubmitted = true;
      this.notificationService.showLoader();
      this.submitQuote(orderSubmissionObject);
    }
  }


  /**
   * Submits the current order as a quote. If the customer is being added to ECH, we
   * need to get back the new customer information to include in the call to submit
   * the quote. Otherwise, just call the API with the information as is. If the
   * call to ECH fails, we still want to submit the quote.
   */
  submitQuote(orderSubmissionObject: OrderSubmission) {
    this.notificationService.showLoader();
    this.orderConfigService.isOrderCustomerInfoValid = false;
    orderSubmissionObject.orderType = SubmitType.Quote;

    if (this.orderConfigService.saveCustomer) {
      this.echCustomerService.addCustomerToEch(orderSubmissionObject.customer)
        .subscribe(result => {
          orderSubmissionObject.customer = result;
          this.submitQuoteHelper(orderSubmissionObject, false);
        }, error => {
          this.submitQuoteHelper(orderSubmissionObject, false);
          throw new CustomSBError(error, this.translate.instant('COMMON.error.addEchFail'), false);
        });
    } else {
      this.submitQuoteHelper(orderSubmissionObject, false);
    }
  }


  cancelOrder() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: {message: this.translate.instant('ORDER.checkout.cancelConfirm')}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderConfigService.deleteOrder();
        this.router.navigate(['/']);
      }
    });
  }


  /**
   * Consolidates the code for complicated logic in saveOrder( ) method.
   *
   * @param orderSubmissionObject data to send
   * @param saveForLater flag to indicate if this a save-for-later operation
   */
  saveOrderHelper(orderSubmissionObject: OrderSubmission, saveForLater: boolean) {

    if (this.orderConfigService.isEditQuote || this.orderConfigService.isEditOrder) {
      orderSubmissionObject.orderNumber = this.orderConfigService.orderNumber;
      orderSubmissionObject.isEdit = true;
    } else {
      orderSubmissionObject.orderNumber = null;
      orderSubmissionObject.isEdit = false;
    }

    // if shipping option enabled, take the job at index 0
    // and add its job sku price to shippingInfoJs shippingSkus
    // array.
    if (this.orderConfigService.shippingEnabled.value) {
      this.addJobSkuPriceSkuToShippingInfoJ(orderSubmissionObject);
    }

    this.orderService.submitOrder(orderSubmissionObject, saveForLater).subscribe(
      ( result ) => {
        const response = <OrderSubmissionReponse>result.body;
        this.notificationService.hideLoader();
        if (!result.body.sbOrderNumber) {
          throw new CustomSBError(this.errorMsgs.failedToSaveOrder, this.errorMsgs.saveForLater, false);
        } else {
          const dialogRef = this.dialog.open(SaveForLaterDialogComponent, {
            width: '200px',
            data: {orderNumber: response.sbOrderNumber}
          });
          dialogRef.afterClosed().subscribe(closeResult => {
            if (closeResult) {
              this.orderConfigService.deleteOrder();
              this.router.navigate(['/']);
            }
          });
        }
        this.isSubmitted = false;
      },
      ( error ) => {
        this.notificationService.hideLoader();
        this.isSubmitted = false;
        throw new CustomSBError(this.errorMsgs.failedToSaveOrder, this.errorMsgs.saveForLater, false);
      }
    );
  }

  addJobSkuPriceSkuToShippingInfoJ(orderSubmissionObject: OrderSubmission) {
    this.LOG.debug('Shipping added to order submission object');
    orderSubmissionObject.shippingInfoJ.shippingSkus =
      (orderSubmissionObject.jobs[0].jobSkuPriceList1[0].rollupSku);
  }



  /**
   * Consolidates the code for complicated logic in submitOrder( ) method.
   *
   * @param orderSubmissionObject data to send
   */
  submitOrderHelper(orderSubmissionObject: OrderSubmission) {
    if (this.orderConfigService.isEditQuote || this.orderConfigService.isEditOrder) {
      orderSubmissionObject.orderNumber = this.orderConfigService.orderNumber;
      orderSubmissionObject.isEdit = true;
    } else {
      orderSubmissionObject.orderNumber = null;
      orderSubmissionObject.isEdit = false;
    }

    // if shipping option enabled, take the job at index 0
    // and add its job sku price to shippingInfoJs shippingSkus
    // array.
    if (this.orderConfigService.shippingEnabled.value) {
      this.addJobSkuPriceSkuToShippingInfoJ(orderSubmissionObject);
    }

    const orderConfirmationData = new OrderConfiratmationData();
    this.orderService.submitOrder(orderSubmissionObject, false)
      .subscribe(
        ( result ) => {
        const response = <OrderSubmissionReponse>result.body;
        this.notificationService.hideLoader();

        orderConfirmationData.success = true;
        orderConfirmationData.orderNumber = parseInt(response.sbOrderNumber, 10);
        orderConfirmationData.submitOrderToFlightDeck = true;
        orderConfirmationData.orderType = SubmitType.Order;
        if (this.orderConfigService.hasWorkFrontJob) {
          orderSubmissionObject.orderNumber = response.sbOrderNumber;
        }

        orderConfirmationData.isSdsShip = response.isSdsShip;

        const dialogRef = this.dialog.open(OrderConfirmationDialogComponent, {
          width: '350px',
          data: orderConfirmationData,
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(closeResult => {
          if (closeResult) {
            this.orderConfigService.deleteOrder();
            this.router.navigate(['/']);
          }
        });
        this.isSubmitted = false;
      },
      ( error ) => {
        this.notificationService.hideLoader();
        this.isSubmitted = false;
        orderConfirmationData.success = false;
        orderConfirmationData.orderType = SubmitType.Order;
        orderConfirmationData.submitOrderToFlightDeck = false;
        this.orderConfigService.orderNumber = undefined;


        const dialogRef = this.dialog.open(OrderConfirmationDialogComponent, {
          width: '350px',
          data: {orderConfirmationData: orderConfirmationData},
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(closeResult => {
          if (closeResult) {
            this.LOG.error('Order submission error ' + error);
            this.orderConfigService.deleteOrder();
            this.router.navigate(['/']);
          }
        });
      }
    );
  }


  /**
   * Consolidates the code for complicated logic in submitQuote( ) method.
   *
   * @param orderSubmissionObject data to send
   * @param saveForLater flag to indicate if this a save-for-later operation
   */
  submitQuoteHelper(orderSubmissionObject: OrderSubmission, saveForLater: boolean) {
    if (this.orderConfigService.isEditQuote || this.orderConfigService.isEditOrder) {
      orderSubmissionObject.orderNumber = this.orderConfigService.orderNumber;
      orderSubmissionObject.isEdit = true;
    } else {
      orderSubmissionObject.orderNumber = null;
      orderSubmissionObject.isEdit = false;
    }

    const orderConfirmationData = new OrderConfiratmationData();

    this.orderService.submitOrder(orderSubmissionObject, saveForLater).subscribe(
      ( result ) => {
        const response = <OrderSubmissionReponse>result.body;
        this.notificationService.hideLoader();

        orderConfirmationData.success = true;
        orderConfirmationData.orderNumber = parseInt(response.sbOrderNumber, 10);
        orderConfirmationData.submitOrderToFlightDeck = false;
        orderConfirmationData.orderType = SubmitType.Quote;

        const dialogRef = this.dialog.open(OrderConfirmationDialogComponent, {
          width: '350px',
          data: orderConfirmationData,
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(
          closeResult => {
            if (closeResult) {
              this.orderConfigService.deleteOrder();
              this.router.navigate(['/']);
            }
          }
        );
        this.isSubmitted = false;
      },
      ( error ) => {
        this.notificationService.hideLoader();
        this.isSubmitted = false;
        orderConfirmationData.success = false;
        orderConfirmationData.orderType = SubmitType.Quote;
        orderConfirmationData.submitOrderToFlightDeck = false;
        this.orderConfigService.orderNumber = undefined;


        const dialogRef = this.dialog.open(OrderConfirmationDialogComponent, {
          width: '350px',
          data: {orderConfirmationData: orderConfirmationData},
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(closeResult => {
          if (closeResult) {
            this.LOG.error('Quote submission error ' + error);
            this.orderConfigService.deleteOrder();
            this.router.navigate(['/']);
          }
        });
      }
    );
  }

  ngOnDestroy(): void {
  }

}
