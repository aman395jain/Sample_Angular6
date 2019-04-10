import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {QuoteParams} from '@app/models/QuoteParams';
import {StatusReason} from '@app/models/StatusReason';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {ReasonOption} from '@app/models/ReasonOption';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';

@Component({
  selector: 'app-lost-quote',
  templateUrl: './lost-quote.component.html',
  styleUrls: ['./lost-quote.component.css']
})
export class LostQuoteComponent {

    toolTipPosition = 'below';
    reasonOption = new ReasonOption(null, null);
    statusReason = new StatusReason(1, null, this.reasonOption);
    quoteParams = new QuoteParams(this.data.quote.orderId, 40, this.statusReason, this.storeInfoService.getStoreNumber(), 1, null, null, null, null);
    //TODO Need to populate user instead of hard coded '1' value

  constructor(
          public dialogRef: MatDialogRef<LostQuoteComponent>,
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

      // Add reasonOption id's based off of reasonOption descriptions
      switch(this.reasonOption.description) {
          case 'Price' : { this.reasonOption.id = 1; break; }
          case 'Complexity' : { this.reasonOption.id = 2; break; }
          case 'Production Turn Time' : { this.reasonOption.id = 3; break; }
          case 'Store Turn Time' : { this.reasonOption.id = 4; break; }
          case 'No Response from Customer' : {this.reasonOption.id = 5; break; }
      }

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
