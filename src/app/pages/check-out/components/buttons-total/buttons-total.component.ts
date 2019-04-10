import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatTooltip } from '@angular/material';
import {OrderSubmissionReponse} from '@app/models/OrderSubmissionResponse';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {ConfirmationDialogComponent} from '@app/shared/components/ConfirmationDialog/ConfirmationDialog.component';
import {Address} from '@app/models/Address';
import {AddressValidationDialogComponent} from '@app/shared/components/address-validation-dialog/address-validation-dialog.component';
import {SaveforlaterCustomerDialogComponent} from '@app/shared/components/saveforlater-customer-dialog/saveforlater-customer-dialog.component';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {OrderSubmission} from '@app/models/OrderSubmission/OrderSubmission';
import {SaveForLaterDialogComponent} from '@app/shared/components/save-for-later-dialog/save-for-later-dialog.component';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {EchCustomerService} from '@app/shared/services/EchCustomer/EchCustomer.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';

@Component({
  selector: 'app-buttons-total',
  templateUrl: './buttons-total.component.html',
  styleUrls: ['./buttons-total.component.css']
})

export class ButtonsTotalComponent implements OnInit {
  addressValidationError: string;
  serverSideError: string;
  response: OrderSubmissionReponse;
  saveForLaterError: string;
  failedToAddToEchError: string;
  model = new OrderSubmissionReponse(null);
  public jobkeyList: any;
  public showPricingLoader = false;

  // Base product price with any additonal fees charged for availibility guarantee
  public subtotal = 0;
  // All discounts for jobs combined
  public orderLevelDiscount = 0;
  // Subtotal price - any discount
  public total = 0;

  // hack
  public prevShipPrice = 0;

  @ViewChild(MatTooltip) tooltip: MatTooltip;

  constructor(
    public translate: TranslateService,
    public orderConfigService: OrderConfigService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private fileUploadService: FileUploadService,
    private addressValidation: AddressValidationService,
    private echCustomerService: EchCustomerService) { }

  ngOnInit() {
    this.translate.get('COMMON.error').subscribe(
      data => {
        this.addressValidationError = data.addressValidation;
        this.serverSideError = data.serverSide;
        this.saveForLaterError = data.saveForLater;
        this.failedToAddToEchError = data.failedToAddToEch;
      }
    );

    this.orderConfigService.cartChanged.subscribe(
      (result) => {
        this.jobkeyList = this.orderConfigService.getCart();
      }
    );

    this.orderConfigService.orderPriceData.subscribe(
      ( result ) => {
        this.subtotal = result['orderSubtotal'] !== undefined ? result['orderSubtotal'] : 0 ;
        this.orderLevelDiscount = result['orderDiscount'] !== undefined ? result['orderDiscount'] : 0;
        this.total = result['orderTotal'] !== undefined ? result['orderTotal'] : 0;
      },
      ( error ) => {
        throw new Error('Error displaying order pricing ' + error);
      }
    );

    this.orderConfigService.shippingEnabled.subscribe(
      data => {
        if (data && this.prevShipPrice !== parseFloat(this.orderConfigService.shippingOption.total)) {
          this.total -= this.prevShipPrice;
          this.prevShipPrice = parseFloat(this.orderConfigService.shippingOption.total);
          this.total += parseFloat(this.orderConfigService.shippingOption.total);
        }
      }
    );
  }

