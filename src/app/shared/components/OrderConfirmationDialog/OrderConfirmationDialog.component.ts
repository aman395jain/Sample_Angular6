import {Component, Inject, OnInit, OnDestroy, Input} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatProgressBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {OrderSubmission} from '@app/models/OrderSubmission/OrderSubmission';
import {OrderConfiratmationData} from '@app/models/OrderConfirmationData';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {PrintTicketsWrapperComponent} from '@app/shared/components/print-tickets-wrapper/print-tickets-wrapper.component';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {SubmitType, CommonConstants} from '@app/config/common-constants';
import {Subscription} from 'rxjs';
import { OrderSubmissionJob } from '@app/models/OrderSubmission/OrderSubmissionJob';

@Component({
  selector: 'app-orderconfirmation-dialog',
  templateUrl: './OrderConfirmationDialog.component.html',
  styleUrls: ['./OrderConfirmationDialog.component.css']
})
export class OrderConfirmationDialogComponent implements OnInit {
  @Input() mode: 'indeterminate';
  public success = true; // indicates a successful order submission
  public orderNumber: number;
  public flightDeckStatusMessage: any = null;
  public orderType: string;
  public printClicked = false;
  public collectPaymentMessageEnabled = false;
  private titleSub: Subscription;
  public confirmationTitle;
  private fdSuccessSub: Subscription;
  public fdSuccess;
  private fdSubmitFinishedSub: Subscription;
  public fdSubmitFinished;
  private showProgressBarSub: Subscription;
  public showProgressBar;
  public workFrontSuccess = false;
  public workFrontSubmitted = false;
  public workFrontSuccessMsg: string;
  public workFrontFailedMsg: string;
  private allowed_workfront_category: Array<any> = CommonConstants.ALLOWED_WORKFRONT_CATEGORY;

  constructor(
    public translate: TranslateService,
    public dialogRef: MatDialogRef<OrderConfirmationDialogComponent>,
    public dialog: MatDialog,
    public orderService: OrderService,
    public orderConfigService: OrderConfigService,
    public storeInfoService: StoreinfoService,
    public fileUploadService: FileUploadService,
    public sharedDataService: SharedDataService,
    private LOGGER: LoggerService,
    @Inject(MAT_DIALOG_DATA) public data: OrderConfiratmationData
  ) { }

