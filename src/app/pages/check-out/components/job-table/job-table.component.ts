import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import {FilePreviewModalWrapperComponent} from '@app/shared/components/FileComponents';
import {ConfirmationDialogComponent} from '@app/shared/components/ConfirmationDialog/ConfirmationDialog.component';
import {CommonConstants} from '@app/config/common-constants';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {SnackNotification} from '@app/models/SnackNotification';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {FileUploadComponent} from '@app/shared/components/FileComponents';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';
import { Subject, Subscription } from 'rxjs';


@Component({
  selector: 'app-job-table',
  templateUrl: './job-table.component.html',
  styleUrls: ['./job-table.component.css'],
})

export class JobTableComponent implements OnInit, OnDestroy {
  @Input() shakeLinks: Subject<any>;
  private quantityTimeout: any;
  public orderPricing;
  private errorMsgs: any;
  private jobs: any;
  private jobkeyList: any;
  private shippingCost: Number;
  private allowed_workfront_category: Array<any> = CommonConstants.ALLOWED_WORKFRONT_CATEGORY;
  public markToFix = false;
  public shakeSub: Subscription;
  constructor(
    public translate: TranslateService,
    public orderConfigService: OrderConfigService,
    private configService: ConfigurationScreenService,
    private router: Router,
    private notificationService: NotificationService,
    private sharedDataService: SharedDataService,
    private fileUploadService: FileUploadService,
    public dialog: MatDialog) {
  }


