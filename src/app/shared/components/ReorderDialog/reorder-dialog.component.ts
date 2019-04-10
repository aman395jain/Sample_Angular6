import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {QuoteActions, CommonConstants} from '../../../config/common-constants';
import {NotificationService} from '../../../core/Services/notification/notification.service';
import {PrintBrokerResponse} from '../../../models/printbroker/PrintBrokerResponse';
import {StoreinfoService} from '../../../core/Services/storeinfo/storeinfo.service';
import {FileDescriptions} from '../../../models/printbroker/FileDescriptions';
import {LoggerService} from '../../../core/Services/logger-service/logger-service.service';
import {CustomSBError} from '../../../errors/CustomErrorObjects/CustomSBError';
import {OrderConfigService} from '../../../core/Services/order-config/order-config.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {OrderService} from '@app/shared/services/order/order.service';


@Component({
  selector: 'app-reorder',
  templateUrl: './reorder-dialog.component.html',
  styleUrls: ['./reorder-dialog.component.css']
})

export class ReorderDialogComponent implements OnInit {
  public loading = false;
  public template;
  public reOrdering = false;
  public errorMsg = '';
  public canContinue = true;
  public progressBarAmount = 0;
  private progressBarStepAmount = 0;
  private errorMsgs: any;
  private successMsgs: any;
  public QuoteActions = QuoteActions;
  private quoteAction: QuoteActions;
  private allowed_workfront_category: Array<any> = CommonConstants.ALLOWED_WORKFRONT_CATEGORY;