  cancelOrder() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to cancel this order?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderConfigService.deleteOrder();
        this.router.navigate(['/']);
      }
    });
  }

  submit(type) {
      this.notificationService.showLoader();
      if (type !== 'saveForLater') {
          const address = new Address(this.orderConfigService.orderCustomer.address1,
                this.orderConfigService.orderCustomer.address1, this.orderConfigService.orderCustomer.city,
                null, this.orderConfigService.orderCustomer.state, this.orderConfigService.orderCustomer.zip);
          this.addressValidation.verifyAddress(address).subscribe(
            response => {
              this.notificationService.hideLoader();

              if (response.addressVerified && !response.replaceAddress) {
                // continue with submission
                this.saveForLater();
              } else if (response.addressVerified && response.replaceAddress) {
                // prompt associate to change address
                const dialogRef = this.dialog.open(AddressValidationDialogComponent, {
                  width: '315px',
                  data: { address: response.suggestedAddress }
                });
                dialogRef.afterClosed().subscribe(closeResult => {
                  this.notificationService.showLoader();
                  if (closeResult === 'change') {
                    this.orderConfigService.orderCustomer.zip = response.suggestedAddress.zip;
                    this.orderConfigService.orderCustomer.state = response.suggestedAddress.state;
                    this.orderConfigService.orderCustomer.city = response.suggestedAddress.city;
                  }
                  this.saveForLater();
                });
              } else {
                // invalid address
                throw new Error(response.errorMsg);
              }
            }
          );
      } else {
          this.saveForLater();
      }
  }


  /**
   * Saves the current order. If the customer is being added to ECH, we need
   * to get back the new customer information to include in the call to save
   * the order. Otherwise, just call the API with the information as is. If the
   * call to ECH fails, we still want to save the order.
   */
  saveForLater() {
    this.notificationService.showLoader();
    if (!this.orderConfigService.orderCustomerSelected) {
        this.notificationService.hideLoader();
        // open saveforlater customer dialog
        const dialogRef = this.dialog.open(SaveforlaterCustomerDialogComponent, {
            width: '1000px',
            data: {}
        });
        dialogRef.afterClosed().subscribe(
          result => {
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
                    this.orderConfigService.isEditJob = true;
                }
            } else {

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
    const orderSubmissionObject = this.orderConfigService.createOrderSubmissionObject();

    if (this.orderConfigService.saveCustomer) {
      this.echCustomerService.addCustomerToEch(orderSubmissionObject.customer)
        .subscribe(result => {
          orderSubmissionObject.customer = result;
          this.saveForLaterHelper(orderSubmissionObject, true);
        }, error => {
          this.saveForLaterHelper(orderSubmissionObject, true);
          throw new CustomSBError(error, this.failedToAddToEchError, false);
        });
    } else {
      this.saveForLaterHelper(orderSubmissionObject, true);
    }
  }

  addProduct() {
    this.orderConfigService.activeJob.selectedTurnTime = null;
    this.orderConfigService.resetActiveJobFileInfo();
    this.router.navigate(['/product']);
  }


  /**
   * Consolidates the code for complicated logic in saveForLater() method.
   *
   * @param orderSubmissionObject data to send
   * @param saveForLater flag to indicate if this a save-for-later operation
   */
  saveForLaterHelper(orderSubmissionObject: OrderSubmission, saveForLater: boolean) {

    if (this.orderConfigService.isEditQuote || this.orderConfigService.isEditOrder) {
      orderSubmissionObject.orderNumber = this.orderConfigService.orderNumber;
      orderSubmissionObject.isEdit = true;
    } else {
      orderSubmissionObject.orderNumber = null;
      orderSubmissionObject.isEdit = false;
    }

    this.orderService.submitOrder(orderSubmissionObject, true)
      .subscribe(
        result => {
          this.response = <OrderSubmissionReponse>result.body;
          this.notificationService.hideLoader();
          if (!result.body.sbOrderNumber) {
            throw new Error(this.saveForLaterError);
          } else {
            const dialogRef = this.dialog.open(SaveForLaterDialogComponent, {
              width: '200px',
              data: { orderNumber: this.response.sbOrderNumber }
            });

            dialogRef.afterClosed().subscribe(closeResult => {
              this.orderConfigService.deleteOrder();
              this.router.navigate(['/']);
            });
          }
        }, error => {
          throw new Error(this.saveForLaterError);
        }
      );
  }

}
