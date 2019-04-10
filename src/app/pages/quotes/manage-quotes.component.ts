import {Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {MatDialog, Sort} from '@angular/material';
import {ManageQuotesV} from '@app/models/ManageQuotesV';
import {MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {QuoteSearch} from '@app/models/QuoteSearch';
import {TranslateService} from '@ngx-translate/core';
import {CommonConstants} from '@app/config/common-constants';
import {User} from '@app/models/User';
import {Router} from '@angular/router';
import {OrderConfirmationDialogComponent} from '@app/shared/components/OrderConfirmationDialog/OrderConfirmationDialog.component';
import {OrderConfiratmationData} from '@app/models/OrderConfirmationData';
import {SubmitType} from '@app/config/common-constants';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {LostQuoteComponent} from '@app/pages/quotes/components/lost-quote/lost-quote.component';
import {WonQuoteComponent} from '@app/pages/quotes/components/won-quote/won-quote.component';
import {CancelledQuoteComponent} from '@app/pages/quotes/components/cancelled-quote/cancelled-quote.component';
import {TableSortService} from '@app/shared/services/table-sort/table-sort.service';


@Component({
  selector: 'app-manage-quotes',
  templateUrl: './manage-quotes.component.html',
  styleUrls: ['./manage-quotes.component.css']
})

export class ManageQuotesComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly qdvuDisplayCols: string[] = ['customerName', 'membership', 'company', 'products',
   'quoteNo', 'quoteTotal', 'expirationDate', 'status', 'id'];
  readonly normalDisplayCols: string[] = ['customerName', 'membership', 'company', 'products',
   'quoteNo', 'quoteTotal', 'expirationDate', 'status'];
  dataSource = new MatTableDataSource<ManageQuotesV>();
  public quotes: ManageQuotesV[];
  orderFilter = null;
  public uiMessages = [{value: 'Pending'}, {value: 'Lost'}, {value: 'Won'}, {value: 'Cancelled'}, {value: 'At Quote Desk'}, {value: 'Expired'}];
  displayedColumns: string[];
  data: string;
  private quotesByStoreSub;
  errorMsgs: any;
  isQuoteDeskViewUser = false;

  @ViewChild('tablePaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public quotesService: QuotesService,
    private storeInfoService: StoreinfoService,
    public dialog: MatDialog,
    public translate: TranslateService,
    public tableSort: TableSortService,
    private notificationService: NotificationService,
    private userService: UserInfoService,
    public orderConfigService: OrderConfigService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.isQuoteDeskViewUser = this.userService.hasRole(User.USER_ROLE_QUOTEDESK);

    if (this.isQuoteDeskViewUser) {
      this.displayedColumns = this.qdvuDisplayCols;
    } else {
      this.displayedColumns = this.normalDisplayCols;
    }

    this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });

    if (this.quotesService.enteredPage) {
      this.quotesService.setAccordianTab(this.quotesService.defaultTab);
      this.quotesService.enteredPage = false;

      // Setting to -1 will retrieve quotes for all stores.
      let storeNumber = -1;

      if (!this.isQuoteDeskViewUser) {
        storeNumber = this.storeInfoService.getStoreNumber();
      }

      const statusOptionsChosen: string[] = ['AtQuoteDesk', 'Pending'];

      this.quotesService.retrieveQuotesList(storeNumber, new QuoteSearch(null, null, null, statusOptionsChosen)).subscribe(
        ( data ) => {
          this.dataSource.data = data;
          this.quotesService.quoteList.next(data);
          this.notificationService.hideLoader();
        },
        ( error ) => {
          this.notificationService.hideLoader();
          throw new Error(this.errorMsgs.quoteSearch);
        }
      );
    }

    this.quotesService.quoteList.subscribe(
      data => {
        if (data != null && data !== undefined) {
          this.quotes = data;
          this.dataSource.data = data;
          this.paginator.pageIndex = 0;
          this.dataSource.paginator = this.paginator;
        }
        this.notificationService.hideLoader();
      }
    );
  }

  ngAfterViewInit() {
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

        case 'customerName': return this.tableSort.compare(
          this.nvl(a.lastName).toLowerCase() + this.nvl(a.firstName).toLowerCase(), this.nvl(b.lastName).toLowerCase() +
            this.nvl(b.firstName).toLowerCase(), isAsc);
        case 'company': return this.tableSort.compare(this.nvl(a.companyName).toLowerCase(), this.nvl(b.companyName).toLowerCase(), isAsc);
        case 'products': return this.tableSort.compare(this.nvl(a.products).toLowerCase(), this.nvl(b.products).toLowerCase(), isAsc);
        case 'quoteNo': return this.tableSort.compare(parseInt(a.orderNumber, 10), parseInt(b.orderNumber, 10), isAsc);
        case 'quoteTotal': return this.tableSort.compare(a.quotePrice, b.quotePrice, isAsc);
        case 'expirationDate': return this.tableSort.compare(Date.parse(a.expirationDate), Date.parse(b.expirationDate), isAsc);
        default: return 0;
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
    this.quotes = null;
    this.dataSource.data = null;
    this.quotesService.prevAccordianTab();
  }

  setQuoteDetails(quoteNumber: string) {
    this.quotesService.setSelectedQuote(quoteNumber);
    this.quotesService.nextAccordianTab();
  }

  filterByStatus(value): void {

    if (value === 'active') {
      this.orderFilter = CommonConstants.ACTIVE_ORDER_IDS;
    }

    if (value === 'saved') {
      this.orderFilter = CommonConstants.SAVED_ORDER_IDS;
    }

    if (value === 'all') {
      this.orderFilter = null;
    }
  }

  onChangeStatus(selected, prev, quote, selectElt) {
    this.data = quote;

    quote.statusMessage = 'Pending';
    selectElt.value = 'Pending';

    if (selected === 'Lost') {
      // Lost Quote Status functionality
      const dialogRef = this.dialog.open(LostQuoteComponent, {
        width: '500px',
        height: '500px',
        data: {quote: this.data}
      });
      dialogRef.afterClosed().subscribe(result => {
        this.data = result;
        if (result) {
          if (result.status !== 'error') {
            quote.statusMessage = selected;
            selectElt.value = selected;
          }
        }
      });
    }

    if (selected === 'Won') {
      // Won Quote Status functionality
      const dialogRef = this.dialog.open(WonQuoteComponent, {
        width: '650px',
        height: '250px',
        data: {quote: this.data}
      });
      dialogRef.afterClosed().subscribe(result => {
        this.data = result;
        if (result) {
          this.notificationService.hideLoader();

          if (result.status !== 'error') {
            quote.statusMessage = selected;
            selectElt.value = selected;
          }

          const orderHolder = {};
          orderHolder['sbOrderNumber'] = quote.orderNumber;

          const orderConfirmationData = new OrderConfiratmationData();
          orderConfirmationData.orderNumber = quote.orderNumber;
          orderConfirmationData.orderType = SubmitType.Order;
          orderConfirmationData.submitOrderToFlightDeck = true;
          orderConfirmationData.success = true;
          const orderConfirmationDialogRef = this.dialog.open(OrderConfirmationDialogComponent, {
            width: '350px',
            data: orderConfirmationData,
            disableClose: true
          });

          orderConfirmationDialogRef.afterClosed().subscribe(closeResult => {
            if (closeResult) {
              this.orderConfigService.deleteOrder();
              this.router.navigate(['/']);
            }
          });
        }
      });
    }

    if (selected === 'Cancelled') {
      // Cancelled Quote Status functionality
      const dialogRef = this.dialog.open(CancelledQuoteComponent, {
        width: '500px',
        height: '210px',
        data: {quote: this.data}
      });
      dialogRef.afterClosed().subscribe(result => {
        this.data = result;
        if (result) {
          if (result.status !== 'error') {
            quote.statusMessage = selected;
            selectElt.value = selected;
          }
        }
      });
    }
  }

  ngOnDestroy() {
    this.quotes = null;
    this.quotesService.enteredPage = true;

    if (this.quotesByStoreSub) {
      this.quotesByStoreSub.unsubscribe();
    }
  }

  isStatusInvalid(quote, select) {
    return (quote.statusMessage !== 'Pending') && select.value !== 'Pending';
  }
}
