import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import 'hammerjs';
import {CoreModule} from '@app/core/core.module';
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import {RouterModule} from '@angular/router';
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// AoT requires an exported function for factories
// https://github.com/ngx-translate/core
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    LoadingModule,
    RouterModule,
    NgIdleKeepaliveModule.forRoot()
  ],
  bootstrap: [AppComponent],
  providers: [
  ]
})
export class AppModule { }
