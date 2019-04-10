import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WesleadsComponent} from '@app/pages/wesleads/wesleads.component';
import {WesmodalComponent} from '@app/pages/wesleads/components/wesmodal/wesmodal.component';
import {WesDetailsComponent} from '@app/pages/wesleads/components/wes-details/wes-details.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';
import {MaterialComponentsModule} from '@app/material-components.module';
import {TextMaskModule} from 'angular2-text-mask';
import {UtilsModule} from '@app/utils/utils.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {SharedModule} from '@app/shared/shared.module';

const routes: Routes = [
  {path: '', component: WesleadsComponent, pathMatch: 'full', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    RouterModule.forChild(routes),
    TextMaskModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
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
    WesleadsComponent,
    WesmodalComponent,
    WesDetailsComponent
  ],
  exports: [
    WesleadsComponent,
    WesmodalComponent,
    WesDetailsComponent
  ]
})
export class WesLeadsModule { }
