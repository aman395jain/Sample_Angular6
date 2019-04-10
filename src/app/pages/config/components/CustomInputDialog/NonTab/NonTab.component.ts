import { Component, OnDestroy, OnInit, Input, AfterContentInit, ViewChild,
   ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {CustomInputDialogComponent} from '../CustomInputDialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import {CommonConstants} from '@app/config/common-constants';
import {CustomInputInt} from '@app/pages/config/components/CustomInputDialog/CustomInputInt';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';

@Component({
  selector: 'app-non-tab',
  templateUrl: './NonTab.component.html',
  styleUrls: ['./NonTab.component.css']
})
export class NonTabComponent implements OnInit, CustomInputInt, AfterContentInit, AfterViewInit, OnDestroy {
  @Input() data: any;
  @ViewChild('focusElement') focusEl: ElementRef;
  public customOptionsForm: FormGroup;
  private errorMsgs: any;
  focusSub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<CustomInputDialogComponent>,
    private fb: FormBuilder,
    private orderConfigService: OrderConfigService,
    public sharedDataService: SharedDataService,
    private validationService: ValidatorsService,
    private translate: TranslateService,
    private changeDetRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sharedDataService.configPageReadyBSubj.next(false);
    this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });
    this.focusSub = this.sharedDataService.configPageReadyBSubj.subscribe({
      next: (b) => {
        if (b) { this.setDefaultFocus(); }
      }
    });
  }

  ngAfterViewInit() {
    this.sharedDataService.configPageReadyBSubj.next(true);
  }

  ngOnDestroy() {
    this.focusSub.unsubscribe();
  }

  // Called after ngOnInit when the component's or directive's content has been initialized.
  ngAfterContentInit() {
    this.buildForm();

    // Populate form if customOptionsList already Exists
    if (this.data.customOption.customOptionsList) {
      // console.log(this.customOptionsForm);
      for ( const key of Object.keys(this.data.customOption.customOptionsList)) {
        this.customOptionsForm.controls[key].setValue(this.data.customOption.customOptionsList[key]);
      }
    }
  }
  /*
   * Function to build the from with proper validators based on field types.
   */
  buildForm(): void {
    const validatorObj = {};
    const options: [any] = this.data.customOption.customOptions;
    for ( let i = 0; i < options.length; i++ ) {
      const secondParam = [];
      if ( CommonConstants.CUSTOM_INPUT_PROPERTY[options[i].customKey].isMandatory === 'Y') {
        secondParam.push(Validators.required);
      }

      // Get validators for field type
      const thirdParam = [this.getValidatorFunction(options[i].customKey)];

      // If type VCODE V417 add the validator to validate the stock sheet size against the media type max size.
      // VCODE was taken from old app
      if (this.data.customOption.code === 'V417' || this.data.customOption.code === 'V2042') {
        thirdParam.push(this.validationService.validateStockSheetSize.bind(this, options[i].customKey, this.errorMsgs));
      }

      validatorObj[options[i].customKey] = ['', Validators.compose(secondParam) , Validators.composeAsync(thirdParam) ];

    }


    this.customOptionsForm = this.fb.group(validatorObj);
  }

  /*
   * Function to get the proper validators based on the custom Key.
   */
  getValidatorFunction(key) {
    switch (CommonConstants.CUSTOM_INPUT_PROPERTY[key].valueType) {
      case 'decimal' :
        return this.validationService.validateDecimal.bind(this, this.errorMsgs);
      case 'alphaNumeric':
        return this.validationService.validateAlphaNumeric.bind(this, this.errorMsgs);
      case 'positiveInteger':
        return this.validationService.validatePositiveInteger.bind(this, key, this.errorMsgs);
      case 'positiveIntegerAndZero':
        return this.validationService.validatePositiveIntegerAndZero.bind(this, this.errorMsgs);
    }
  }

  /*
   * called when form is submitted. Adds the custom option values to the option and closes the dialog
   */
  onSubmit() {

    if (this.data.exceptionPage) {
      this.orderConfigService.addCustomOptionsListToOptionExceptionPage(this.data.customOption, this.customOptionsForm.value);
    } else {
      this.orderConfigService.addCustomOptionsListToOption(this.data.customOption, this.customOptionsForm.value);
    }
    this.dialogRef.close(this.data.customOption);
  }

  setDefaultFocus() {
      this.focusEl.nativeElement.focus();
      this.changeDetRef.detectChanges();
    }

}