  ngOnInit(): void {
    this.resetSharedValues();
  
    this.titleSub = this.sharedDataService.confirmationTitle
      .subscribe(title => {
        this.confirmationTitle = title;
    });

    this.fdSuccessSub = this.sharedDataService.fdSuccess
      .subscribe(success => {
        this.fdSuccess = success;
    });

    this.fdSubmitFinishedSub = this.sharedDataService.fdSubmitFinished
      .subscribe(finished => {
        this.fdSubmitFinished = finished;
    });

    this.showProgressBarSub = this.sharedDataService.showProgressBar
      .subscribe(progressBar => {
        this.showProgressBar = progressBar;
      });
      
    if (this.data !== null  && this.data !== undefined) {
      this.collectPaymentMessageEnabled = this.data.isSdsShip;
      
      if (this.data.success) {
        this.success = this.data.success;
        this.orderNumber = this.data.orderNumber;
        this.orderType = this.data.orderType;
        this.sharedDataService.orderType = this.orderType;
        let hasNonWFJobs = true;

        if (!!this.sharedDataService.orderType) {
          if (this.sharedDataService.orderType === SubmitType.Order) {

            if (this.orderConfigService.hasWorkFrontJob) {
              hasNonWFJobs = false;
              const orderSubmissionObject = this.orderConfigService.createOrderSubmissionObject();

              this.postToWorkFront(orderSubmissionObject, this.orderNumber.toString());

              const orderSubJobs: OrderSubmissionJob[] = orderSubmissionObject.jobs;
              for (let jobCounter = 0; jobCounter < orderSubJobs.length; jobCounter++) {
                if (!(this.allowed_workfront_category.indexOf(orderSubJobs[jobCounter].categoryCode) >= 0)) {
                  hasNonWFJobs = true; break;
                }
              }
            }

            if (this.data.submitOrderToFlightDeck && hasNonWFJobs) {
              this.postToFlightDeck();
            } else {
              this.sharedDataService.changeConfirmationTitle(this.translate.instant('ORDER.checkout.orderSubmitted'));
            }

          } else if (this.sharedDataService.orderType === SubmitType.Quote) {
            this.sharedDataService.changeConfirmationTitle(this.translate.instant('ORDER.checkout.quoteSubmitted'));
            this.sharedDataService.changeShowProgressBar(false);
            this.sharedDataService.changeFdSubmitFinished(true);
            this.sharedDataService.changeFdSuccess(true);
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (!!this.titleSub) {
      this.titleSub.unsubscribe();
    }
    if (!!this.fdSuccessSub) {
      this.fdSuccessSub.unsubscribe();
    }
    if (!!this.fdSubmitFinishedSub) {
      this.fdSubmitFinishedSub.unsubscribe();
    }
    if (!!this.showProgressBarSub) {
      this.showProgressBarSub.unsubscribe();
    }
  }

  resetSharedValues() {
    this.sharedDataService.changeFdSuccess(false);
    this.sharedDataService.changeShowProgressBar(false);
    this.sharedDataService.changeFdSubmitFinished(false);
    this.sharedDataService.changeConfirmationTitle(this.translate.instant('ORDER.checkout.pleaseWaitSubmitting'));
  }

  printOrder() {
    this.printClicked = true;
    this.dialog.open(PrintTicketsWrapperComponent, {
      height: '85%',
      width: '50%',
      data: { orderNumber: Number(this.data.orderNumber) }
    });
  }

  postToFlightDeck() {
    this.sharedDataService.changeShowProgressBar(true);
    this.flightDeckStatusMessage = this.translate.instant('CHECKOUT.flightDeckTask');

    this.orderService.submitToFlightDeck(this.orderNumber.toString()).subscribe(
      (fdResult) => {
          this.flightDeckStatusMessage = this.translate.instant('CHECKOUT.flightDeckSuccess');
        if (!this.orderConfigService.isEditQuote && !this.orderConfigService.isEditOrder) {
          // Upload file to cloud PB if cloud version was not used originally
          let orderHasFiles = false;
          Object.keys(this.orderConfigService.cart).forEach( key => {
            if (this.orderConfigService.cart[key].mediaType === 0 ) {
              orderHasFiles = true;
            }
          });
          const isFileUpload = !this.fileUploadService.useCloudPB() && orderHasFiles;
          this.fileUploadService.pbOrderSubmit(fdResult.body, isFileUpload);
        }
      },
      (error) => {
        this.sharedDataService.changeShowProgressBar(false);
        this.sharedDataService.changeFdSuccess(false);
        this.sharedDataService.changeFdSubmitFinished(true);
        this.sharedDataService.changeConfirmationTitle(this.translate.instant('ORDER.checkout.orderFailedToSubmitToFd'));
        this.flightDeckStatusMessage = this.translate.instant('CHECKOUT.flightDeckFailure');
        throw new Error(error);
      }
    );
  }

  postToWorkFront(workFrontRequest: OrderSubmission, orderNo: string) {
    this.sharedDataService.changeShowProgressBar(true);
    workFrontRequest.orderNumber = orderNo;
    this.flightDeckStatusMessage = this.translate.instant('CHECKOUT.workfrontTask ');

    this.orderService.submitToWorkFront(workFrontRequest).subscribe(
      (wfprojectResponse) => {
        this.workFrontSubmitted = true;
        const workFrontTaskMap: Map<number, string> = wfprojectResponse.body;
        this.workFrontSuccess  = true;
        this.workFrontSuccessMsg = this.translate.instant('CHECKOUT.workfrontSuccess');
        this.fileUploadService.workFrontFileUpload(workFrontTaskMap, this.orderConfigService.cart, orderNo);
      }, (error) => {
        this.workFrontSubmitted = true;
        this.LOGGER.error('CHECKOUT.workfrontFailure' + error);
        this.workFrontSuccess = false;
        this.workFrontFailedMsg = this.translate.instant('CHECKOUT.workfrontFailure');
        throw new Error(error);
      });

    this.sharedDataService.changeShowProgressBar(false);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
