import {Component, OnInit, Inject, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {Address} from '../../../models/Address';
import {AddressValidationDialogComponent} from '../address-validation-dialog/address-validation-dialog.component';
import {NotificationService} from '../../../core/Services/notification/notification.service';
import {SnackNotification} from '../../../models/SnackNotification';
import {CustomerInformationComponent} from '../CustomerInformation/CustomerInformation.component';
import {OrderConfigService} from '../../../core/Services/order-config/order-config.service';
import {AddressValidationService} from '../../services/address-validation/address-validation.service';

@Component({
  selector: 'app-saveforlater-customer-dialog',
  templateUrl: './saveforlater-customer-dialog.component.html',
  styleUrls: ['./saveforlater-customer-dialog.component.css']
})

export class SaveforlaterCustomerDialogComponent implements OnInit {
  custInfoFormValid = false;

  @ViewChild('custInformationComponent') private customerInformationComponent: CustomerInformationComponent;

  constructor(
    public translate: TranslateService,
    public orderConfigService: OrderConfigService,
    public dialogRef: MatDialogRef<SaveforlaterCustomerDialogComponent>,
    public notificationService: NotificationService,
    public addressValidation: AddressValidationService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

  setCustInfoFormValid(valid) {
    this.orderConfigService.isOrderCustomerInfoValid = valid;
    this.custInfoFormValid = valid;
  }

  saveOrder() {
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
          (response) => {
            this.notificationService.hideLoader();

            if (response.addressVerified && !response.replaceAddress) {
              this.dialogRef.close(true);
            } else if (response.addressVerified && response.replaceAddress) {
              // prompt associate to change address
              const dialogRefAdr = this.dialog.open(AddressValidationDialogComponent, {
                width: '315px',
                data: {address: response.suggestedAddress}
              });
              dialogRefAdr.afterClosed().subscribe(closeResult => {
                if (closeResult === 'change') {
                  this.orderConfigService.orderCustomer.zip = response.suggestedAddress.zip.substring(0, 5);
                  this.orderConfigService.orderCustomer.state = response.suggestedAddress.state;
                  this.orderConfigService.orderCustomer.city = response.suggestedAddress.city;
                }

                this.dialogRef.close(true);
              });
            } else {
              // invalid address
              // Are we sure we want to not allow the user to proceed
              // if we cannot verify with ECH?
              this.notificationService.notify(new SnackNotification(
                this.translate.instant('COMMON.error.addressValidation')
                + this.translate.instant('COMMON.error.addressNotFoundInEch'), null)
              );

              this.dialogRef.close(true);
            }
          },
        );
      } else {
        this.dialogRef.close(true);
      }
    }

    this.orderConfigService.showEmailPhoneRequired =
      !this.orderConfigService.orderCustomer.phoneNumber && !this.orderConfigService.orderCustomer.email;
  }

}
