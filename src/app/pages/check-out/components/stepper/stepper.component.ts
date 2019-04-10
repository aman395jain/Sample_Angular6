import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatStepper } from '@angular/material';
import {Address} from '@app/models/Address';
import {AddressValidationDialogComponent} from '@app/shared/components/address-validation-dialog/address-validation-dialog.component';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {SnackNotification} from '@app/models/SnackNotification';
import {CustomerInformationComponent} from '@app/shared/components/CustomerInformation/CustomerInformation.component';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})

export class StepperComponent implements OnInit {
  @ViewChild('validateCustInfoForm') private customerInformationComponent: CustomerInformationComponent;
  custInfoFormValid = false;
  @ViewChild('stepper') stepper: MatStepper;
  private errorMsgs: any;
  selectedIndex = 0;
  private shippingEligible: any;
  public shakeLinks = new Subject();

  constructor(
          public translate: TranslateService,
          public orderConfigService: OrderConfigService,
          private sharedDataService: SharedDataService,
          private addressValidation: AddressValidationService,
          public logger: LoggerService,
          public dialog: MatDialog,
          public storeInfoService: StoreinfoService,
          private notificationService: NotificationService) { }

  ngOnInit() {
      this.translate.get('COMMON.error').subscribe(result => {
        this.errorMsgs = result;
    });
    // this.shippingEligible = this.orderConfigService.getShippingEligibility();
  }

  stepChanged(event) {
    this.selectedIndex = event.selectedIndex;
  }

  animationDone() {
    if (this.selectedIndex === 3) {
        this.sharedDataService.orderReviewStep.next(true);
    } else {
        this.sharedDataService.orderReviewStep.next(false);
    }
  }

  getErrorMessage(requestedMessage: string) {
    let errorMessage: string;
    this.translate.get(requestedMessage).subscribe(
      ( result ) => {
        errorMessage = result;
      },
      ( error ) => {
        errorMessage = 'Error in error message retrieval';
      }
    );
    return errorMessage;
  }


  setCustInfoFormValid(valid) {
    this.orderConfigService.isOrderCustomerInfoValid = valid;
    this.custInfoFormValid = valid;
  }

  jobTabNext(stepper: MatStepper) {
    // check products here.. temporary until we get objects created
    let chk1 = this.storeInfoService.getStoreFeatureValue('Shipping_Valid_Products 2');
    let chk2 = this.storeInfoService.getStoreFeatureValue('Shipping_Valid_Products 1');

    this.orderConfigService.validShipOrder = true;
    this.orderConfigService.getCart().forEach(key => {
      if (!chk1.includes(this.orderConfigService.cart[key].sku) &&
           !chk2.includes(this.orderConfigService.cart[key].sku)) {
            this.orderConfigService.validShipOrder = false;
      }
    });
    stepper.next();
  }

  custInfoNext(stepper: MatStepper) {
    this.customerInformationComponent.validateCustomerInfoForm();

    if (!this.custInfoFormValid) {
      // Errors will be handled and displayed by CustomerInformation component.
      return;
    }

    if (this.orderConfigService.isOrderCustomerInfoValid) {
      if (!this.orderConfigService.isEchCustomer && this.orderConfigService.saveCustomerInfo) {
        this.notificationService.showLoader();
        const address = new Address(this.orderConfigService.orderCustomer.address1,
          this.orderConfigService.orderCustomer.address2, this.orderConfigService.orderCustomer.city,
          null, this.orderConfigService.orderCustomer.state, this.orderConfigService.orderCustomer.zip);

        this.addressValidation.verifyAddress(address).subscribe(
          ( response ) => {
            this.notificationService.hideLoader();

            if (response.addressVerified && !response.replaceAddress) {
              // continue with stepper
              this.setShippingInfo();
              stepper.next();

            } else if (response.addressVerified && response.replaceAddress) {
              // prompt associate to change address
              const dialogRefAdr = this.dialog.open(AddressValidationDialogComponent, {
                width: '315px',
                data: { address: response.suggestedAddress }
              });
              dialogRefAdr.afterClosed().subscribe(closeResult => {
                  if (closeResult === 'change') {
                      this.orderConfigService.orderCustomer.zip = response.suggestedAddress.zip.substring(0, 5);
                      this.orderConfigService.orderCustomer.state = response.suggestedAddress.state;
                      this.orderConfigService.orderCustomer.city = response.suggestedAddress.city;
                  }
                  this.setShippingInfo();
                  stepper.next();
              });
            } else {
              // invalid address
              // Are we sure we want to not allow the user to proceed
              // if we cannot verify with ECH?
              this.notificationService.notify(new SnackNotification(
                this.getErrorMessage('COMMON.error.addressValidation')
                  + this.getErrorMessage('COMMON.error.addressNotFoundInEch'), null)
              );
              stepper.next();
            }
          },
        );
      } else {
        stepper.next();
      }

     // this.shippingEligible = this.orderConfigService.getShippingEligibility();
     // console.log('Shipping eligible? '+JSON.stringify(this.shippingEligible));

    }

    this.orderConfigService.showEmailPhoneRequired =
      !this.orderConfigService.orderCustomer.phoneNumber && !this.orderConfigService.orderCustomer.email;
  }

  setShippingInfo() {
    this.orderConfigService.shippingInfoJ.firstName = this.orderConfigService.orderCustomer.firstname;
    this.orderConfigService.shippingInfoJ.lastName = this.orderConfigService.orderCustomer.lastname;
    this.orderConfigService.shippingInfoJ.address1 = this.orderConfigService.orderCustomer.address1;
    this.orderConfigService.shippingInfoJ.address2 = this.orderConfigService.orderCustomer.address2;
    this.orderConfigService.shippingInfoJ.city = this.orderConfigService.orderCustomer.city;
    this.orderConfigService.shippingInfoJ.state = this.orderConfigService.orderCustomer.state;
    this.orderConfigService.shippingInfoJ.zip = this.orderConfigService.orderCustomer.zip.substr(0, 5);
  }

  deliveryNext(stepper: MatStepper) {

    if (this.orderConfigService.shippingSelected &&
        this.orderConfigService.isShippingInfoValid &&
        this.orderConfigService.deliveryMethod === 'Shipping') {
      stepper.next();
    } else if (this.orderConfigService.isPickUpInfoValid ) {
      stepper.next();
    }
  }

  openStep(stepIndex: number): void {
    this.stepper.selectedIndex = stepIndex;
    this.shakeLinks.next(true);
  }
}
