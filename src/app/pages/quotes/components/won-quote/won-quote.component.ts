import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { LocalDateTime } from 'js-joda/dist/js-joda';
import {LocalTime} from 'js-joda';
import {QuoteParams} from '@app/models/QuoteParams';
import {CommonConstants} from '@app/config/common-constants';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';

@Component({
  selector: 'app-won-quote',
  templateUrl: './won-quote.component.html',
  styleUrls: ['./won-quote.component.css']
})
export class WonQuoteComponent {
  public commonConstants = CommonConstants;
  date: string;
  minDate = new Date();
  datetime: string;
  ldt: LocalDateTime;
  toolTipPosition = 'below';
  // TODO Need to populate user instead of hard coded '1' value
  quoteParams = new QuoteParams(this.data.quote.orderId, 41, null, this.storeInfoService.getStoreNumber(), 1, true, 'US', null, 'en_US');
  validDateTime = {'invalidHoursError': '', 'inPastError': ''};
  dateTimeErrorMsg: string;
  timeInterval = 15; // minutes interval
  times = []; // time array
  startTime: any = 480; // start time
  ap = ['AM', 'PM']; // AM-PM
  selectedTime: string;

  constructor(
          public dialogRef: MatDialogRef<WonQuoteComponent>,
          private notificationService: NotificationService,
          private translate: TranslateService,
          public validators: ValidatorsService,
          public quotesService: QuotesService,
          public storeInfoService: StoreinfoService,
          @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      translate.get('QUOTES').subscribe(
          (result) => {
              this.validDateTime.invalidHoursError = data.pleaseEnterValidTime;
              this.validDateTime.inPastError = data.pleaseEnterValidTimeNotPast;
          }
      );
  }

  openCalendar(picker: MatDatepicker<Date>) {
      picker.open();
  }

  onNoClick(): void {
      this.dialogRef.close();
    }

  onSubmit() {
      this.notificationService.showLoader();

        // Trim to just capture the date yyyy-MM-dd
        const dateT = JSON.stringify(this.date).substring(1, 11);

        if (this.selectedTime.charAt(1) === ':') {
          this.selectedTime = '0' + this.selectedTime;
        }

        this.datetime = dateT + 'T' + this.selectedTime.slice(0, -2);
        this.ldt = LocalDateTime.parse(this.datetime.trim());

        if (this.selectedTime.slice(-2) === 'PM' && this.selectedTime.substring(0, 2) !== '12') {
            this.ldt = this.ldt.plusHours(12);
        }
        this.quoteParams.dueDate = this.ldt;

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

  populateTimes() {
    this.times = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (this.date.toString() === now.toString()) {
      const currentTime = LocalTime.now();
      this.startTime = currentTime.hour() * 15 * 4;
      if (currentTime.minute() > 0) {
        this.startTime += 15;
      }
      if (currentTime.minute() > 15) {
        this.startTime += 15;
      }
      if (currentTime.minute() > 30) {
        this.startTime += 15;
      }
      if (currentTime.minute() > 45) {
        this.startTime += 15;
      }

    } else {
      this.startTime = 480;
    }

    // loop to increment the time and push results in array
    for (let i = 0; this.startTime < 20 * 60; i++) {
      const hh = Math.floor(this.startTime / 60); // getting hours of day in 0-24 format
      const mm = (this.startTime % 60); // getting minutes of the hour in 0-55 format
      // pushing data in array in [00:00 - 12:00 AM/PM format]
      this.times[ i ] = ('' + (( hh === 12) ? 12 : hh % 12)).slice(-2) + ':' + ('0' + mm).slice(-2) + ' ' + this.ap[ Math.floor(hh / 12) ];
      this.startTime = this.startTime + this.timeInterval;
    }
    this.selectedTime =  this.times[ 0 ];
  }

}
