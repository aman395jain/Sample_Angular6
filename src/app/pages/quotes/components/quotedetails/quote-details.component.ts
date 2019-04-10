import {Component, OnDestroy, OnInit} from '@angular/core';
import {QuoteDetailsDialogComponent} from './quote-details-dialog/quote-details-dialog.component';
import {MatDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {QuoteDetailJ} from '@app/models/QuoteDetailJ';
import {QuoteSummaryV} from '@app/models/QuoteSummaryV';
import {QuoteJob} from '@app/models/QuoteJob';
import {User} from '@app/models/User';
import {ReorderDialogComponent} from '@app/shared/components/ReorderDialog/reorder-dialog.component';
import {QuoteActions} from '@app/config/common-constants';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {PrintTicketsWrapperComponent} from '@app/shared/components/print-tickets-wrapper/print-tickets-wrapper.component';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';


@Component({
  selector: 'app-quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.css']
})

export class QuoteDetailsComponent implements OnInit, OnDestroy {
  public quoteDetails: QuoteDetailJ;
  public quoteSummary: QuoteSummaryV = new QuoteSummaryV();
  public quoteJobs: QuoteJob[];
  private selectedQuoteNo: any;
  public canEditPrice = false;
  private currentQuoteSub: any;
  private quoteDetailsSub: any;
  public subtotal = 0;
  public total = 0;
  public skuTotals: Map<string, number> = new Map();
  public priceChanged: boolean;
  private errorMsgs: any;
  private translateSub: any;
  public displayedColumns: string[] = ['sku', 'selectedOption', 'quantity', 'optionPrice', 'price'];
  public printOrderSrc = '';
  public printData: any;
  public keycodes = [8, 9, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 190];
  QuoteActions = QuoteActions;

  constructor(
    private quoteService: QuotesService,
    private userInfoService: UserInfoService,
    private notificationService: NotificationService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.translateSub = this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });
    this.priceChanged = false;
    this.canEditPrice = this.userInfoService.hasRole(User.USER_ROLE_EDITQUOTE);
    this.notificationService.showLoader();
    this.currentQuoteSub = this.quoteService.currentSelectedQuote.subscribe(
      data => {
        if (data !== '') {
          this.selectedQuoteNo = data;

          this.quoteDetailsSub = this.quoteService.retrieveQuoteDetailByQuoteNumber(this.selectedQuoteNo).subscribe(
            details => {
              this.priceChanged = false;
              this.quoteDetails = details;
              this.quoteSummary = this.quoteDetails.quoteSummary;
              this.quoteJobs = this.quoteDetails.quoteJobs;

              // Format all saved data to display with precision of 5 decimal places
              for (const key in this.quoteJobs) {
                  this.quoteJobs[key].attributeOptions.forEach((sku, index) => {
                      sku.unitPrice = (Math.round(sku.unitPrice * 10000) / 10000).toFixed(4);
                  });
              }

              if (!this.quoteSummary.totalCustomerDiscount) {
                this.quoteSummary.totalCustomerDiscount = 0;
              }

              this.calculateTotals();
            },
            err => {
              this.notificationService.hideLoader();
              throw new CustomSBError(err, this.translate.instant('QUOTE.loadQuoteFailed'), false);
            }
          );
        }
      },
      err => {
        this.notificationService.hideLoader();
        throw new CustomSBError(err, this.translate.instant('QUOTE.findQuoteFailed'), false);
      }
    );
  }

  updatePricing(jobIndex: number, attrIndex: number) {
    let job = this.quoteJobs[jobIndex];
    let attrOption = job.attributeOptions[attrIndex];

    if (attrOption !== null && attrOption !== undefined) {
      attrOption.unitPrice = (Math.round(attrOption.unitPrice * 10000) / 10000).toFixed(4);
    }

    attrOption.extendedPrice = attrOption.quantity * attrOption.unitPrice;

    let skuTotalPrice = 0;
    job.attributeOptions.forEach((option) => {
      skuTotalPrice += option.extendedPrice;
    });

    job.singleSkuPrice = skuTotalPrice / job.quantity;

    this.quoteSummary.totalCustomerDiscount = 0;
    this.priceChanged = true;

    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = 0;

    for (const key in this.quoteJobs) {
      let skuTotalPrice = 0;

      this.quoteJobs[key].attributeOptions.forEach((option) => {
        skuTotalPrice += option.extendedPrice;
      });

      this.skuTotals[key] = this.quoteJobs[key].singleSkuPrice * this.quoteJobs[key].quantity;
      this.subtotal += this.skuTotals[key];
    }

    this.total = this.subtotal - this.quoteSummary.totalCustomerDiscount;
  }

  saveQuote() {
    const updateSub = this.quoteService.updateQuoteDetails(this.selectedQuoteNo, this.quoteJobs)
      .subscribe(result => {
          const retVal = result;
        },
        error => {
          throw new CustomSBError(this.errorMsgs.updateQuoteErrorMsg, error.error, false);
        }
      );
    this.priceChanged = false;

    const dialogRef = this.dialog.open(QuoteDetailsDialogComponent, {
      data: {quoteNumber: this.selectedQuoteNo}
    });
  }

  cancel() {
    this.quoteService.setAccordianTab(this.quoteService.defaultTab);
  }

  ngOnDestroy() {
    if (this.currentQuoteSub) {
      this.currentQuoteSub.unsubscribe();
    }

    if (this.quoteDetailsSub) {
      this.quoteDetailsSub.unsubscribe();
    }

    if (this.translateSub) {
      this.translateSub.unsubscribe();
    }
  }

  printQuote(orderNumber) {
    this.dialog.open(PrintTicketsWrapperComponent, {
      height: '85%',
      width: '50%',
      data: { orderNumber: Number(orderNumber), isQuote: true }
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  quoteAsArray(quote) {
    return Array.of(quote);
  }

  reorderQuote(operation: QuoteActions) {
    const dialogRef = this.dialog.open(ReorderDialogComponent, {
        width: '550px',
        maxHeight: '310px',
        minHeight: '220px',
        data: { orderNumber: this.quoteSummary.orderNo, operation: operation}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  restrictInput(event) {
      if (this.keycodes.includes(event.keyCode) && !event.shiftKey) {
          return(true);
      } else {
          return(false);
      }
  }
}