  ngOnDestroy(): void {
    if (this.shakeSub !== undefined) {
      this.shakeSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.orderConfigService.calculateOrderTotal(null);

    this.orderConfigService.cartChanged.subscribe(result => {
        this.jobkeyList = this.orderConfigService.getCart();
    });

    this.translate.get('COMMON.error').subscribe(result => {
        this.errorMsgs = result;
    });

    this.orderConfigService.shippingEnabled.subscribe(data => {
        this.shippingCost = this.orderConfigService.shippingCost;
    });

    if (this.orderConfigService.isOrderNameDefault) {
        this.orderConfigService.orderName = '';
        Object.keys(this.orderConfigService.cart).forEach( jobKey => {
            if (this.orderConfigService.orderName !== '') {
                this.orderConfigService.orderName += ', ';
            }
            this.orderConfigService.orderName += this.orderConfigService.cart[jobKey].configProduct.name;
        });
    }
    this.orderConfigService.orderName = this.orderConfigService.orderName.substring(0, 50);

    this.shakeSub = this.shakeLinks.subscribe(
      x => {
        this.markToFix = x;
      });
  }

  removeJobFromOrderName(jobName) {
    if (this.orderConfigService.orderName === this.orderConfigService.orderName.replace(', ' + jobName, '')) {
      this.orderConfigService.orderName = this.orderConfigService.orderName.replace(jobName + ', ', '');
    } else {
      this.orderConfigService.orderName = this.orderConfigService.orderName.replace(', ' + jobName, '');
    }
  }

  deleteJobFromCart(jobNumber) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          width: '250px',
          data: { message: 'Delete ' + this.orderConfigService.cart[jobNumber].configProduct.name + ' from the order?' }
      });

      dialogRef.afterClosed().subscribe(result => {
      if (result) {
          if (this.orderConfigService.isOrderNameDefault) {
            this.removeJobFromOrderName(this.orderConfigService.cart[jobNumber].configProduct.name);
          }
          this.orderConfigService.deleteJobFromCart(jobNumber);
          this.orderConfigService.orderPriceData.next(this.orderConfigService.calcOrderPriceData(this.orderConfigService.cart));
          this.orderConfigService.calculateOrderTotal(this.orderConfigService.shippingCost);
      }
      });
  }

  editJob(key) {
      this.orderConfigService.isEditJob = true;
      this.router.navigate(['/config/'], {queryParams: {job: key}});
  }

  changeJobName(event, key) {
    this.orderConfigService.cart[key].configProduct.name = event.target.innerText;
  }

  /**
   * function to call pricing when quantity is changed
   */
  onJobChange(key) {
    if (this.orderConfigService.cart[key].quantity < 1) {
      this.orderConfigService.cart[key].quantity = 1;
    } else if (this.orderConfigService.cart[key].quantity > 999999) {
      this.orderConfigService.cart[key].quantity = 999999;
      this.notificationService.notify(
        new SnackNotification(this.errorMsgs.exceededMaxQuantityRange, 10000)
      );
    }

    clearTimeout(this.quantityTimeout);
    this.quantityTimeout = setTimeout(() => {
      this.notificationService.showLoader();
      this.configService.getPricingandConditionalTicketing(
        // passing null to createTicketingAndPricingObject sets conditional ticketing to 'N'
        this.orderConfigService.createCondTicketingObj(this.orderConfigService.cart, this.orderConfigService.orderCustomer,
          this.orderConfigService.orderCustomerPreferredContact, 'P')).subscribe(
            (pAndCres) => {
              const pAndC: any = pAndCres;
              if (pAndC === null || pAndC === undefined) {
                this.notificationService.hideLoader();
                throw new CustomSBError(this.errorMsgs.pAndCError, 'Pricing Or Conditional Ticketing', false);
              }
              this.orderConfigService.jobQuantityChanged.next(true);
              this.orderConfigService.cart = this.orderConfigService.processPriceResponse(pAndC.jobs, this.orderConfigService.cart);
              this.notificationService.hideLoader();
              this.orderConfigService.calculateOrderTotal(this.shippingCost);

            },
            (error) => {
              this.notificationService.hideLoader();
            }
          );
    }, 1000);
  }

  incrementQty(direction, key) {
    if (direction === 'minus') {
      this.orderConfigService.cart[key].quantity--;
    }
    if (direction === 'plus') {
      this.orderConfigService.cart[key].quantity++;
    }
    this.onJobChange(key);
  }

  openFilePreview(key) {
    const dialogRef = this.dialog.open(FilePreviewModalWrapperComponent, {
      width: '900px',
      height: 'auto',
      data: {
        fileFullName: this.orderConfigService.cart[key].printBrokerFiles.fileDescriptions[1].fileUrl,
        fileName: this.orderConfigService.cart[key].printBrokerFiles.fileDescriptions[1].fileName
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }

  openFileSelectionDialog(key) {
    let workfront = false;
    this.orderConfigService.allowCancel.next(true);
    if (this.allowed_workfront_category.indexOf(this.orderConfigService.cart[key].configProduct.categoryCode) >= 0) {
        workfront = true;
    }

    const activeJob = JSON.parse(JSON.stringify(this.orderConfigService.cart[key]));
    activeJob.multipleFiles = this.orderConfigService.cart[key].multipleFiles;
    const dialogRef = this.dialog.open(FileUploadComponent, {
        width: '800px',
        height: 'auto',
        data: { activeJob: activeJob, isWesUpload: false, showChangeFileWarning: true, isWorkFront: workfront }
    });
        dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.orderConfigService.cart[key] = JSON.parse(JSON.stringify(this.orderConfigService.activeJob));
          this.orderConfigService.cart[key].multipleFiles = this.orderConfigService.activeJob.multipleFiles;
          this.orderConfigService.fileUploadedSub.next(true);

          this.orderConfigService.cart[key] = JSON.parse(JSON.stringify(this.orderConfigService.activeJob));
          this.orderConfigService.cart[key].multipleFiles = this.orderConfigService.activeJob.multipleFiles;
            if (this.orderConfigService.cart[key].printBrokerFiles &&
              this.orderConfigService.cart[key].printBrokerFiles.fileDescriptions.length > 1) {
            this.notificationService.showLoader();
            this.fileUploadService.getXMLFile(this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions[2]
                .fileUrl).subscribe(result2 => {
                this.orderConfigService.processFileData(this.fileUploadService.processXMLFile(result2));
                this.configService.getPricingandConditionalTicketing(
                // passing null to createTicketingAndPricingObject sets conditional ticketing to 'N'
                this.orderConfigService.createTicketingAndPricingObject(null, false, 'P')).subscribe(pc => {
                const pAndC: any = pc;
                if (pAndC === null || pAndC === undefined) {
                    this.notificationService.hideLoader();
                    throw new CustomSBError(this.errorMsgs.pAndCError, this.errorMsgs.pAndCErrorName, false);
                }
                this.orderConfigService.processPricing(pAndC.orderPricing, pAndC.jobs);
                this.notificationService.hideLoader();
                });
              });
            }
            if (this.orderConfigService.cart[key].mediaType === 1
                    || this.orderConfigService.cart[key].mediaType === 2) {
                      this.orderConfigService.cart[key].printBrokerFiles = null;
                      this.orderConfigService.cart[key].multipleFiles = null;
            }
        } else {
          this.sharedDataService.configPageIsLoaded = true;
        }
    });
}

  changeOrderName($event) {
    this.orderConfigService.isOrderNameDefault = false;
    this.orderConfigService.orderName = $event.target.innerText;
  }

  /**
   * Checks if the key code is for a key action that we want to allow when the user
   * has typed the maximum number of characters in the order name field.
   *
   *  8: backspace
   * 37: left arrow
   * 39: right arrow
   * 46: delete
   *
   * @param event the key event
   */
  isAllowedKeyCode(event) {
    return event.keyCode === 8 ||
      event.keyCode === 39 ||
      event.keyCode === 37 ||
      event.keyCode === 46;
  }
}
