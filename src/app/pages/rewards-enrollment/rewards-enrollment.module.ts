import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RewardsEnrollmentComponent} from '@app/pages/rewards-enrollment/rewards-enrollment.component';
import {RewardsEnrollmentDialogComponent} from '@app/pages/rewards-enrollment/components/rewards-enrollment-dialog/rewards-enrollment-dialog.component';
import {MaterialComponentsModule} from '@app/material-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';
import {TextMaskModule} from 'angular2-text-mask';
import {RouterModule, Routes} from '@angular/router';
import {CheckOutComponent} from '@app/pages/check-out/check-out.component';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {RewardsEnrollmentService} from '@app/pages/rewards-enrollment/services/rewards-enrollment/rewards-enrollment.service';
import {SharedModule} from '@app/shared/shared.module';


const routes: Routes = [
  {path: '', component: RewardsEnrollmentComponent, pathMatch: 'full', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    TextMaskModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    RewardsEnrollmentComponent,
    RewardsEnrollmentDialogComponent
  ],
  providers: [
    RewardsEnrollmentService
  ],
  exports: [
    RewardsEnrollmentComponent,
    RewardsEnrollmentDialogComponent
  ],
  entryComponents: [
    RewardsEnrollmentDialogComponent
  ]
})
export class RewardsEnrollmentModule { }
