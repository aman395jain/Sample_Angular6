import { Component, OnInit, ElementRef, ViewContainerRef} from '@angular/core';
import { trigger, transition, useAnimation} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { shake} from 'ng-animate';
import { interval} from 'rxjs';
import {Address} from '@app/models/Address';
import {OrderSubmission} from '@app/models/OrderSubmission/OrderSubmission';
import {AddressValidationDialogComponent} from '@app/shared/components/address-validation-dialog/address-validation-dialog.component';
import {CustomerSearchDialogComponent} from '@app/shared/components/customer-search-dialog/customer-search-dialog.component';
import {OrderSubmissionReponse} from '@app/models/OrderSubmissionResponse';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {SnackNotification} from '@app/models/SnackNotification';
import {FileUploadComponent} from '@app/shared/components/FileComponents';
import {DuplicateJobComponent} from '@app/shared/components/duplicate-job/duplicate-job.component';
import {SaveforlaterCustomerDialogComponent} from '@app/shared/components/saveforlater-customer-dialog/saveforlater-customer-dialog.component';
import {SaveForLaterDialogComponent} from '@app/shared/components/save-for-later-dialog/save-for-later-dialog.component';
import {CanDeactivateGuardService} from '@app/core/Services/can-deactivate-guard/can-deactivate-guard.service';
import {ConfirmationDialogComponent} from '@app/shared/components/ConfirmationDialog/ConfirmationDialog.component';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';
import {EchCustomerService} from '@app/shared/services/EchCustomer/EchCustomer.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';



@Component({
  selector: 'app-config-summary',
  templateUrl: './ConfigSummary.component.html',
  styleUrls: ['./ConfigSummary.component.css'],
  animations: [
      trigger('shake', [
          transition('* => *', useAnimation(shake))
        ])
      ]
})
export class ConfigSummaryComponent implements OnInit {
    private quantityTimeout: any;
    data: string;
    response: OrderSubmissionReponse;
    currentJobFromCart = null;
    errorMsgs: any;
    quantities: any = [];
    count = 0;
    turnTime = '';
    private currentTemplateSub: any;
    private fileUploadRemider;
    isEditQuote = false;
    isSubmitted = false;
    previousImpressionValue = 1;
    impressionInProgress = false;
    saveForLaterDisabled = false;

    constructor(
        private translate: TranslateService,
        private notificationService: NotificationService,
        public configService: ConfigurationScreenService,
        public orderConfigService: OrderConfigService,
        private sharedDataService: SharedDataService,
        public dialog: MatDialog,
        private elRef: ElementRef,
        vcr: ViewContainerRef,
        private router: Router,
        public canDeactivateGuardService: CanDeactivateGuardService,
        public orderService: OrderService,
        private addressValidation: AddressValidationService,
        private fileUploadService: FileUploadService,
        private echCustomerService: EchCustomerService
    ) {
    }

    ngOnInit() {
        this.saveForLaterDisabled = this.orderConfigService.getIsReorder();
        this.isEditQuote = this.orderConfigService.isEditQuote;
        this.previousImpressionValue = this.orderConfigService.activeJob.impressions;
        this.orderConfigService.canProceed = true;

        this.translate.get('COMMON.error').subscribe(result => {
            this.errorMsgs = result;
        });

        if ( this.orderConfigService.activeJob.mediaType === 3) {
            this.fileUploadRemider = interval(10000);
            this.fileUploadRemider.subscribe(() => {
                if ( this.orderConfigService.activeJob.mediaType !== 3) {
                  clearInterval(this.fileUploadRemider);
                }
            });
        }
    }

    searchForCustomer() {
        // open customer search dialog
        const dialogRef = this.dialog.open(CustomerSearchDialogComponent, {
            width: '1200px',
            height: 'auto',
        });

        dialogRef.afterClosed().subscribe(result => {
            // Update pricing after customer changes
            this.onQuantityChange();
        });
    }

    isSelectQtys() {
        if ( this.quantities.length === 0 && this.orderConfigService.activeJob.quantities
            && this.orderConfigService.activeJob.quantities.length > 0 ) {
            this.quantities = this.orderConfigService.activeJob.quantities;
        }
        return true;
    }

