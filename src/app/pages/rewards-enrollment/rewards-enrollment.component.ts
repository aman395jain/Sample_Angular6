import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import {RewardsEnrollmentService} from '@app/pages/rewards-enrollment/services/rewards-enrollment/rewards-enrollment.service';
import {CustomerInformation} from '@app/models/CustomerInformation';
import {CommonConstants} from '@app/config/common-constants';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {rewardsCustomer} from '@app/models/rewardsCustomer';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {RewardsEnrollmentDialogComponent} from '@app/pages/rewards-enrollment/components/rewards-enrollment-dialog/rewards-enrollment-dialog.component';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {environment} from '@env/environment';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';


@Component({
  selector: 'app-rewards-enrollment',
  templateUrl: './rewards-enrollment.component.html',
  styleUrls: ['./rewards-enrollment.component.css']
})

export class RewardsEnrollmentComponent implements OnInit {
  step = 0;
  model = new rewardsCustomer(null, null, null, null, null, null, null, null, null, null, null, null, null);
  rewardsSuccess = false;
  enrollRewardsImg = '/assets/img/61351_300W.jpg';
  rewardsNumber = '';
  isNewCustomer = false;
  showEnrollButton = false;
  serverSideError: string;
  enrollError: string;
  rewardsExistingCustomerMsgFull = 'ENR_R_100~Full Match';
  rewardsExistingCustomerMsgPartial = 'ENR_R_101~Partial Match';

  // Validators for error messaging
  firstName = this.validators.getNameVal();
  lastName = this.validators.getNameVal();
  phoneNumber = this.validators.getPhoneNumberVal();
  email = this.validators.getEmailVal();
  zipCode = this.validators.getZipCodeVal();
  company = this.validators.getRequiredVal();
  account = this.validators.getRequiredVal();
  public commonConstants = CommonConstants;
  phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  @ViewChild('rewardsEnrollmentForm') rewardsEnrollmentForm;

  constructor(
    private orderConfigService: OrderConfigService,
    private validators: ValidatorsService,
    public translate: TranslateService,
    private rewardsEnrollmentService: RewardsEnrollmentService,
    public dialog: MatDialog,
    public router: Router,
    private notificationService: NotificationService,
    private userService: UserInfoService
  ) {
    this.enrollRewardsImg = environment.rootURL + this.enrollRewardsImg;
  }

  ngOnInit() {
    this.translate.get('COMMON.error').subscribe(
      data => {
        this.serverSideError = data.serverSide;
        this.enrollError = data.rewardsEnrollError;
      }
    );

    this.model.associateNumber = this.userService.user.loginId;

    if (this.orderConfigService.orderCustomerSelected) {
      this.model.firstname = this.orderConfigService.orderCustomer.firstname;
      this.model.lastname = this.orderConfigService.orderCustomer.lastname;
      this.model.company = this.orderConfigService.orderCustomer.company.substring(0, 30);
      this.model.email = this.orderConfigService.orderCustomer.email;
      this.model.phoneNumber = this.orderConfigService.orderCustomer.phoneNumber;
      this.model.zip = !!this.orderConfigService.orderCustomer.zip ? this.orderConfigService.orderCustomer.zip.substring(0, 5) : null;

      if (this.orderConfigService.orderCustomer.rewardsNumber && this.orderConfigService.orderCustomer.rewardsNumber !== ''
        && this.orderConfigService.orderCustomer.rewardsNumber !== null) {
        this.rewardsNumber = this.orderConfigService.orderCustomer.rewardsNumber;
        this.rewardsSuccess = true;
        this.displayExisitingRewardsModal();
      } else {
        this.showEnrollButton = false;
      }
    }
  }

  onSubmit() {
    this.notificationService.showLoader();
    this.enroll();
  }

  enroll() {
    // Send form data to Rewards Program API
    // response object is enrollmentStatus model
    this.model.phoneNumber = this.model.phoneNumber.toString().replace(/\D/g, '');
    this.rewardsEnrollmentService.callRewardsEnrollAPI(this.model).subscribe(res => {
      let status;

      if (res.status == '200') {
          if (res.message === this.rewardsExistingCustomerMsgFull
                  || res.message === this.rewardsExistingCustomerMsgPartial) {
              this.rewardsNumber = res.divdNum;
              this.displayExisitingRewardsModal();
            } else {
                this.rewardsSuccess = true;
                this.rewardsNumber = res.divdNum;
                status = 'New';
                this.orderConfigService.isNewRewardsEnroll = true;

                if (this.orderConfigService.orderCustomerSelected && !this.isNewCustomer) {
                  let rewardsCustomer = this.orderConfigService.orderCustomer;
                  this.populateOrderCustomer(rewardsCustomer);
                  this.orderConfigService.orderCustomerSelected = true;
                  rewardsCustomer.rewardsNumber = res.divdNum;
                  this.orderConfigService.setOrderCustomer(rewardsCustomer);
                }

                const dialogRef = this.dialog.open(RewardsEnrollmentDialogComponent, {
                  width: '320px',
                  data: { rewardsNumber: this.rewardsNumber,
                    firstname: this.model.firstname,
                    lastname: this.model.lastname,
                    status: status
                  }
                });

                dialogRef.afterClosed().subscribe(result => {
                  if (result) {
                    this.createOrder();
                  } else {
                    this.showEnrollButton = true;
                  }
                });
            }

      } else {
        this.notificationService.hideLoader();
        this.rewardsSuccess = false;
        throw new Error(this.enrollError);
      }
      this.notificationService.hideLoader();
    }, error => {
      this.rewardsSuccess = false;
      this.notificationService.hideLoader();
      throw new Error(this.enrollError);
    });
  }

  populateOrderCustomer(rewardsCustomer: CustomerInformation) {
    rewardsCustomer.firstname = this.model.firstname;
    rewardsCustomer.lastname = this.model.lastname;
    rewardsCustomer.company = this.model.company;
    rewardsCustomer.email = this.model.email;
    rewardsCustomer.phoneNumber = this.model.phoneNumber;
    rewardsCustomer.zip = this.model.zip;
  }

  // Clears out current customer in model
  enrollNewCustomer() {
    this.rewardsSuccess = false;
    this.isNewCustomer = true;
    this.showEnrollButton = false;
    this.model = new rewardsCustomer(null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  // Stores customer, starts new order workflow
  createOrder() {
    this.orderConfigService.orderCustomer = null;
    const rewardsCustomer = new CustomerInformation();
    this.populateOrderCustomer(rewardsCustomer);
    this.orderConfigService.orderCustomerSelected = true;
    rewardsCustomer.rewardsNumber = this.rewardsNumber;
    this.orderConfigService.setOrderCustomer(rewardsCustomer);
    this.orderConfigService.resetActiveJobFileInfo();
    this.router.navigate(['/product']);
  }

  displayExisitingRewardsModal() {
      const dialogRef = this.dialog.open(RewardsEnrollmentDialogComponent, {
        width: '320px',
        data: { rewardsNumber: this.rewardsNumber,
          firstname: this.model.firstname,
          lastname: this.model.lastname,
          status: 'Existing'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.enrollNewCustomer();
          // Reset validation errors
          this.rewardsEnrollmentForm.resetForm();
        } else {
          this.showEnrollButton = true;
        }
      });
    }
}
