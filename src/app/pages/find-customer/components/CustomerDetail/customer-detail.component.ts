import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {OnDestroy} from '@angular/core';
import {MatPaginator, MatTableDataSource, MatSort, Sort} from '@angular/material';
import {
  Component, OnInit, ViewChild, ViewContainerRef,
  ElementRef, AfterViewInit, Output, EventEmitter
} from '@angular/core';
import {ReorderDialogComponent} from '@app/shared/components/ReorderDialog/reorder-dialog.component';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {WesLeadData} from '@app/models/wes-lead-data';
import {NewWesLeadComponent} from '@app/shared/components/NewWesLead/new-wes-lead.component';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {PrintTicketsWrapperComponent} from '@app/shared/components/print-tickets-wrapper/print-tickets-wrapper.component';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {CommonConstants, QuoteActions} from '@app/config/common-constants';
import {CustomerService} from '@app/pages/find-customer/services/customer/customer.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';
import {TableSortService} from '@app/shared/services/table-sort/table-sort.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';


@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})

export class CustomerDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  data: string;
  selectedCustomer: any;
  orderHistory: any;
  loading = false;
  color = 'primary';
  mode = 'indeterminate';
  orderFilter = null;
  displayedColumns: string[] = ['dateCreated', 'dueDate', 'orderNum', 'products', 'price', 'tickets'];
  dataSource = new MatTableDataSource<any>();
  errorMessage;
  showOrderHistoryTable = false;
  public QuoteActions = QuoteActions;
  wesPricingIssueEnabled = false;

  @ViewChild('tablePaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('printOrderPreview') iframe: ElementRef;
  @Output() nextAccordionTab = new EventEmitter<void>();
  @Output() prevAccordionTab = new EventEmitter<void>();

  constructor(
    public translate: TranslateService,
    public customerSearchService: CustomerSearchService,
    public customerService: CustomerService,
    public storeInfo: StoreinfoService,
    public orderService: OrderService,
    public dialog: MatDialog,
    public orderConfigService: OrderConfigService,
    public router: Router,
    vcr: ViewContainerRef,
    public tableSort: TableSortService,
    private notificationService: NotificationService,
    private logger: LoggerService,
    private sharedDataService: SharedDataService
  ) {
  }

  ngOnInit() {
    this.wesPricingIssueEnabled = this.storeInfo.isStoreFeature('wesPricingIssue');

    this.customerSearchService.currentSelectedCustomer.subscribe(
      selectedCustomer => {
        if (selectedCustomer !== null) {
          this.loading = true;
          this.selectedCustomer = selectedCustomer;

          this.logger.debug(this.selectedCustomer);

          this.orderConfigService.orderCustomerSelected = true;
          this.orderConfigService.setOrderCustomer(this.selectedCustomer);
          this.orderConfigService.saveCustomer = false;
          this.showOrderHistoryTable = false;
          let customerNumber = '';

          if (this.selectedCustomer.echcustomerid) {
            customerNumber = this.selectedCustomer.echcustomerid;
          }

          if (this.selectedCustomer.rewardsNumber) {
            customerNumber = this.selectedCustomer.rewardsNumber;
          }

          this.customerService.retrieveOrderHistoryByCustomerNumber(customerNumber, this.selectedCustomer.rewardsNumber).subscribe(
            orderHistory => {

              this.showOrderHistoryTable = true;
              this.orderHistory = null;
              if (orderHistory != null) {
                this.orderHistory = orderHistory.orderList;
                this.dataSource.data = orderHistory.orderList;
                if (orderHistory.yearlySpend) {
                  this.selectedCustomer.yearlySpend = orderHistory.yearlySpend;
                }
                if (orderHistory.industryType) {
                  this.selectedCustomer.industryType = orderHistory.industryType;
                }
              } else {
                this.dataSource = null;
                this.dataSource = new MatTableDataSource<any>();
                this.translate.get('COMMON.error').subscribe(
                  data => {
                    this.errorMessage = data.customerDetails;
                  }
                );
              }

              this.loading = false;
              this.filterByStatus('all');

              if (this.paginator !== undefined) {
                this.paginator.pageIndex = 0;
                this.dataSource.paginator = this.paginator;
              }

              this.sortData({active: 'dateCreated', direction: 'desc'});
            });

          this.sharedDataService.changeSelectedOrderSummary(null);
        } else {
          this.sharedDataService.changeSelectedOrderSummary(null);
        }
      },
      error => {
        this.logger.error(error);
      }
    );

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterSplit = filter.split('~');
      const filterType = filterSplit[0];
      const filterString = filterSplit[1];
      if (filterType === 'normalFilter') {
        let objectValues: string;
        for (const valStr of Object.values(data)) {
          objectValues += String(valStr).toLowerCase();
        }
        return objectValues.includes(filterString);
      } else if (filterType === 'orderFilter') {
        if (filterString === 'null') {
          return true;
        }

        // create array of statuses from filter string
        const filterArray = filterString.split(',');
        const statusArray: Array<Number> = [];
        filterArray.forEach(fil => {
          statusArray.push(parseInt(fil, 10));
        });
        return statusArray.includes(data.statusId);
      }
    };
  }

  ngAfterViewInit() {
    if (this.dataSource != null) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnDestroy() {
    this.clearData();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const data = this.dataSource.data.slice();
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'dateCreated':
          return this.tableSort.compare(Date.parse(a.createDate), Date.parse(b.createDate), isAsc);
        case 'dueDate':
          return this.tableSort.compare(Date.parse(a.dueDate), Date.parse(b.dueDate), isAsc);
        case 'orderNum':
          return this.tableSort.compare(a.orderNo, b.orderNo, isAsc);
        case 'products':
          return this.tableSort.compare(a.productUsEnglish, b.productUsEnglish, isAsc);
        case 'price': {
          const aPrice = a.totalOrderPrice - a.customerDiscount;
          const bPrice = b.totalOrderPrice - b.customerDiscount;
          return this.tableSort.compare(aPrice, bPrice, isAsc);
        }
        default:
          return 0;
      }
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = 'normalFilter~' + filterValue.trim().toLowerCase();
    if (this.paginator !== undefined) {
      this.paginator.pageIndex = 0;
      this.dataSource.paginator = this.paginator;
    }
  }

  filterByStatus(value) {
    if (value === 'active') {
      this.orderFilter = CommonConstants.ACTIVE_ORDER_IDS;
    }

    if (value === 'saved') {
      this.orderFilter = CommonConstants.SAVED_ORDER_IDS;
    }

    if (value === 'all') {
      this.orderFilter = null;
    }

    this.dataSource.filter = 'orderFilter~' + this.orderFilter;

    if (this.paginator !== undefined) {
      this.paginator.pageIndex = 0;
      this.dataSource.paginator = this.paginator;
    }
  }

  selectOrderForSummary(order) {
    this.notificationService.showLoader();
    this.orderService.retrieveCustomerOrderSummary(parseInt(order.orderNmb, 10)).subscribe(result => {
      this.sharedDataService.changeSelectedOrderSummary(result);
      this.notificationService.hideLoader();
      this.nextAccordionTab.emit();
    });
  }

  createOrder() {
    this.orderConfigService.resetActiveJob();
    this.orderConfigService.resetActiveJobFileInfo();
    this.orderConfigService.orderCustomerSelected = true;
    this.orderConfigService.setOrderCustomer(this.selectedCustomer);
    this.orderConfigService.saveCustomer = false;
    this.orderConfigService.clearCart();

    this.router.navigate(['/product']);
  }

  reorder(orderNumber, operation) {
    const dialogRef = this.dialog.open(ReorderDialogComponent, {
      width: '550px',
      maxHeight: '310px',
      minHeight: '220px',
      data: {orderNumber: orderNumber, operation: operation}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.data = result;
    });
  }

  print(orderNumber) {
    const dialogRef = this.dialog.open(PrintTicketsWrapperComponent, {
      height: '85%',
      width: '50%',
      data: {orderNumber: Number(orderNumber)}
    });
  }

  openNewWesLeadDialog(leadType): void {
    this.sharedDataService.newWesLeadInfo = new WesLeadData();
    this.sharedDataService.newWesLeadInfo.rewardsNumber = this.selectedCustomer.rewardsNumber;
    this.sharedDataService.newWesLeadInfo.company = this.selectedCustomer.company;
    this.sharedDataService.newWesLeadInfo.firstName = this.selectedCustomer.firstname;
    this.sharedDataService.newWesLeadInfo.lastName = this.selectedCustomer.lastname;
    this.sharedDataService.newWesLeadInfo.phoneNumber = this.selectedCustomer.phoneNumber;
    this.sharedDataService.newWesLeadInfo.email = this.selectedCustomer.email;
    this.sharedDataService.newWesLeadInfo.address1 = this.selectedCustomer.address1;
    this.sharedDataService.newWesLeadInfo.address2 = this.selectedCustomer.address2;
    this.sharedDataService.newWesLeadInfo.city = this.selectedCustomer.city;
    this.sharedDataService.newWesLeadInfo.state = this.selectedCustomer.state;
    this.sharedDataService.newWesLeadInfo.zipCode = this.selectedCustomer.zip;

    if (!this.wesPricingIssueEnabled) {
      leadType = null;
    }

    const dialogRef = this.dialog.open(NewWesLeadComponent, {
      width: '800px',
      height: 'auto',
      data: {name: this.data, leadType: leadType}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.status === 'cancel') {
        this.sharedDataService.newWesLeadInfo = new WesLeadData();
      }

      this.data = result;
    });
  }

  back() {
    this.clearData();
    this.prevAccordionTab.emit();
  }

  clearData() {
    this.data = null;
    this.customerSearchService.changeSelectedCustomer(null);
    this.showOrderHistoryTable = false;
  }

}
