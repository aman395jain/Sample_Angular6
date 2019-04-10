import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {QuoteParams} from '@app/models/QuoteParams';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';

@Component({
  selector: 'app-cancelled-quote',
  templateUrl: './cancelled-quote.component.html',
  styleUrls: ['./cancelled-quote.component.css']
})
export class CancelledQuoteComponent {

    toolTipPosition = 'below';
    quoteParams = new QuoteParams(this.data.quote.orderId, 43, null, this.storeInfoService.getStoreNumber(), 1, null, null, null, null);
    //TODO Need to populate user instead of hard coded '1' value

  constructor(
          public dialogRef: MatDialogRef<CancelledQuoteComponent>,
          private notificationService: NotificationService,
          private translate: TranslateService,
          public validators: ValidatorsService,
          public quotesService: QuotesService,
          public storeInfoService: StoreinfoService,
          @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
      this.dialogRef.close();
    }

  onSubmit() {
      this.notificationService.showLoader();

      // Call Quotes API to update Status
      this.quotesService.updateQuoteStatus(this.quoteParams).subscribe(
        data => {
            this.notificationService.hideLoader();
            this.dialogRef.close({status: 'success', msg: 'Quote status updated Successfully!'});
        },
        err => {
            this.notificationService.hideLoader();
            this.dialogRef.close({status: 'error', msg: 'Error updating Quote status. Please try again!'});
        }
      );
  }

}
