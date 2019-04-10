import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {AttrOptionSelectorModalComponent} from '@app/pages/config/components/attr-option-selector-modal/attr-option-selector-modal.component';
import {ExceptionPage} from '@app/models/ExceptionPage';
import {CustomInputDialogComponent} from '@app/pages/config/components/CustomInputDialog/CustomInputDialog.component';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';

@Component({
  selector: 'app-ExceptionPage',
  templateUrl: './ExceptionPage.component.html',
  styleUrls: ['./ExceptionPage.component.css']
})
export class ExceptionPageComponent implements OnInit {
  private validatePageRangeTimeout: any;
  public position = 'below';
  public innerHeight;
  public pageRange: any;
  public pageRangeClean: string;
  public pageRangeImpressions;
  public pageRangeValidating = false;
  public pageRangeForm: FormGroup;
  private errorMsgs: any;

  constructor(
    public translate: TranslateService,
    public dialogRef: MatDialogRef<ExceptionPageComponent>,
    public orderConfigService: OrderConfigService,
    private configurationService: ConfigurationScreenService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    vcr: ViewContainerRef
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
  });
    this.innerHeight = window.innerHeight - 200;
  }

  count(obj) {
    return Object.keys(obj).length;
  }

  hasCustomOptions(option) {
    if (option.customOptions && option.customOptions.length > 0) {
        return true;
    }
    return false;
  }

  buildForm(): void {
    this.pageRangeForm = this.fb.group({
      'pageRangeInput': ['', [
             Validators.required,
             Validators.pattern('^[0-9\,\-]*$')
           ],
           this.validatePageRange.bind(this) // async Validator passed as 3rd parameter
      ]
    });
    if (this.data.edit) {
      this.pageRangeForm.setValue( {pageRangeInput: this.orderConfigService.activeExceptionPage.pageRange});
    }
  }

  validatePageRange(control: FormControl) {
    return new Promise((resolve, reject) => {
        clearTimeout(this.validatePageRangeTimeout);
        this.validatePageRangeTimeout = setTimeout(() => {
            this.pageRangeValidating = true;
            const pageList = [];
          for (const expId in  this.orderConfigService.activeJob.exceptionPages) {
            const exp = this.orderConfigService.activeJob.exceptionPages[expId];
            if (!this.data.edit) {
                pageList.push(exp.pageRange);
            }
          }
        this.configurationService.validateExceptionPageRange(control.value, this.orderConfigService.activeJob.impressions, pageList)
            .subscribe( result => {
                this.pageRangeValidating = false;
                this.pageRangeClean = result['cleanedRange'];
                this.pageRangeImpressions = result['impressionCnt'];
                resolve(null);
            },
        err => {
        this.pageRangeValidating = false;
        resolve({ 'error': true, 'msg': err });
        });
        }, 500);
    });
  }

  openAttributeOptionDialog(groupVO, title): void {
    const dialogRef = this.dialog.open(AttrOptionSelectorModalComponent, {
      width: '450px',
      data: { groupVO: groupVO, title: title }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.optionSelected(result);
        }
    });
  }

  openCustomInputDialog(option, title): void {
    const dialogRef = this.dialog.open(CustomInputDialogComponent, {
      width: '450px',
      height: 'auto',
      data: { customOption: option, title: title, exceptionPage: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.optionSelected(result);
      }
    });
  }

  optionSelected(option) {
    this.orderConfigService.changeSelectedItemExceptionPage(option);
    if (this.orderConfigService.valueContainsDoubleSided(option.description)) {
      this.orderConfigService.activeExceptionPage.isDoubleSided = true;
    }

    this.configurationService.getPricingandConditionalTicketing(
      this.orderConfigService.createTicketingAndPricingObject(option, true, 'C')).subscribe( result => {
      const data: any = result;
      if (data === null || data === undefined) {
        this.notificationService.hideLoader();
        throw new CustomSBError(this.errorMsgs.pAndCError, this.translate.instant('COMMON.error.pAndCErrorName'), false);
      }
      for (let i = 0; i < data.jobs.length; i ++) {
        if ( data.jobs[ i ].activeJob ) {
          this.orderConfigService.processConditionalTicketingExceptionPage(data.jobs[ i ].exceptionPageArray[0]);
        }
      }
      this.notificationService.hideLoader();
    });

  }



  addExceptionPage() {
    this.orderConfigService.activeExceptionPage.pageRange = this.pageRangeClean;
    this.orderConfigService.activeExceptionPage.pageRangeImpressions = this.pageRangeImpressions;
    this.notificationService.showLoader();
    this.configurationService.getPricingandConditionalTicketing(
      this.orderConfigService.createTicketingAndPricingObject(null,
        true,  'CP')).subscribe( result => {
      const data: any = result;
      if (data === null || data === undefined) {
        this.notificationService.hideLoader();
        throw new CustomSBError(this.errorMsgs.pAndCError, this.translate.instant('COMMON.error.pAndCErrorName'), false);

      }

      this.orderConfigService.addExceptionPageToJob(this.pageRangeClean, this.pageRangeImpressions);
      this.notificationService.hideLoader();
      this.orderConfigService.processPricing(data.orderPricing, data.jobs);
      this.dialogRef.close(true);
    });
  }

  clearActiveExceptionPage() {
    this.orderConfigService.activeExceptionPage = new ExceptionPage(null, null,
      null, null, null);
  }

  updateExceptionPage() {
    this.notificationService.showLoader();
    this.orderConfigService.activeExceptionPage.pageRange = this.pageRangeClean;
    this.orderConfigService.activeExceptionPage.pageRangeImpressions = this.pageRangeImpressions;
    this.orderConfigService.updateExceptaionPage(this.data.id);
    this.configurationService.getPricingandConditionalTicketing(
      this.orderConfigService.createTicketingAndPricingObject(null,
        null, 'CP')).subscribe( result => {
      const data: any = result;
      if (data === null || data === undefined) {
        this.notificationService.hideLoader();
        throw new CustomSBError(this.errorMsgs.pAndCError, this.translate.instant('COMMON.error.pAndCErrorName'), false);
      }

      this.orderConfigService.processPricing(data.orderPricing, data.jobs);
      this.notificationService.hideLoader();
      this.dialogRef.close(true);
    });
  }

  checkIfGroupIsDisabled(group) {
    for (let grc = 0; grc < group.length; grc++) {
      if (!group[grc].isDisabled) {
        return false;
      }
    }
    return true;
  }

}
