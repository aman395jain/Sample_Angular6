import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonConstants } from '../../../../../config/common-constants';
import { MatDatepicker } from '@angular/material/datepicker';
import { LocalTime} from 'js-joda';

@Component({
  selector: 'app-due-date',
  templateUrl: './due-date.component.html',
  styleUrls: ['./due-date.component.css']
})
export class DueDateComponent {
  public commonConstants = CommonConstants;
  date: string;
  minDate = new Date();
  selectedTime: string;
  datetime: string;
  timeInterval = 15; // minutes interval
  times = []; // time array
  startTime: any = 480; // start time
  ap = ['AM', 'PM']; // AM-PM


  constructor(
          public dialogRef: MatDialogRef<DueDateComponent>,
  ) {
  }

  openCalendar(picker: MatDatepicker<Date>) {
      picker.open();
  }

  onNoClick(): void {
      this.dialogRef.close();
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

  onSubmit() {
    // Trim to just capture the date yyyy-MM-dd
    this.date = JSON.stringify(this.date).substring(1, 11);
    // Translate to be in standard turntime format
    this.date = this.date.substring(5, 7) + '/' + this.date.substring(8, 10) + '/' + this.date.substring(0, 4);
    this.datetime = this.date + ',' + this.selectedTime;
    this.dialogRef.close(this.datetime);

  }
}