    determineIfLimitReached() {
        if (this.orderConfigService.activeJob.exceptionPages !== undefined
             && Object.keys(this.orderConfigService.activeJob.exceptionPages).length > 0) {
             let totalImpressions = 0, maxRange = 0;
             for (const exPageId in this.orderConfigService.activeJob.exceptionPages) {
                 const exPage = this.orderConfigService.activeJob.exceptionPages[exPageId];
                 totalImpressions += exPage.pageRangeImpressions;
                 if (exPage.pageRange.replace(/.*\D(\d+)\D*/, '$1') > maxRange) {
                   maxRange = exPage.pageRange.replace(/.*\D(\d+)\D*/, '$1');
                 }
              }
              return (this.orderConfigService.activeJob.impressions <= totalImpressions
                  || maxRange > this.orderConfigService.activeJob.impressions);
        }
        return false;
    }

    /**
     * function to call pricing and update sheetswhen impressions are changed
     * Update the impressions and sheets when Sides in config is updates
     */
    onImpressionChange() {
        this.orderConfigService.canProceed = false;
        if (this.impressionInProgress) {
            return;
        }
        this.impressionInProgress = true;

        if (this.orderConfigService.activeJob.impressions < 1) {
            this.orderConfigService.activeJob.impressions = 1;
        } else if (this.orderConfigService.activeJob.impressions > 999999) {
            this.orderConfigService.activeJob.impressions = 999999;
            this.notificationService.notify(
            new SnackNotification(this.errorMsgs.exceededMaxImpressionRange, 10000));
        }

        clearTimeout(this.quantityTimeout);
        this.quantityTimeout = setTimeout(() => {
            if (this.determineIfLimitReached()) {

                let blowby = false;
                const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                    width: '250px',
                    data: { message: this.errorMsgs.exceedMaxImpressionExceptionPage }
                });

            // the afterClosed().subscribe causes the prevImpressions to be lost.
            // the way around the Observable is the blowby and impressionInProgress hacks

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        for (const exPageId in this.orderConfigService.activeJob.exceptionPages) {
                            this.orderConfigService.deleteExceptionPageFromJob(exPageId);
                        }
                        // need to reprice HERE!! (PSB-1575)
                        this.callPricingSelectedOption(this.orderConfigService.getFirstSelectedOption());
                        blowby = true;
                    } else {
                        this.orderConfigService.activeJob.impressions = this.previousImpressionValue;
                        this.orderConfigService.updateSheets(this.orderConfigService.activeJob.selectedSideConfig);
                        this.impressionInProgress = false;
                        return;
                    }
                });

                if (!blowby) {
                    return;
                }
            }
            this.orderConfigService.updateSheets(this.orderConfigService.activeJob.selectedSideConfig);
            this.previousImpressionValue = this.orderConfigService.activeJob.impressions;
            this.impressionInProgress = false;
            this.onQuantityChange();
        }, 750);
    }

    callPricingSelectedOption (option) {
        this.notificationService.showLoader();
        this.orderConfigService.changeSelectedItem(option);
        this.configService.getPricingandConditionalTicketing(
          this.orderConfigService.createTicketingAndPricingObject(option, false , 'CP')).subscribe(result => {
          const data: any = result;
          if (data === null || data === undefined) {
            this.notificationService.hideLoader();
            throw new CustomSBError(this.errorMsgs.pAndCError, this.errorMsgs.pAndCErrorName, false);
          }

          this.orderConfigService.processPricing(data.orderPricing, data.jobs);
          for (let i = 0; i < data.jobs.length; i ++) {
            if ( data.jobs[ i ].activeJob ) {
              this.orderConfigService.processConditionalTicketing(data.jobs[ i ]);
            }
          }
          this.notificationService.hideLoader();
        });
      }
    /**
     * function to call pricing when quantity is changed
     */
    onQuantityChange() {
      this.orderConfigService.canProceed = false;
      if (this.orderConfigService.activeJob.quantity < 1) {
        this.orderConfigService.activeJob.quantity = 1;
      } else if (this.orderConfigService.activeJob.quantity > 999999) {
        this.orderConfigService.activeJob.quantity = 999999;
        this.notificationService.notify(
          new SnackNotification(this.errorMsgs.exceededMaxQuantityRange, 10000));
      }
        clearTimeout(this.quantityTimeout);
        this.quantityTimeout = setTimeout(() => {
            this.notificationService.showLoader();
            this.configService.getPricingandConditionalTicketing(
              // passing null to createTicketingAndPricingObject sets conditional ticketing to 'N'
              this.orderConfigService.createTicketingAndPricingObject(null, false, 'P')).subscribe(
                (result) => {
                  const pAndC: any = result;
                  if (pAndC === null || pAndC === undefined) {
                    this.notificationService.hideLoader();
                    throw new CustomSBError(this.errorMsgs.pAndCError, this.errorMsgs.pAndCErrorName, false);
                  }
                  this.orderConfigService.processPricing(pAndC.orderPricing, pAndC.jobs);
                  this.calcSubtotal();
                  this.notificationService.hideLoader();
                },
                ( error ) => {
                  this.notificationService.hideLoader();
                }
              );
        }, 750);
    }

    incrementQty(direction) {
        if (direction === 'minus') {
            this.orderConfigService.activeJob.quantity--;
        }

        if (direction === 'plus') {
            this.orderConfigService.activeJob.quantity++;
        }

        this.onQuantityChange();
    }

    incrementImpression(direction) {
        if (direction === 'minus') {
            this.orderConfigService.activeJob.impressions--;
        }

        if (direction === 'plus') {
            this.orderConfigService.activeJob.impressions++;
        }

        this.onImpressionChange();
    }

    addToCart() {
        this.isSubmitted = true;
        if (this.orderConfigService.isEditJob) {
            this.updateJob();
        } else {
            this.orderConfigService.addToCart();

            this.router.navigate(['/config'], {queryParams: {job: this.orderConfigService.getActiveJob().jobNumber}}).then(
                success => {
                    const dialogRef = this.dialog.open(DuplicateJobComponent, {
                        width: '360px',
                        height: '500px',
                        data: { name: this.data },
                        disableClose: true
                    });
                }
            );
        }
        this.isSubmitted = false;
    }

    updateJob() {
        this.orderConfigService.updateActiveJob();
        this.orderConfigService.isEditJob = false;

        const dialogRef = this.dialog.open(DuplicateJobComponent, {
            width: '360px',
            height: '475px',
            data: { name: this.data, isUpdateOn: true }
        });
    }

    openFileSelectionDialog() {
        let workfront = false;
        this.orderConfigService.allowCancel.next(true);
        if (this.orderConfigService.isWorkFrontJob(this.orderConfigService.activeJob.productId)) {
            workfront = true;
        }
        const dialogRef = this.dialog.open(FileUploadComponent, {
            width: '800px',
            height: 'auto',
            data: { isWesUpload: false, showChangeFileWarning: true, isWorkFront: workfront }
        });
            dialogRef.afterClosed().subscribe(result => {
            if (result) {
            // this.router.navigate(['/product']);
            this.orderConfigService.fileUploadedSub.next(true);
                if (this.orderConfigService.activeJob.printBrokerFiles &&
                  this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions.length > 1) {
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
                if (this.orderConfigService.activeJob.mediaType === 1
                        || this.orderConfigService.activeJob.mediaType === 2) {
                    this.orderConfigService.activeJob.printBrokerFiles = null;
                }
            } else {
              this.sharedDataService.configPageIsLoaded = true;
            }
        });
    }

    cancelJob() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: { message: 'Delete ' + this.orderConfigService.getActiveConfigProduct().name + ' from the order?' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (this.orderConfigService.cartCount() === 0) {
                    // no other jobs in cart after cancel - navigate back to products
                    this.orderConfigService.jobIdCounter = 1;
                    this.orderConfigService.hasWorkFrontJob = false;
                    this.orderConfigService.resetActiveJobFileInfo();
                    this.router.navigate(['/product']);
                } else {
                    const jobNumber = this.orderConfigService.getActiveJob().jobNumber;

                    // check if job is in cart
                    if (this.orderConfigService.cart[jobNumber]) {
                        this.orderConfigService.deleteJobFromCart(jobNumber);
                    }

                    this.canDeactivateGuardService.jobTabActive = true;

                    if (this.orderConfigService.cartCount() > 0) {
                        let newJobNumber;
                        for (const item in this.orderConfigService.cart) {
                            newJobNumber = item;
                            break;
                        }
                        this.orderConfigService.changeActiveJob(newJobNumber);
                        this.orderConfigService.isEditJob = true;
                        this.router.navigate(['/config'], {queryParams: {job: newJobNumber}});
                        this.orderConfigService.jobCancelled.next(true);
                    } else {
                        this.orderConfigService.resetActiveJobFileInfo();
                        this.router.navigate(['/product']);
                    }
                }
            }
        });

    }

    cancelOrder() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: { message: 'Delete the entire order?' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.orderConfigService.deleteOrder();
                this.canDeactivateGuardService.deleteOrderActive = true;
                this.router.navigate(['/']);
            }
        });
    }

    saveForLater() {
        this.notificationService.showLoader();
        if (!this.orderConfigService.orderCustomerSelected) {
            this.notificationService.hideLoader();
            // open saveforlater customer dialog
            const dialogRef = this.dialog.open(SaveforlaterCustomerDialogComponent, {
                width: '1000px',
                data: {}
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    if (this.orderConfigService.saveCustomerInfo) {
                        const address = new Address(this.orderConfigService.orderCustomer.address1,
                            this.orderConfigService.orderCustomer.address2, this.orderConfigService.orderCustomer.city,
                            null, this.orderConfigService.orderCustomer.state, this.orderConfigService.orderCustomer.zip);

                        this.addressValidation.verifyAddress(address).subscribe(
                            response => {
                                this.notificationService.hideLoader();

                                if (response.addressVerified && !response.replaceAddress) {
                                    // continue with submission
                                    this.saveOrder();
                                } else if (response.addressVerified && response.replaceAddress) {
                                    // prompt associate to change address

                                    const dialogRefAdr = this.dialog.open(AddressValidationDialogComponent, {
                                        width: '315px',
                                        data: { address: response.suggestedAddress }
                                    });
                                    dialogRefAdr.afterClosed().subscribe(closeResult => {
                                        this.notificationService.showLoader();
                                        if (closeResult === 'change') {
                                            this.orderConfigService.orderCustomer.zip = response.suggestedAddress.zip;
                                            this.orderConfigService.orderCustomer.state = response.suggestedAddress.state;
                                            this.orderConfigService.orderCustomer.city = response.suggestedAddress.city;
                                        }
                                        this.saveOrder();
                                    });
                                } else {
                                // invalid address
                                throw new Error(response.errorMsg);
                                }
                            }
                        );
                    } else {
                        this.saveOrder();
                    }
                }
            });
        } else {
            this.saveOrder();
        }
    }


  /**
   * Saves the current order. If the customer is being added to ECH, we need
   * to get back the new customer information to include in the call to save
   * the order. Otherwise, just call the API with the information as is. If the
   * call to ECH fails, we still want to save the order.
   */
  saveOrder() {
    this.addAllJobsToCart();
    const orderSubmissionObject = this.orderConfigService.createOrderSubmissionObject();

    if (this.orderConfigService.saveCustomer) {
      this.echCustomerService.addCustomerToEch(orderSubmissionObject.customer)
        .subscribe(result => {
          orderSubmissionObject.customer = result;
          this.saveOrderHelper(orderSubmissionObject, true);
        }, error => {
          this.saveOrderHelper(orderSubmissionObject, true);
          throw new CustomSBError(error, 'Failed to add customer to EHC', false);
        });
    } else {
      this.saveOrderHelper(orderSubmissionObject, true);
    }
  }

  addAllJobsToCart() {
    if (this.orderConfigService.isEditJob) {
      this.updateJob();
    } else {
      this.orderConfigService.addToCart();
    }
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
    this.orderService.submitOrder(orderSubmissionObject, saveForLater).subscribe(
      result => {
        this.response = <OrderSubmissionReponse>result.body;
        this.notificationService.hideLoader();
        if (!result.body.sbOrderNumber) {
          throw new Error(this.errorMsgs.saveForLater);
        } else {
          const dialogRef = this.dialog.open(SaveForLaterDialogComponent, {
            width: '200px',
            data: {orderNumber: this.response.sbOrderNumber}
          });
          dialogRef.afterClosed().subscribe(closeResult => {
              this.orderConfigService.deleteOrder();
              this.canDeactivateGuardService.deleteOrderActive = true;
              this.router.navigate(['/']);
          });
        }
      }, error => {
        this.notificationService.hideLoader();
        throw new Error(this.errorMsgs.saveForLaterError);
      }
    );
  }

  addToCartDisabled() {
    if ( this.orderConfigService.activeJob.mediaType === 3
        || this.orderConfigService.activeJob.isNoneSelected ) {
      return true;
    }

    if (this.orderConfigService.activeJob.turnTimeOptions
        && Object.keys(this.orderConfigService.activeJob.turnTimeOptions).length === 0) {
      return false;
    }

    if (this.orderConfigService.activeJob.turnTimeOptions
        && Object.keys(this.orderConfigService.activeJob.turnTimeOptions).length > 0
        && this.orderConfigService.activeJob.selectedTurnTime) {
        return false;
    }

    return false;
  }

  calcSubtotal(): void {
    this.orderConfigService.calcJobPriceData(this.orderConfigService.activeJob);
  }
}
