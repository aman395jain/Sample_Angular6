import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AddressValidationDialogComponent} from '@app/shared/components/address-validation-dialog/address-validation-dialog.component';
import {ConfirmationDialogComponent} from '@app/shared/components/ConfirmationDialog/ConfirmationDialog.component';
import {CustomerSearchComponent} from '@app/shared/components/customer-search/customer-search.component';
import {CustomerSearchDialogComponent} from '@app/shared/components/customer-search-dialog/customer-search-dialog.component';
import {CustomerSearchResultsComponent} from '@app/shared/components/customer-search-results/customer-search-results.component';
import {DuplicateJobComponent} from '@app/shared/components/duplicate-job/duplicate-job.component';
import {
  FilePreviewComponent,
  FilePreviewImagesComponent,
  FilePreviewModalWrapperComponent, FileUploadComponent
} from '@app/shared/components/FileComponents';
import {FileUploadMultiFileComponent} from '@app/shared/components/FileComponents/file-upload-multi-file/file-upload-multi-file.component';
import {FileUploadPrintBrokerComponent} from '@app/shared/components/FileComponents/file-upload-print-broker/file-upload-print-broker.component';
import {InformationDialogComponent} from '@app/shared/components/information-dialog/information-dialog.component';
import {OrderSummaryComponent} from '@app/shared/components/order-summary/order-summary.component';
import {OrderConfirmationDialogComponent} from '@app/shared/components/OrderConfirmationDialog/OrderConfirmationDialog.component';
import {PrintTicketsWrapperComponent} from '@app/shared/components/print-tickets-wrapper/print-tickets-wrapper.component';
import {PrintQuoteTicketsComponent} from '@app/shared/components/PrintQuoteTickets/PrintQuoteTickets.component';
import {PrintTicketsComponent} from '@app/shared/components/PrintTickets/PrintTickets.component';
import {SaveForLaterDialogComponent} from '@app/shared/components/save-for-later-dialog/save-for-later-dialog.component';
import {TimeOutDialogComponent} from '@app/shared/components/time-out-dialog/time-out-dialog.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';
import {MaterialComponentsModule} from '@app/material-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TextMaskModule} from 'angular2-text-mask';
import {RouterModule} from '@angular/router';
import {UtilsModule} from '@app/utils/utils.module';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {PdfJsViewerModule} from 'ng2-pdfjs-viewer';
import {NgxGalleryModule} from 'ngx-gallery';
import {CustomerInformationComponent} from '@app/shared/components/CustomerInformation/CustomerInformation.component';
import {SendEmailComponent} from '@app/shared/components/send-email/send-email.component';
import {ReorderDialogComponent} from '@app/shared/components/ReorderDialog/reorder-dialog.component';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';
import {EchCustomerService} from '@app/shared/services/EchCustomer/EchCustomer.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {TableSortService} from '@app/shared/services/table-sort/table-sort.service';
import {ProgressCheckComponent} from '@app/shared/components/progress-check/progress-check.component';
import {NewWesLeadComponent} from '@app/shared/components/NewWesLead/new-wes-lead.component';
import {WesLeadResultComponent} from '@app/shared/components/NewWesLead/wes-lead-result/wes-lead-result.component';
import {AddressValidationService} from '@app/shared/services/address-validation/address-validation.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {WesleadsService} from '@app/shared/services/wesleads/wesleads.service';
import {SaveforlaterCustomerDialogComponent} from '@app/shared/components/saveforlater-customer-dialog/saveforlater-customer-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    RouterModule,
    UtilsModule,
    PdfViewerModule,
    PdfJsViewerModule,
    NgxGalleryModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    AddressValidationDialogComponent,
    ConfirmationDialogComponent,
    CustomerSearchComponent,
    CustomerSearchDialogComponent,
    CustomerSearchResultsComponent,
    DuplicateJobComponent,
    FilePreviewComponent,
    FilePreviewImagesComponent,
    FilePreviewModalWrapperComponent,
    FileUploadMultiFileComponent,
    FileUploadPrintBrokerComponent,
    FileUploadComponent,
    InformationDialogComponent,
    OrderSummaryComponent,
    OrderConfirmationDialogComponent,
    PrintTicketsWrapperComponent,
    PrintQuoteTicketsComponent,
    PrintTicketsComponent,
    SaveForLaterDialogComponent,
    SendEmailComponent,
    TimeOutDialogComponent,
    CustomerInformationComponent,
    ReorderDialogComponent,
    ProgressCheckComponent,
    WesLeadResultComponent,
    NewWesLeadComponent,
    SaveforlaterCustomerDialogComponent
  ],
  exports: [
    AddressValidationDialogComponent,
    ConfirmationDialogComponent,
    CustomerSearchComponent,
    CustomerSearchDialogComponent,
    CustomerSearchResultsComponent,
    DuplicateJobComponent,
    FilePreviewComponent,
    FilePreviewImagesComponent,
    FilePreviewModalWrapperComponent,
    FileUploadMultiFileComponent,
    FileUploadPrintBrokerComponent,
    FileUploadComponent,
    InformationDialogComponent,
    OrderSummaryComponent,
    OrderConfirmationDialogComponent,
    PrintTicketsWrapperComponent,
    PrintQuoteTicketsComponent,
    PrintTicketsComponent,
    SaveForLaterDialogComponent,
    SendEmailComponent,
    TimeOutDialogComponent,
    CustomerInformationComponent,
    ReorderDialogComponent,
    ProgressCheckComponent,
    WesLeadResultComponent,
    NewWesLeadComponent,
    SaveforlaterCustomerDialogComponent
  ],
  entryComponents: [
    FileUploadComponent,
    FileUploadPrintBrokerComponent,
    FileUploadMultiFileComponent,
    ConfirmationDialogComponent,
    InformationDialogComponent,
    DuplicateJobComponent,
    CustomerSearchDialogComponent,
    SendEmailComponent,
    PrintTicketsWrapperComponent,
    OrderConfirmationDialogComponent,
    ReorderDialogComponent,
    TimeOutDialogComponent,
    FilePreviewModalWrapperComponent,
    AddressValidationDialogComponent,
    SaveForLaterDialogComponent,
    ProgressCheckComponent,
    WesLeadResultComponent,
    NewWesLeadComponent,
    SaveforlaterCustomerDialogComponent
  ],
  providers: [
    ConfigurationScreenService,
    CustomerSearchService,
    EchCustomerService,
    OrderService,
    TableSortService,
    AddressValidationService,
    ValidatorsService,
    WesleadsService
  ]
})
export class SharedModule { }
