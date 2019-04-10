import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';

@Component({
  selector: 'app-customer-lookup-wrapper',
  templateUrl: './find-customer-wrapper.component.html',
  styleUrls: ['./find-customer-wrapper.component.css']
})

export class FindCustomerWrapperComponent implements OnInit, OnDestroy {
  readonly DISPLAY_MODE = 'page';
  private orderSub: Subscription;
  private customerSub: Subscription;
  selectedCustomer = null;
  selectedOrder = null;
  currentAccordionTab: number;
  customerSearchErrorMessage: string;
  customerSearchResultList: any;
  searchResultsTabEnabled: boolean;

  constructor(
    public translate: TranslateService,
    public validators: ValidatorsService,
    public customerSearchService: CustomerSearchService,
    public dialog: MatDialog,
    public storeInfo: StoreinfoService,
    public sharedDataService: SharedDataService
  ) {
  }

  ngOnInit() {
    this.currentAccordionTab = 0;
    this.customerSearchErrorMessage = null;
    this.customerSearchResultList = null;
    this.searchResultsTabEnabled = false;

    this.customerSub = this.customerSearchService.currentSelectedCustomer
      .subscribe(customer => {
        this.selectedCustomer = customer;
      });

    this.orderSub = this.sharedDataService.currentSelectedOrderSummary
      .subscribe(order => {
        this.selectedOrder = order;
      });
  }

  ngOnDestroy() {
    if (!!this.orderSub) {
      this.orderSub.unsubscribe();
    }

    if (!!this.customerSub) {
      this.customerSub.unsubscribe();
    }
  }

  nextAccordionTab() {
    this.currentAccordionTab++;
  }

  prevAccordionTab() {
    this.currentAccordionTab--;
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
