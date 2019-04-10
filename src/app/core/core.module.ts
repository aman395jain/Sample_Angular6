import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {TopnavbarComponent} from '@app/core/header/topnavbar/topnavbar.component';
import {AuthService} from '@app/core/Services/auth/auth.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {LoginPageComponent} from '@app/core/login/login-page/login-page.component';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {BackgroundTaskStatusService} from '@app/core/Services/background-task-status/background-task-status.service';
import {CanDeactivateGuardService} from '@app/core/Services/can-deactivate-guard/can-deactivate-guard.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {PersistService} from '@app/core/Services/persist/persist.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {VersionCheckService} from '@app/core/Services/versioncheckservice/VersionCheckService';
import {PageNotFoundComponent} from '@app/core/components/page-not-found/page-not-found.component';
import {CoreRoutingModule} from '@app/core/core-routing.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {UtilsModule} from '@app/utils/utils.module';
import {MomentModule} from 'angular2-moment';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialComponentsModule} from '@app/material-components.module';
import {BackgroundTaskStatusComponent} from '@app/core/components/background-task-status/background-task-status.component';
import {PersistenceModule} from 'angular-persistence';
import {ErrorInterceptor} from '@app/config/ErrorInterceptor';
import {JwtInterceptor} from '@app/config/JwtInterceptor';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {TextMaskModule} from 'angular2-text-mask';
import {SharedModule} from '@app/shared/shared.module';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';
import {ShippingService} from '@app/pages/check-out/services/shipping/shipping.service';
import { StoreInfoComponent } from './header/store-info/store-info.component';

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    PersistenceModule,
    HttpClientModule,
    TextMaskModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    UtilsModule,
    MomentModule
  ],
  declarations: [
    TopnavbarComponent,
    LoginPageComponent,
    PageNotFoundComponent,
    BackgroundTaskStatusComponent,
    StoreInfoComponent,
  ],
  exports: [
    TopnavbarComponent,
    LoginPageComponent,
    PageNotFoundComponent,
    BackgroundTaskStatusComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthService,
    OrderConfigService,
    SharedDataService,
    AuthGuard,
    BackgroundTaskStatusService,
    CanDeactivateGuardService,
    LoggerService,
    NotificationService,
    PersistService,
    StoreinfoService,
    UserInfoService,
    VersionCheckService,
    FileUploadService,
    ShippingService
  ]
})
export class CoreModule { }
