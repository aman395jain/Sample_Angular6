import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';
import {MaterialComponentsModule} from '@app/material-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TextMaskModule} from 'angular2-text-mask';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {UtilsModule} from '@app/utils/utils.module';
import {SharedModule} from '@app/shared/shared.module';
import {CustomerService} from '@app/pages/find-customer/services/customer/customer.service';
import {CustomerDetailComponent} from '@app/pages/find-customer/components/CustomerDetail/customer-detail.component';
import {FindCustomerWrapperComponent} from '@app/pages/find-customer/find-customer-wrapper.component';
import {StoreNumberDialogComponent} from '@app/pages/find-customer/components/StoreNumberDialog/store-number-dialog.component';


const routes: Routes = [
  {path: '', component: FindCustomerWrapperComponent, pathMatch: 'full', canActivate: [AuthGuard], }
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    UtilsModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    CustomerDetailComponent,
    StoreNumberDialogComponent,
    FindCustomerWrapperComponent
  ],
  exports: [
    CustomerDetailComponent,
    StoreNumberDialogComponent,
    FindCustomerWrapperComponent
  ],
  entryComponents: [
  ],
  providers: [
    CustomerService
  ]
})
export class FindCustomerModule { }