  constructor(
    public dialogRef: MatDialogRef<ReorderDialogComponent>,
    private notificationService: NotificationService,
    private translate: TranslateService,
    public validators: ValidatorsService,
    public orderService: OrderService,
    public orderConfigService: OrderConfigService,
    public configService: ConfigurationScreenService,
    public storeInfoService: StoreinfoService,
    public router: Router,
    private LOG: LoggerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });
    this.translate.get('COMMON.success').subscribe(result => {
      this.successMsgs = result;
    });

    this.quoteAction = this.data.operation;

    if (this.quoteAction === QuoteActions.Edit) {
      this.orderConfigService.isEditQuote = true;
      this.orderConfigService.isEditOrder = false;
      this.orderConfigService.orderNumber = this.data.orderNumber;
    } else if (this.quoteAction === QuoteActions.OrderEdit) {
      this.orderConfigService.isEditOrder = true;
      this.orderConfigService.isEditQuote = false;
      this.orderConfigService.orderNumber = this.data.orderNumber;
    } else {
      this.orderConfigService.isEditQuote = false;
      this.orderConfigService.isEditOrder = false;
      this.orderConfigService.orderNumber = null;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.canContinue = false;
    this.notificationService.showLoader();
    this.reOrdering = true;
    this.orderConfigService.reorderConfigProductMap = {};
    this.increaseProgressBar();

    // Pass in this.data.orderNumber to reorder API and use returned data to create a new order with options
    this.orderService.reorder(this.data.orderNumber)
      .subscribe(data => {
          const orderData: any = data;

          this.orderConfigService.setOrderCustomer(orderData.customerBean);
          this.orderConfigService.orderCustomerSelected = true;

          this.progressBarStepAmount = 100 / (4 * Object.keys(orderData.jobBeanList).length + 1);
          this.increaseProgressBar();

          this.orderConfigService.orderName = (orderData.orderName != null) ? orderData.orderName : '';
          this.orderConfigService.isOrderNameDefault = (orderData.orderName === null);

          // Clear out the cart before starting a new reorder
          this.orderConfigService.clearCart();

          // Set the Reorder flag to skip ngOnInit call in config.component
          this.orderConfigService.setIsReorder(true);

          this.processGroupKeyOptions(0, orderData.jobBeanList, null);
          this.notificationService.hideLoader();
        },
        err => {
          this.canContinue = false;
          this.reOrdering = false;
          this.errorMsg = this.errorMsgs.processReorder + '  [' + err + ']';
          this.notificationService.hideLoader();
        }
      );
  }

  processGroupKeyOptions(index: number, jobList, configData) {
    if (jobList[index].preConfProductCode) {
      this.configService.retrieveGroupKeyOptions(jobList[index].preConfProductCode, configData)
        .subscribe(async result => {
          this.processOptionDetails(index, jobList, result);
      });
    } else {
       this.configService.retrieveGroupKeyOptions(jobList[index].productCode, configData)
       .subscribe(async result => {
        this.processOptionDetails(index, jobList, result);
      });
    }
  }

  processOptionDetails(index: number, jobList, groupKeyOptions) {
    this.increaseProgressBar();

    if (this.allowed_workfront_category.indexOf(groupKeyOptions.configProduct.categoryCode) >= 0
      && !this.orderConfigService.hasWorkFrontJob) {
      this.orderConfigService.hasWorkFrontJob = true;
    }

    jobList[index].configProduct = groupKeyOptions.configProduct;
    this.orderConfigService.activeConfigProduct = groupKeyOptions.configProduct;
    this.orderConfigService.activeConfigProduct.name = jobList[index].jobName;
    this.orderConfigService.reorderConfigProductMap[this.orderConfigService.jobIdCounter] =
      this.orderConfigService.activeConfigProduct;

    groupKeyOptions.productDetails = {};
    groupKeyOptions.attributeOptions.optionDetailList.forEach(option => {
      const temp = {};
      option.attributeProperties.forEach(property => {
        temp[property.propertyName] = property.propertyValue;
      });
      option.attributePropertyMap = temp;
      groupKeyOptions.productDetails[option.id] = option;
    });

    this.orderConfigService.activeJob =
      this.orderConfigService.setActiveJobTyped(groupKeyOptions, this.orderConfigService.activeJob);

    // Set the impressions and quantity counts
    this.orderConfigService.activeJob.impressions = jobList[index].impressions;
    this.orderConfigService.activeJob.quantity = jobList[index].quantity;

    this.orderConfigService.activeJob.specialInstructions = jobList[index].specialInstructions;

    this.orderConfigService.resetActiveJobFileInfo();

    if (this.quoteAction !== QuoteActions.Copy) {
        if (jobList[index].inputBean) {
          if (jobList[index].inputBean.fileNotes) {
            this.orderConfigService.activeJob.fileNotes = jobList[index].inputBean.fileNotes;
          }
          if (jobList[index].inputBean.fileFullName) {
            const pbObj = {
              fileUrl: jobList[index].inputBean.fileFullName,
              fileName: jobList[index].inputBean.nextElectronicFileName
            };
            this.orderConfigService.activeJob.printBrokerFiles = undefined;
            const pb = new PrintBrokerResponse(null,
              [new FileDescriptions(null, pbObj.fileName, null, null, pbObj.fileUrl, null)],
              null, null, null, null, null, null);

            this.orderConfigService.activeJob.printBrokerFiles = pb;
          }
        }
        this.orderConfigService.activeJob.mediaType
          = (jobList[index].inputBean.fileType == null) ? 2 : (jobList[index].inputBean.fileType === 'Hard Copy') ? 1 : 0;
    }

    if (jobList[index].exceptionBeanList.length > 0) {
      this.processExceptionPages(jobList[index].exceptionBeanList);
    }

    this.orderConfigService.addToCart();
    this.increaseProgressBar();

    if (jobList.length === this.orderConfigService.cartCount()) {
      this.completeSubmit(jobList, 0);
    } else {
      this.processGroupKeyOptions(++index, jobList, null);
    }
  }

  processExceptionPages(exceptionBeanList) {
    exceptionBeanList.forEach( exceptionBean => {
      // set new active exception page
      this.orderConfigService.activeExceptionPage = this.orderConfigService.activeJob.exceptionPageObj;

      this.orderConfigService.setSelectedOptionsExceptionPageReorder(exceptionBean.attributeOptionSelectedBean);
      this.orderConfigService.addExceptionPageToJob(exceptionBean.pageRange, exceptionBean.impressions);
    });
  }

  completeSubmit(jobList, index) {

    this.increaseProgressBar();
    this.orderConfigService.changeActiveJob(Object.keys(this.orderConfigService.cart)[index]);

    const selOpts = this.orderConfigService.getSelectedOptions(jobList[index].attributeOptionSelectedBean);
    const ctParam = this.orderConfigService.createTicketingAndPricingObject(selOpts, false, 'CP');

    this.configService.getPricingandConditionalTicketing(ctParam)
      .subscribe(pAndCRe => {
        this.increaseProgressBar();
        const pAndC: any = pAndCRe;

        if (pAndC === null || pAndC === undefined) {
          this.notificationService.hideLoader();
          this.canContinue = false;
          this.reOrdering = false;
          this.errorMsg = this.errorMsgs.processPricing;
          this.dialogRef.close({status: 'success', msg: this.successMsgs.reorder});
          this.router.navigate(['/config/'], {queryParams: {job: Object.keys(this.orderConfigService.cart)[(index > 0 ? index - 1 : 0)]}});
          throw new CustomSBError(this.errorMsgs.conditionalTicket, 'Pricing Or Conditional Ticketing', false);
        }

      this.orderConfigService.processPricing(pAndC.orderPricing, pAndC.jobs);
        for (let i = 0; i < pAndC.jobs.length; i ++) {
          if ( pAndC.jobs[ i ].activeJob ) {
            this.orderConfigService.processConditionalTicketing(pAndC.jobs[ i ]);
          }
        }
        this.orderConfigService.updateActiveJob();

        if (this.orderConfigService.cartCount() === index + 1) {

          this.progressBarAmount = 100;
          this.reOrdering = false;
          this.dialogRef.close({status: 'success', msg: this.successMsgs.reorder});
          this.router.navigate(['/config/'], {queryParams: {job: Object.keys(this.orderConfigService.cart)[index]}});

          return;
        } else {
          this.completeSubmit(jobList, ++index);
        }
      });
  }

  increaseProgressBar() {
    this.progressBarAmount += this.progressBarStepAmount;
  }

}
