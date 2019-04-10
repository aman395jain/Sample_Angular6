import { Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {ReorderDialogComponent} from '@app/shared/components/ReorderDialog/reorder-dialog.component';
import {QuoteActions} from '@app/config/common-constants';
import {FilePreviewModalWrapperComponent} from '@app/shared/components/FileComponents';
import {PrintTicketsWrapperComponent} from '@app/shared/components/print-tickets-wrapper/print-tickets-wrapper.component';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';


@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})

export class OrderSummaryComponent implements OnInit, OnDestroy {
  private orderTotal: number;
  private orderDiscountTotal: number;
  private orderTotalAfterSavings: number;
  public QuoteActions = QuoteActions;
  orders: any;
  orderNmb: string;
  toolTipPosition = 'below';
  data: string;

  @Output() prevAccordionTab = new EventEmitter();

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private sharedDataService: SharedDataService
  ) {
  }

  ngOnInit() {
    this.sharedDataService.currentSelectedOrderSummary.subscribe(selectedOrder => {
      if (selectedOrder != null && selectedOrder.length > 0) {
        this.orderNmb = selectedOrder[0].orderNo;
        this.orders = selectedOrder;
        this.orderTotal = selectedOrder[0].orderTotal;
        this.orderDiscountTotal = 0;

        for (const job of selectedOrder) {
          this.orderDiscountTotal += job.customerDiscount;
        }
        this.orderTotalAfterSavings = this.orderTotal - this.orderDiscountTotal;
      } else {
        this.orders = null;
        this.orderDiscountTotal = 0;
        this.orderTotal = 0;
        this.orderTotalAfterSavings = 0;
      }
    });
  }

  ngOnDestroy() {
  }

  reorder(orderNumber, operation) {
    const dialogRef = this.dialog.open(ReorderDialogComponent, {
      width: '550px',
      maxHeight: '310px',
      minHeight: '220px',
      data: {orderNumber: orderNumber, operation: operation}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.data = result;

      if (!!this.data) {
        this.resetComponent();
      }
    });
  }

  print(orderNumber) {
    const dialogRef = this.dialog.open(PrintTicketsWrapperComponent, {
      height: '85%',
      width: '50%',
      data: {orderNumber: Number(orderNumber)}
    });
  }

  openFilePreview(jobId) {
    let filePreName = '';
    let filePreFullName = '';
    for (let i = 0; i < this.orders.length; i++) {
      if (this.orders[i].jobId === jobId) {
        filePreName = this.orders[i].fileName;
        filePreFullName = this.orders[i].fileFullName;
      }
    }

    const dialogRef = this.dialog.open(FilePreviewModalWrapperComponent, {
      width: '900px',
      height: 'auto',
      data: {fileFullName: filePreFullName, fileName: filePreName}
    });
  }

  trackByFn(index, item): void {
    return index;
  }

  submitBackButton() {
    this.resetComponent();
    this.prevAccordionTab.emit();
  }

  resetComponent() {
    this.sharedDataService.changeSelectedOrderSummary(null);
    this.orderTotal = null;
    this.orderDiscountTotal = null;
    this.orderTotalAfterSavings = null;
    this.orders = null;
    this.orderNmb = null;
  }

}
