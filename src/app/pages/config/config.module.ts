import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialComponentsModule} from '@app/material-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';
import {ProductPreviewComponent} from '@app/pages/config/components/product-preview/product-preview.component';
import {ExceptionPageComponent} from '@app/pages/config/components/ExceptionPage/ExceptionPage.component';
import {TabsComponent} from '@app/pages/config/components/CustomInputDialog/Tabs/Tabs.component';
import {CustomInputDialogComponent} from '@app/pages/config/components/CustomInputDialog/CustomInputDialog.component';
import {ConfigSummaryComponent} from '@app/pages/config/components/ConfigSummary/ConfigSummary.component';
import {JobTabsComponent} from '@app/pages/config/components/job-tabs/job-tabs.component';
import {AttrOptionSelectorModalComponent} from '@app/pages/config/components/attr-option-selector-modal/attr-option-selector-modal.component';
import {ConfigoptionsComponent} from '@app/pages/config/components/configoptions/configoptions.component';
import {NonTabComponent} from '@app/pages/config/components/CustomInputDialog/NonTab/NonTab.component';
import {CustomInputHostDirective} from '@app/pages/config/components/CustomInputDialog/CustomInputHost.directive';
import {ConfigComponent} from '@app/pages/config/config.component';
import {AttributeOptionMessageDialogComponent} from '@app/pages/config/components/attribute-option-message-dialog/attribute-option-message-dialog.component';
import {PdfJsViewerModule} from 'ng2-pdfjs-viewer';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {SharedModule} from '@app/shared/shared.module';
import {UtilsModule} from '@app/utils/utils.module';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {CanDeactivateGuardService} from '@app/core/Services/can-deactivate-guard/can-deactivate-guard.service';
import { InformationDialogComponent } from '@app/shared/components/information-dialog/information-dialog.component';

const routes: Routes = [
  {path: '', component: ConfigComponent, pathMatch: 'full', canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuardService] }
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    PdfJsViewerModule,
    SharedModule,
    UtilsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    ConfigComponent,
    ProductPreviewComponent,
    JobTabsComponent,
    ExceptionPageComponent,
    CustomInputDialogComponent,
    ConfigSummaryComponent,
    ConfigoptionsComponent,
    AttributeOptionMessageDialogComponent,
    AttrOptionSelectorModalComponent,
    NonTabComponent,
    TabsComponent,
    CustomInputHostDirective
  ],
  entryComponents: [
    AttributeOptionMessageDialogComponent,
    AttrOptionSelectorModalComponent,
    TabsComponent,
    NonTabComponent,
    CustomInputDialogComponent,
    ExceptionPageComponent,
    InformationDialogComponent
  ],
  exports: [
    ConfigComponent,
    ProductPreviewComponent,
    JobTabsComponent,
    ExceptionPageComponent,
    CustomInputDialogComponent,
    ConfigSummaryComponent,
    ConfigoptionsComponent,
    AttributeOptionMessageDialogComponent,
    AttrOptionSelectorModalComponent,
    NonTabComponent,
    TabsComponent,
    CustomInputHostDirective
  ]
})
export class ConfigModule { }

