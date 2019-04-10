import {Component, OnInit, ViewChild, Input, EventEmitter, Output, AfterViewInit, AfterContentInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {CommonConstants} from '@app/config/common-constants';
import {CustomerSearchDialogComponent} from '@app/shared/components/customer-search-dialog/customer-search-dialog.component';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';


@Component({
  selector: 'app-customerinformation',
  templateUrl: './CustomerInformation.component.html',
  styleUrls: ['./CustomerInformation.component.css']
})

export class CustomerInformationComponent implements OnInit, AfterViewInit, AfterContentInit {
  @Output() setCustInfoFormValid: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('customerInfoForm') customerInfoForm;
  @Input() mode = 'indeterminate';

  public commonConstants = CommonConstants;
  readonly phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  saveCustomer = true;
  optIn = false;
  readonly emailLongClass = 'col-lg-6 col-md-6 col-sm-6 col-12 email-long';
  readonly emailShortClass = 'col-lg-7 col-md-7 col-sm-7 col-12';
  readonly optInShowClass = 'col-lg-5 col-md-5 col-sm-5 col-12 mt-3 optin-show';
  readonly optInHideClass = 'optin-hide';
  optInClasses: string;
  emailClasses: string;
  preferredEdited = false;
  emailReq = true;
  phoneReq = true;

  // Validators for error messaging
  firstName = this.validators.getNameVal();
  lastName = this.validators.getNameVal();
  phoneNumber = this.validators.getPhoneNumberVal();
  email = this.validators.getEmailVal();
  address1 = this.validators.getAddressVal();
  address2 = this.validators.getAddressVal();
  city = this.validators.getCityVal();
  state = this.validators.getRequiredVal();
  zipCode = this.validators.getZipCodeVal();
  preferredFirstName = this.validators.getNameVal();
  preferredLastName = this.validators.getNameVal();
  preferredPhoneNumber = this.validators.getPhoneNumberVal();
  preferredEmail = this.validators.getEmailVal();

  constructor(
    public translate: TranslateService,
    public validators: ValidatorsService,
    public orderConfigService: OrderConfigService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'phone';
    this.saveCustomer = !this.orderConfigService.orderCustomerSelected;
    this.updateSaveCustomer(this.saveCustomer);
    this.checkEmailOrPhone();
    this.orderConfigService.showEmailPhoneRequired = false;

     // workaround to set model initially
    if (this.orderConfigService.orderCustomer.phoneNumber !== undefined
      && this.orderConfigService.orderCustomer.phoneNumber !== null
      && this.orderConfigService.orderCustomer.phoneNumber !== '') {
      let number: string = '' + this.orderConfigService.orderCustomer.phoneNumber;
      number = number.replace(/[^0-9]/g, '').slice(0, 10);
      let phoneNum = number.slice(3);
      this.orderConfigService.orderCustomer.phoneNumber = '(' + number.slice(0, 3) + ') ' + phoneNum.slice(0, 3) + '-' + phoneNum.slice(3);
    }
    if (this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber !== undefined
      && this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber !== null
      && this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber !== '') {
        let number: string = '' + this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber;
        number = number.replace(/[^0-9]/g, '').slice(0, 10);
        let phoneNum = number.slice(3);
        this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber = '(' + number.slice(0, 3) + ') '
          + phoneNum.slice(0, 3) + '-' + phoneNum.slice(3);
    }
    ///////////////
  }

  ngAfterContentInit() {
  }

  ngAfterViewInit() {
    this.customerInfoForm.form.updateValueAndValidity();

    if (this.orderConfigService.orderCustomer.isContractCompany === true) {
      if (this.orderConfigService.orderCustomerPreferredContact.preferredFirstName === null
        || this.orderConfigService.orderCustomerPreferredContact.preferredFirstName === undefined
        || this.orderConfigService.orderCustomerPreferredContact.preferredFirstName === '') {
          this.customerInfoForm.form.get('preferredFirstName').valid = false;
        }
      this.checkFormValid();
    }

    if (this.orderConfigService.orderCustomer.zip !== undefined && this.orderConfigService.orderCustomer.zip !== null) {
      this.orderConfigService.orderCustomer.zip = this.orderConfigService.orderCustomer.zip.substring(0, 5);
    }

    if (this.orderConfigService.orderCustomerSelected) {
      if (!!this.orderConfigService.orderCustomerPreferredContact) {
        const customer = this.orderConfigService.orderCustomerPreferredContact;

        if (customer.preferredContactMode === 'email') {
          this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'email';
        } else if (customer.preferredContactMode === 'phone') {
          this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'phone';
        }
      }

      this.checkFormValid();
    }
  }

  searchForCustomer() {
    // open customer search dialog
    const dialogRef = this.dialog.open(CustomerSearchDialogComponent, {
      width: '1200px',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.orderConfigService.showEmailPhoneRequired = false;

      if (this.orderConfigService.orderCustomer.zip !== undefined) {
          this.orderConfigService.orderCustomer.zip = this.orderConfigService.orderCustomer.zip.substring(0, 5);
      }

      if (this.orderConfigService.orderCustomerSelected) {
        if (!!this.orderConfigService.orderCustomerPreferredContact) {
          const customer = this.orderConfigService.orderCustomerPreferredContact;

          if (customer.preferredContactMode === 'email') {
            this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'email';
          } else if (customer.preferredContactMode === 'phone') {
            this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'phone';
          }
        }

        // workaround to set model initially
        if (this.orderConfigService.orderCustomer.phoneNumber !== undefined
          && this.orderConfigService.orderCustomer.phoneNumber !== null
          && this.orderConfigService.orderCustomer.phoneNumber !== '') {
          let number: string = '' + this.orderConfigService.orderCustomer.phoneNumber;
          number = number.replace(/[^0-9]/g, '').slice(0, 10);
          let phoneNum = number.slice(3);
          this.orderConfigService.orderCustomer.phoneNumber = '(' + number.slice(0, 3) + ') ' + phoneNum.slice(0,3) + '-'
            + phoneNum.slice(3);
        }
        if (this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber !== undefined
          && this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber !== null
          && this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber !== '') {
            let number: string = '' + this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber;
            number = number.replace(/[^0-9]/g, '').slice(0, 10);
            let phoneNum = number.slice(3);
            this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber = '(' + number.slice(0, 3) + ') '
              + phoneNum.slice(0, 3) + '-' + phoneNum.slice(3);
        }
        ///////////////
      }

      this.checkEmailOrPhone();
      setTimeout(() => this.validateCustomerInfoForm(), 0);
    });
  }

  validateFormAlt() {
    setTimeout(() => this.validateCustomerInfoForm(), 0);
  }

  async checkFormValid() {

    this.customerInfoForm.form.updateValueAndValidity();
    // check if all address fields are filled so we can enable/disable the
    // same address toggle in delivery step
    this.orderConfigService.customerHasCompleteAddress = this.containsFullInfo(this.orderConfigService.orderCustomer);
    await this.sleep(0);

    if (this.customerInfoForm.form.valid) {
      this.orderConfigService.isOrderCustomerInfoValid = true;
      this.orderConfigService.shippingInfoJ.firstName = this.orderConfigService.orderCustomer.firstname;
      this.orderConfigService.shippingInfoJ.lastName = this.orderConfigService.orderCustomer.lastname;
      this.orderConfigService.shippingInfoJ.address1 = this.orderConfigService.orderCustomer.address1;
      this.orderConfigService.shippingInfoJ.address2 = this.orderConfigService.orderCustomer.address2;
      this.orderConfigService.shippingInfoJ.city = this.orderConfigService.orderCustomer.city;
      this.orderConfigService.shippingInfoJ.state = this.orderConfigService.orderCustomer.state;
      this.orderConfigService.shippingInfoJ.zip = this.orderConfigService.orderCustomer.zip;
    } else {
      this.orderConfigService.isOrderCustomerInfoValid = false;
    }
  }

  // clears the order config order Customer values
  clearCustomer(): void {
    this.orderConfigService.clearCustomer();
    this.customerInfoForm.reset();
    this.preferredEdited = false;
    this.resetFormControls();
  }

  resetFormControls(): void {
    for (const name in this.customerInfoForm.controls) {
      this.customerInfoForm.controls[name].setErrors(null);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  containsFullInfo (customer: any): boolean {
    let allFieldsContainInfo = true;
    if ( customer.firstname === null || customer.firstname === undefined ) {
      return allFieldsContainInfo = false;
    } else if ( customer.lastname === null || customer.lastname === undefined ) {
      return allFieldsContainInfo = false;
    } else if ( customer.address1 === null || customer.address1 === undefined ) {
      return allFieldsContainInfo = false;
    } else if ( customer.city === null || customer.city === undefined ) {
      return allFieldsContainInfo = false;
    } else if ( customer.state === null || customer.state === undefined ) {
      return allFieldsContainInfo = false;
    } else if ( customer.zip === null || customer.zip === undefined ) {
      return allFieldsContainInfo = false;
    }
    return allFieldsContainInfo;
  }

  updateSaveCustomer(checked) {
    this.saveCustomer = checked;
    this.orderConfigService.saveCustomer = this.saveCustomer;
    if (this.saveCustomer) {
      this.emailClasses = this.emailShortClass;
      this.optInClasses = this.optInShowClass;
      this.orderConfigService.saveCustomerInfo = true;
    } else {
      this.emailClasses = this.emailLongClass;
      this.optInClasses = this.optInHideClass;
      this.orderConfigService.saveCustomerInfo = false;
    }
  }

  updateOptIn(checked) {
    this.optIn = checked;
    this.orderConfigService.optIn = checked;
    this.emailReq = checked;
    this.validateCustomerInfoForm();
  }

  removeFormatting($event) {
    if ($event !== null) {
      this.orderConfigService.orderCustomer.phoneNumber = $event;
    }
  }

  populatePreferred(field, val) {
    if (!this.orderConfigService.isEchCustomer && !this.preferredEdited) {
      switch (field) {
        case 'firstName': {
          this.orderConfigService.orderCustomerPreferredContact.preferredFirstName = val;
          break;
        }
        case 'lastName': {
          this.orderConfigService.orderCustomerPreferredContact.preferredLastName = val;
          break;
        }
        case 'phoneNumber': {
          this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber = val;
          this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'phone';
          break;
        }
        case 'email': {
          this.orderConfigService.orderCustomerPreferredContact.preferredEmail = val;
          this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'email';
          break;
        }
        case 'company': {
          this.orderConfigService.orderCustomerPreferredContact.preferredCompany = val;
          break;
        }

        default: {
          break;
        }
      }
    }
  }

  togglePreferred(field) {
    switch (field) {
      case 'phone': {
        this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'phone';
        break;
      }
      case 'email': {
        this.orderConfigService.orderCustomerPreferredContact.preferredContactMode = 'email';
        break;
      }
    }
  }

  checkEmailOrPhone() {
    this.emailReq = !!this.orderConfigService.orderCustomer.email;
    this.phoneReq = !!this.orderConfigService.orderCustomer.phoneNumber;

    if (this.phoneReq && this.emailReq) {
      this.phoneReq = false;
      this.emailReq = false;
    } else if (!this.phoneReq && !this.emailReq) {
      this.phoneReq = true;
      this.emailReq = true;
    }
  }

  validateCustomerInfoForm() {
    this.checkFormValid();
    this.setCustInfoFormValid.emit(this.orderConfigService.isOrderCustomerInfoValid);
  }
}
