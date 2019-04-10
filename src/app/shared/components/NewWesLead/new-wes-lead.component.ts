import {Component, OnInit, Inject, ViewContainerRef} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {Address} from '@app/models/Address';
import {WesLeadData} from '@app/models/wes-lead-data';
import {CommonConstants} from '@app/config/common-constants';
import {AddressValidationDialogComponent} from '@app/shared/components/address-validation-dialog/address-validation-dialog.component';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {FileUploadComponent} from '@app/shared/components/FileComponents';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {WesLeadResultComponent} from '@app/shared/components/NewWesLead/wes-lead-result/wes-lead-result.component';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {WesleadsService} from '@app/shared/services/wesleads/wesleads.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {ConfirmationDialogComponent} from '../ConfirmationDialog/ConfirmationDialog.component';
import {take} from 'rxjs/operators/take';


@Component({
  selector: 'app-wes-leads',
  templateUrl: './new-wes-lead.component.html',
  styleUrls: ['./new-wes-lead.component.css']
})

export class NewWesLeadComponent implements OnInit {

    // Validators for error messaging
    rewardsNumber = this.validators.getRewardsVal();
    firstName = this.validators.getNameVal();
    lastName = this.validators.getNameVal();
    phoneNumber = this.validators.getPhoneNumberVal();
    email = this.validators.getEmailVal();
    address1 = this.validators.getAddressVal();
    address2 = this.validators.getAddressVal();
    city = this.validators.getCityVal();
    state = this.validators.getRequiredVal();
    zipCode = this.validators.getZipCodeVal();
    bestTimeToCall = this.validators.getRequiredVal();
    preferredContact = this.validators.getRequiredVal();
    projectDueDate = this.validators.getRequiredVal();
    projectDetails = this.validators.getRequiredVal();
    associateName = this.validators.getRequiredVal();

    model = new WesLeadData();
    wesData: any;
    leadData: any;
    toolTipPosition = 'below';
    phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
    addressValidationError: string;
    serverSideError: string;
    wesLeadSubmitError: string;
    commonConstants = CommonConstants;
    send = true;

  constructor (
          public dialogRef: MatDialogRef<NewWesLeadComponent>,
          private notificationService: NotificationService,
          private translate: TranslateService,
          public validators: ValidatorsService,
          @Inject(MAT_DIALOG_DATA) public data: any,
          public wesleadsService: WesleadsService,
          public sharedDataService: SharedDataService,
          vcr: ViewContainerRef,
          public orderConfigService: OrderConfigService,
          public storeInfoService: StoreinfoService,
          public dialog: MatDialog,
          private addressValidation: AddressValidationService,
          private userService: UserInfoService
  ) {

      this.wesData = data.data;
      this.leadData = data.leadData;

      if (this.orderConfigService.orderCustomerSelected) {
        this.model.address1 = this.orderConfigService.orderCustomer.address1;
        this.model.address2 = this.orderConfigService.orderCustomer.address2;
        this.model.rewardsNumber = this.orderConfigService.orderCustomer.rewardsNumber;
        this.model.firstName = this.orderConfigService.orderCustomer.firstname;
        this.model.lastName = this.orderConfigService.orderCustomer.lastname;
        this.model.email = this.orderConfigService.orderCustomer.email;
        this.model.phoneNumber = this.orderConfigService.orderCustomer.phoneNumber;
        this.model.city = this.orderConfigService.orderCustomer.city;
        this.model.state = this.orderConfigService.orderCustomer.state;
        this.model.zipCode = this.orderConfigService.orderCustomer.zip;
        this.model.company = this.orderConfigService.orderCustomer.company;
      } else {
        this.model = this.sharedDataService.newWesLeadInfo;
      }

      this.model.pricingIssue = this.data.leadType;
  }

  ngOnInit() {
      this.model.associateName = this.userService.user.firstName + ' ' + this.userService.user.lastName;

      this.translate.get('COMMON.error').subscribe(
        data => {
          this.addressValidationError = data.addressValidation;
          this.serverSideError = data.serverSide;
          this.wesLeadSubmitError = data.wesLeadSubmit;
        }
      );

      if (this.orderConfigService.orderCustomerSelected) {
        this.model.zipCode = this.orderConfigService.orderCustomer.zip;
      } else {
        this.model.zipCode = this.sharedDataService.newWesLeadInfo.zipCode;
      }

      if ( this.model.zipCode !== null && this.model.zipCode !== undefined) {
          this.model.zipCode = this.model.zipCode.substring(0, 5);
      }
  }

  fileUpload() {
      const dialogRef = this.dialog.open(FileUploadComponent, {
          width: '900px',
          height: 'auto',
          data: { isWesUpload: true }
        });
  }

  onNoClick(): void {
      this.dialogRef.close({status: 'cancel'});
    }

  onSubmit() {
    // Skip address validation for existing customers
    if (!this.orderConfigService.orderCustomerSelected) {
        this.send = false;
        const address = new Address(this.model.address1, this.model.address2, this.model.city, null, this.model.state, this.model.zipCode);
        this.notificationService.showLoader();
        this.addressValidation.verifyAddress(address).subscribe(
          response => {
            this.notificationService.hideLoader();
            if (response.addressVerified && !response.replaceAddress) {
              // continue with submission
              this.submitWesLead();
            } else if (response.addressVerified && response.replaceAddress) {
              // prompt associate to change address
              const dialogRef = this.dialog.open(AddressValidationDialogComponent, {
                width: '315px',
                data: { address: response.suggestedAddress }
              });
              dialogRef.afterClosed().subscribe(closeResult => {
                  if (closeResult === 'change') {
                    this.model.zipCode = response.suggestedAddress.zip;
                    this.model.state = response.suggestedAddress.state;
                    this.model.city = response.suggestedAddress.city;
                  }
                  this.submitWesLead();
              });
            } else {
              const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '315px',
                data: { message: this.translate.instant('COMMON.error.addressNotFoundInEch') }
              });
              dialogRef.afterClosed()
                .pipe(take(1))
                .subscribe(
                  (result) => {
                    if (result) {
                      this.submitWesLead();
                    }
                  }
                );
              this.send = true;
              throw new Error(this.wesLeadSubmitError);
            }
          },
          error => {
            this.notificationService.hideLoader();
            throw new Error('Oops: ' + error);
          }
        );
    } else {
        this.submitWesLead();
    }
  }

  submitWesLead() {
    // Append uploaded file link to comments section
    if (this.sharedDataService.wesFileLink !== '') {
        this.model.projectDetails += ' | File Uploaded: ' + this.sharedDataService.wesFileLink;
    }
    // Call Wes lead API passing model of entered lead data
    this.notificationService.showLoader();
    this.wesleadsService.createWesLead(this.model).subscribe(
      data => {
          this.notificationService.hideLoader();
          this.sharedDataService.newWesLeadInfo = new WesLeadData();
          this.openResultDialog(this.model, true);
          this.dialogRef.close({status: 'success', msg: 'WES Lead Created Successfully!'});
      },
      err => {
          this.notificationService.hideLoader();
          this.sharedDataService.newWesLeadInfo = this.model;
          this.openResultDialog(this.model, false);
          this.dialogRef.close({status: 'error', msg: 'Error creating WES Lead. Please try again!'});
      },
      () => {
      }
    );
  }

  openResultDialog(data, status) {
    const resultDialog = this.dialog.open(WesLeadResultComponent, {
      width: '700px',
      height: 'auto',
      data: {model: data, status: status}
    });
  }
}
