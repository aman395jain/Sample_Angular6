import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { Router } from "@angular/router";

@Component({
  selector: 'app-print-tickets-wrapper',
  templateUrl: './print-tickets-wrapper.component.html',
  styleUrls: ['./print-tickets-wrapper.component.css']
})
export class PrintTicketsWrapperComponent implements OnInit {
  public src = '';

  constructor(
    public router: Router,
    public dialogRef: MatDialogRef<PrintTicketsWrapperComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.src = this.src + this.data.orderNumber;
  }

  ngOnInit() {
    if (this.data.isQuote) {
      this.src = environment.rootApiUrl + '/orders/print/' + this.data.orderNumber + '?country=USA&locale=en_US&isQuote=true';
    } else {
      this.src = environment.rootApiUrl + '/orders/print/' + this.data.orderNumber + '?country=USA&locale=en_US&isQuote=false';
    }
  }
}
