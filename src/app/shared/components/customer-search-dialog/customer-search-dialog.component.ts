import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';

@Component({
  selector: 'app-customer-search-dialog',
  templateUrl: './customer-search-dialog.component.html',
  styleUrls: ['./customer-search-dialog.component.css']
})

export class CustomerSearchDialogComponent implements OnInit, OnDestroy {
  readonly DISPLAY_MODE = 'modal';
  currentAccordionTab: number;
  customerSearchErrorMessage: string;
  customerSearchResultList: any;
  searchResultsTabEnabled: boolean;

  constructor(
    public customerSearchService: CustomerSearchService,
    public translate: TranslateService,
    public orderConfigService: OrderConfigService,
    public dialogRef: MatDialogRef<CustomerSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.customerSearchService.changeSelectedCustomer(null);
  }

  ngOnInit() {
    this.currentAccordionTab = 0;
    this.customerSearchErrorMessage = null;
    this.searchResultsTabEnabled = false;

    this.customerSearchService.currentSelectedCustomer.subscribe(
      customer => {
        if (customer != null) {
          this.setCustomer(customer);
        }
      }
    );
  }

  ngOnDestroy() {
  }

  setCustomer(customer) {
    this.orderConfigService.orderCustomerSelected = true;
    this.orderConfigService.setOrderCustomer(customer);
    this.orderConfigService.saveCustomer = false;
    this.orderConfigService.isNewRewardsEnroll = false;

    // close dialog
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  nextAccordionTab() {
    this.currentAccordionTab++;
  }

  prevAccordionTab() {
    this.currentAccordionTab--;
  }

  closeDialogRef() {
    this.dialogRef.close();
  }

  setAccordionTab(tabNumber: number) {
    this.currentAccordionTab = tabNumber;
  }
  setCustomerSearchErrorMessage(message: string) {
    this.customerSearchErrorMessage = message;
  }

  setCustomerSearchResultList(data) {
    this.customerSearchResultList = data;
  }

  setSearchResultsTabEnabled(enabled: boolean) {
    this.searchResultsTabEnabled = enabled;
  }
}
