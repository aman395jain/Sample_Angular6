import {
  Component, OnInit, ViewContainerRef, ViewChild, ElementRef,
  Input, AfterViewInit, ChangeDetectorRef, OnDestroy, EventEmitter, Output
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CustomerSearch} from '@app/models/customer-search';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {SnackNotification} from '@app/models/SnackNotification';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';


@Component({
  selector: 'app-customer-search',
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.css']
})

export class CustomerSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly phoneMask: any[] = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  private orderSummarySub: Subscription;
  private customerListSub: Subscription;
  private dialogRefSub: Subscription;
  private subscriptions = Array<Subscription>(this.orderSummarySub, this.customerListSub, this.dialogRefSub);

  // Form controls with validators for error messaging.
  firstName = this.validators.getNameVal();
  lastName = this.validators.getNameVal();
  email = this.validators.getEmailVal();
  phoneNumber = this.validators.getPhoneNumberVal();
  rewardsNumber = this.validators.getRewardsVal();
  masterAccountNo = this.validators.getMasterAccountVal();
  companyName = this.validators.getCompanyVal();
  orderNumber = this.validators.getOrderNumberVal();

  model: CustomerSearch;
  invalidOrderNumber: boolean;
  input: boolean;
  formattedPhoneNumber: number;

  private searchByCompany = false;


  @ViewChild('custSearchForm') custSearchForm;
  @ViewChild('focusElement') focusEl: ElementRef;
  @Input('displayMode') displayMode;
  @Output() nextAccordionTab = new EventEmitter<void>();
  @Output() setAccordionTab = new EventEmitter<number>();
  @Output() setCustomerSearchErrorMessage = new EventEmitter();
  @Output() setCustomerSearchResultList = new EventEmitter();
  @Output() setSearchResultsTabEnabled = new EventEmitter();

  disableField = {
    'retail': false,
    'business': false,
    'order': false
  };

  constructor(
    public translate: TranslateService,
    public validators: ValidatorsService,
    public customerSearchService: CustomerSearchService,
    vcr: ViewContainerRef,
    public dialog: MatDialog,
    private router: Router,
    public storeInfo: StoreinfoService,
    public orderService: OrderService,
    private notificationService: NotificationService,
    private orderConfigService: OrderConfigService,
    private changeDetRef: ChangeDetectorRef,
    private sharedDataService: SharedDataService
  ) {
  }

  ngOnInit() {
    this.model = new CustomerSearch(null, null, null, null, null, null, null, null);
    this.invalidOrderNumber = false;
    this.input = false;
    this.formattedPhoneNumber = this.model.phoneNumber;
  }

  ngAfterViewInit() {
    this.setDefaultFocus();
  }

  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      if (!!sub) {
        sub.unsubscribe();
      }
    }
  }

  checkAndSubmit() {
    if (this.custSearchForm.form.valid && this.input) {
      this.submit();
    }
  }

  submit() {
    this.notificationService.showLoader();

    // Clear out any previous populated results.
    this.customerSearchService.changeSelectedCustomer(null);
    this.sharedDataService.changeSelectedOrderSummary(null);

    // search by order number
    if (this.model.orderNumber && this.displayMode === 'page') {
      this.orderSummarySub = this.orderService.retrieveCustomerOrderSummary(parseInt(this.model.orderNumber, 10)).subscribe(order => {
        const results: any[] = <any[]>order;

        if (results === undefined || results.length < 1) {
          this.invalidOrderNumber = true;
          this.notificationService.hideLoader();
          this.notificationService.notify(new SnackNotification(
            this.translate.instant('ORDER.summary.noRecords') + this.model.orderNumber, null));
          this.setSearchResultsTabEnabled.emit(false);
        } else {
          this.sharedDataService.changeSelectedOrderSummary(results);
          this.notificationService.hideLoader();
          this.setAccordionTab.emit(3);
        }
        this.orderConfigService.isCustomerSearch = true;
      });

      return;
    }

    // convert formatted phone number to just digits
    if (this.formattedPhoneNumber) {
      this.model.phoneNumber = parseInt(this.formattedPhoneNumber.toString().replace(/\D/g, ''), 10);
    }

    if (!!this.model.company) {
      this.searchByCompany = true;
    }

    // call search API passing model of entered search data
    this.customerListSub = this.customerSearchService.retreiveCustomerList(this.model).subscribe(
      data => {
        this.orderConfigService.isCustomerSearch = true;
        this.setSearchResultsTabEnabled.emit(true);
        // if no search data sent back display error message
        if (data == null) {
          this.notificationService.hideLoader();
          this.setCustomerSearchErrorMessage.emit('Error searching for customer. Please try again.');
          this.nextAccordionTab.emit();
          this.setCustomerSearchResultList.emit(null);
        } else {

          // clear out previous results and destroy data table to be built with new data
          this.setCustomerSearchResultList.emit('');

          // if error isn't returned set data to customer list
          if (data.length > 0) {
            if (this.searchByCompany) {
              data.forEach(x => x['isContractCompany'] = true);
            }
            if (data[0].hasOwnProperty('errorCode') && data[0].errorCode !== '0') {
            } else if (data.length === 1 && this.displayMode === 'page') {
              this.setCustomerSearchResultList.emit(data);
              this.gotoCustomerDetails(data[0]);
            } else {
              this.setCustomerSearchResultList.emit(data);
            }
          }

          // set error desc from Lookup
          if (data.length > 0 && data[0].hasOwnProperty('errorCode')) {
            this.setCustomerSearchErrorMessage.emit(data[0].errorDesc);
            this.saveSearchCriteria();
          } else if (data.length === 0) {
            this.setCustomerSearchErrorMessage.emit('Customer search timed out or another error occurred.');
          } else {
            this.setCustomerSearchErrorMessage.emit(null);
          }

          this.notificationService.hideLoader();
          this.nextAccordionTab.emit();
        }
        this.searchByCompany = false;
      },
      err => {
        this.notificationService.hideLoader();
        this.searchByCompany = false;
        if (err.error instanceof Error) {
          const msg = 'Client-side error occurred.';
          throw new Error(msg);
        } else {
          const msg = 'Server-side error occurred.';
          throw new Error(msg);
        }
      }
    );

  }

  disableSearchFields(event, field, field2) {
    this.checkInputs();
    if (event == null || event.length === 0) {
      for (const key in this.disableField) {
        this.disableField[key] = false;
      }

      return;
    }

    if (field === 'retail' || field2 === 'retail') {
      this.disableField.business = true;
    }

    if (field === 'business' || field2 === 'business') {
      this.disableField.retail = true;
    }

    if (field === 'order' || field2 === 'order') {
      this.disableField.order = true;
    }
  }

  newCustomer() {
    this.orderConfigService.resetActiveJobFileInfo();
    this.orderConfigService.orderCustomerSelected = false;
    this.orderConfigService.clearCart();
    this.orderConfigService.hasWorkFrontJob = false;
    this.orderConfigService.resetActiveJob();
    this.saveSearchCriteria();
    this.router.navigate(['/product']);
  }

  gotoCustomerDetails(customer) {
    this.customerSearchService.changeSelectedCustomer(customer);
    this.nextAccordionTab.emit();
  }

  setDefaultFocus() {
    this.focusEl.nativeElement.focus();
    this.changeDetRef.detectChanges();
  }

  checkInputs() {
    this.input =
      (!!this.model.firstName && !!this.model.lastName) ||
      !!this.model.email ||
      !!this.formattedPhoneNumber ||
      !!this.model.rewardsNumber ||
      !!this.model.masterAccountNumber ||
      !!this.model.company ||
      !!this.model.orderNumber;
  }

  removeFormatting($event) {
    if ($event !== null) {
      this.formattedPhoneNumber = $event;
      const tempNum = parseInt(this.formattedPhoneNumber.toString().replace(/\D/g, ''), 10);
      this.model.phoneNumber = !!tempNum ? tempNum : null;
    }
  }

  saveSearchCriteria() {
    this.orderConfigService.clearCustomer();

    this.orderConfigService.orderCustomer.firstname = this.model.firstName;
    this.orderConfigService.orderCustomer.lastname = this.model.lastName;
    this.orderConfigService.orderCustomer.email = this.model.email;
    this.orderConfigService.orderCustomer.phoneNumber = this.model.phoneNumber;
    this.orderConfigService.orderCustomer.company = this.model.company;

    this.orderConfigService.orderCustomerPreferredContact.preferredFirstName = this.model.firstName;
    this.orderConfigService.orderCustomerPreferredContact.preferredLastName = this.model.lastName;
    this.orderConfigService.orderCustomerPreferredContact.preferredEmail = this.model.email;
    this.orderConfigService.orderCustomerPreferredContact.preferredPhoneNumber =
      !!this.model.phoneNumber ? this.model.phoneNumber.toString() : null;
    this.orderConfigService.orderCustomerPreferredContact.preferredCompany = this.model.company;
  }

  resetPhoneNumber() {
    this.model.phoneNumber = null;
  }

  resetForm() {
    this.custSearchForm.reset();
    this.resetPhoneNumber();
    this.disableSearchFields([], null, null);
  }

  /** Gets the value being pasted into the phone number field and removes any
   *  non-numeric characters and then proceeds to paste the new stripped value
   */
  onPaste(event) {
    let value = event.clipboardData.getData('Text');
    value = parseInt(value.toString().replace(/\D/g, ''), 10);
    if (isNaN(value)) {
      event.returnValue = false;
    }
  }
}
