import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {QuoteSearch} from '@app/models/QuoteSearch';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {PrintTicketsWrapperComponent} from '@app/shared/components/print-tickets-wrapper/print-tickets-wrapper.component';

export interface QuoteConfirmationDialogData {
  quoteNumber: string;
}

@Component({
  selector: 'app-quote-details-dialog',
  templateUrl: './quote-details-dialog.component.html',
  styleUrls: ['./quote-details-dialog.component.css']
})

export class QuoteDetailsDialogComponent implements OnInit {
  quoteNumber: string;
  private errorMsgs: any;

  constructor(
    public dialogRef: MatDialogRef<QuoteDetailsDialogComponent>,
    private storeInfoService: StoreinfoService,
    public dialog: MatDialog,
    public quotesService: QuotesService,
    public translate: TranslateService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: QuoteConfirmationDialogData
  ) { }

  ngOnInit() {
    this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  continue() {
    this.dialogRef.close();

    this.notificationService.showLoader();
    this.quotesService.retrieveQuotesList(this.storeInfoService.getStoreNumber(), new QuoteSearch(null, null, null, null)).subscribe(
      data => {
        this.quotesService.quoteList.next(data);
        this.notificationService.hideLoader();
      },
      error => {
        this.notificationService.hideLoader();
        throw new Error(this.errorMsgs.quoteSearch);
      }
    );

    this.quotesService.setAccordianTab(this.quotesService.defaultTab);
  }

  printQuote() {
    this.dialogRef.close();
    this.dialog.open(PrintTicketsWrapperComponent, {
      height: '85%',
      width: '50%',
      data: { orderNumber: Number(this.data.quoteNumber), isQuote: true }
    });
  }
}
