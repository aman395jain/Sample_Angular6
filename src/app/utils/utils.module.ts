import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {KeysPipe} from '@app/utils/keys.pipe';
import {PhonePipe} from '@app/utils/phone.pipe';
import {TextMaskModule} from 'angular2-text-mask';
import {DeferLoadDirective} from '@app/utils/DeferLoad';
import {DNDFileUploadDirective} from '@app/utils/DNDFileUpload.directive';
import {EmailValidator} from '@app/utils/email-validator.directive';
import {FileSizeFormatterPipe} from '@app/utils/file-size-formatter.pipe';
import {ReadMoreComponent} from '@app/utils/read-more.component';
import {ReplaceLineBreaksPipe} from '@app/utils/replace-line-breaks.pipe';
import {SafeHTMLPipe} from '@app/utils/safeHTML.pipe';
import {SkuDescriptionPipe} from '@app/utils/sku-description.pipe';

@NgModule({
  imports: [
    CommonModule,
    TextMaskModule
  ],
  declarations: [
    KeysPipe,
    PhonePipe,
    DeferLoadDirective,
    DNDFileUploadDirective,
    EmailValidator,
    FileSizeFormatterPipe,
    ReadMoreComponent,
    ReplaceLineBreaksPipe,
    SafeHTMLPipe,
    SkuDescriptionPipe
  ],
  exports: [
    KeysPipe,
    PhonePipe,
    DeferLoadDirective,
    DNDFileUploadDirective,
    EmailValidator,
    FileSizeFormatterPipe,
    ReadMoreComponent,
    ReplaceLineBreaksPipe,
    SafeHTMLPipe,
    SkuDescriptionPipe
  ]
})
export class UtilsModule { }
