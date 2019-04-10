import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialComponentsModule} from '@app/material-components.module';
import {DueDateComponent} from '@app/pages/check-out/components/delivery/due-date/due-date.component';
import {DeliveryComponent} from '@app/pages/check-out/components/delivery/delivery.component';
import {JobTableComponent} from '@app/pages/check-out/components/job-table/job-table.component';
import {HttpClient} from '@angular/common/http';
import {HttpLoaderFactory} from '@app/app.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {ReviewComponent} from '@app/pages/check-out/components/review/review.component';
import {StepperComponent} from '@app/pages/check-out/components/stepper/stepper.component';
import {CheckOutComponent} from '@app/pages/check-out/check-out.component';
import {CustomerInformationComponent} from '@app/shared/components/CustomerInformation/CustomerInformation.component';
import {ButtonsTotalComponent} from '@app/pages/check-out/components/buttons-total/buttons-total.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {UtilsModule} from '@app/utils/utils.module';
import {TextMaskModule} from 'angular2-text-mask';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {SharedModule} from '@app/shared/shared.module';
import {ShippingService} from '@app/pages/check-out/services/shipping/shipping.service';

const routes: Routes = [
  {path: '', component: CheckOutComponent, pathMatch: 'full', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    UtilsModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    TextMaskModule
  ],
  declarations: [
    DueDateComponent,
    DeliveryComponent,
    JobTableComponent,
    ReviewComponent,
    StepperComponent,
    CheckOutComponent,
    ButtonsTotalComponent
  ],
  entryComponents: [
    DueDateComponent
  ],
  exports: [
    DueDateComponent,
    DeliveryComponent,
    JobTableComponent,
    ReviewComponent,
    StepperComponent,
    CheckOutComponent,
    ButtonsTotalComponent
  ],
  providers: [
    ShippingService
  ]
})
export class CheckOutModule { }
