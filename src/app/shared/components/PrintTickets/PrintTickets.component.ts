import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeFormatter, LocalDate } from 'js-joda/dist/js-joda';
import { ActivatedRoute, Route } from '@angular/router';
import { Subscription } from 'rxjs';
import {CommonConstants} from '@app/config/common-constants';
import {OrderTicket} from '@app/models/OrderTicket';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {OrderService} from '@app/shared/services/order/order.service';

@Component({
  selector: 'app-PrintTickets',
  templateUrl: './PrintTickets.component.html',
  styleUrls: ['./PrintTickets.component.css']
})
export class PrintTicketsComponent implements OnInit {

      public commonConstants = CommonConstants;
      public formattedDateTime: string;
      public localDate: LocalDate;
      public orderData = new OrderTicket('', '', '', '', '', '', '', '', '', '', null, '', '', '',
              '', 0, '', null, '', false, '', '', false, '', false, false);
      private routeSub: Subscription;

  constructor(
          public dialogRef: MatDialogRef<PrintTicketsComponent>,
          public translate: TranslateService,
          public validators: ValidatorsService,
          public orderService: OrderService,
          public orderConfigService: OrderConfigService,
          public storeInfo: StoreinfoService,
          @Inject(MAT_DIALOG_DATA) public data: any,
          vcr: ViewContainerRef,
          public dialog: MatDialog,
          private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.orderService.printOrder(Number(params['orderNumber'])).subscribe(
        data => {
          let print: any;
          print = data;

      this.orderData = new OrderTicket(print.customerLastName, print.customerFirstName, print.dueDate, Number(params['orderNumber']),
              print.orderCreationDate, print.customerPreferredContactNo, print.preferredEmail, print.customerRewardNumber,
              print.customerCompany, print.jobBeanList, print.jobBeanList[0].dueDate , print.unitPrice, print.totalQuantity,
              print.totalOrderPrice, print.discountPrice, print.totalDiscountOnOrder, print.totalOrderDiscountedPrice,
              print.couponsForPymtTickets, print.preferredContactMode, print.printBarcodeOff, print.bdpTier,
              print.customerPhoneNumber, print.contractCustomer, print.formattedContractTotal, print.isDiscounted,
              print.bdpPriceCallSuccess);
      this.formatDateTime();
        });
    });
  }

  onNoClick(): void {
      this.dialogRef.close();
  }

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  formatDateTime() {
      if (this.orderData.jobDueDate != null) {
          let ampm = 'AM';
          const year = this.orderData.jobDueDate.year.toString();
          let month = this.orderData.jobDueDate.monthOfYear.toString();
          if (month.length === 1) {
              month = '0' + month;
          }
          let day: string = this.orderData.jobDueDate.dayOfMonth.toString();
          if (day.length === 1) {
              day = '0' + day;
          }
          let hour: string = this.orderData.jobDueDate.hourOfDay.toString();
          const numHour = Number(hour);
          if (numHour > 11) {
              if (numHour !== 12) {
                  hour = String(numHour - 12);
              }
              ampm = 'PM';
          }
          let minute = this.orderData.jobDueDate.minuteOfHour.toString();
          if (minute.length === 1) {
              minute = '0' + minute;
          }

          this.localDate = LocalDate.parse(year + '-' + month + '-' + day);
          let stringDayOfWeek = this.localDate.dayOfWeek().toString().toLowerCase();
          stringDayOfWeek = stringDayOfWeek.substring(0, 1).toUpperCase() + stringDayOfWeek.substring(1);
          this.formattedDateTime = stringDayOfWeek + ', ';
          this.formattedDateTime = this.formattedDateTime.concat(this.localDate.format(DateTimeFormatter.ofPattern('MM/dd/yy')));
          this.formattedDateTime = this.formattedDateTime.concat(', ' + hour + ':' + minute + ' ' + ampm);

          return this.formattedDateTime;
      }
  }
}