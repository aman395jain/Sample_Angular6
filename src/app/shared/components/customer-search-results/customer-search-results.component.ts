import {
  Component, OnInit, ViewChild, Input,
  Output, EventEmitter, AfterViewInit,
  ViewContainerRef, OnDestroy
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatTableDataSource, MatSort, MatPaginator, Sort} from '@angular/material';
import {Router} from '@angular/router';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';
import {TableSortService} from '@app/shared/services/table-sort/table-sort.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';


@Component({
  selector: 'app-customer-search-results',
  templateUrl: './customer-search-results.component.html',
  styleUrls: ['./customer-search-results.component.css']
})

export class CustomerSearchResultsComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource: MatTableDataSource<any> = null;
  displayedColumns = ['customerName', 'membershipLevel', 'phoneNumber', 'rewardsNumber', 'email', 'cityState', 'company'];

  @Input('displayMode') displayMode;
  @Input('customerSearchErrorMessage') customerSearchErrorMessage;
  @ViewChild('tablePaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() prevAccordionTab = new EventEmitter<void>();
  @Output() nextAccordionTab = new EventEmitter<void>();
  @Output() closeDialogRef = new EventEmitter<void>();
  @Output() setCustomerSearchResultList = new EventEmitter();
  @Output() setSearchResultsTabEnabled = new EventEmitter();

  constructor(
    public translate: TranslateService,
    public validators: ValidatorsService,
    public customerSearchService: CustomerSearchService,
    vcr: ViewContainerRef,
    public dialog: MatDialog,
    private router: Router,
    public storeInfo: StoreinfoService,
    public tableSort: TableSortService,
    public orderConfigService: OrderConfigService,
    private sharedDataService: SharedDataService
  ) {
  }

  @Input()
  set customerSearchResultList(customerSearchResultList: any) {
    if (!!customerSearchResultList) {
      this.dataSource = new MatTableDataSource<any>();
      this.dataSource.data = customerSearchResultList;
      this.paginator.firstPage();
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.dataSource.paginator.pageIndex = 0;
  }

  ngAfterViewInit() {
    if (this.dataSource != null) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnDestroy() {
    this.resetData();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const data = this.dataSource.data.slice();
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'customerName':
          return this.tableSort.compare(
            a.lastname.toLowerCase() + a.firstname.toLowerCase(), b.lastname.toLowerCase() + b.firstname.toLowerCase(), isAsc);
        case 'phoneNumber': {
          if (this.storeInfo.isStoreFeature('maskCustomerInfo')) {
            return this.tableSort.compare(a.maskedPhone, b.maskedPhone, isAsc);
          } else {
            return this.tableSort.compare(a.phoneNumber, b.phoneNumber, isAsc);
          }
        }
        case 'rewardsNumber':
          return this.tableSort.compare(this.nvl(a.rewardsNumber), this.nvl(b.rewardsNumber), isAsc);
        case 'email': {
          if (this.storeInfo.isStoreFeature('maskCustomerInfo')) {
            return this.tableSort.compare(a.maskedEmail.toLowerCase(), b.maskedEmail.toLowerCase(), isAsc);
          } else {
            return this.tableSort.compare(a.email.toLowerCase(), b.email.toLowerCase(), isAsc);
          }
        }
        case 'cityState':
          return this.tableSort.compare(a.city.toLowerCase() + a.state.toLowerCase(), b.city.toLowerCase() + b.state.toLowerCase(), isAsc);
        case 'company':
          return this.tableSort.compare(this.nvl(a.company), this.nvl(b.company), isAsc);
        default:
          return 0;
      }
    });
  }

  nvl(value) {
    if (value == null) {
      return '';
    }
    return value;
  }

  newSearch() {
    this.prevAccordionTab.emit();
    this.resetData();
  }

  close() {
    this.closeDialogRef.emit();
  }

  rowClicked(row) {
    this.customerSearchService.changeSelectedCustomer(row);

    if (this.displayMode === 'page') {
      this.nextAccordionTab.emit();
    } else {
      this.customerSearchService.orderCustomerChanged.next(true);
    }
  }

  openFileSelectionDialog() {
    this.orderConfigService.resetActiveJobFileInfo();
    this.orderConfigService.clearCart();
    this.orderConfigService.orderCustomerSelected = false;

    this.router.navigate(['/product']);
  }

  resetData() {
    this.dataSource = null;
    this.setCustomerSearchResultList.emit(null);
    this.sharedDataService.changeSelectedOrderSummary(null);
    this.customerSearchService.changeSelectedCustomer(null);
    this.setSearchResultsTabEnabled.emit(false);
  }
}
