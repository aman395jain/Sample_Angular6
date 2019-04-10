import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WonQuoteComponent} from '@app/pages/quotes/components/won-quote/won-quote.component';
import {CancelledQuoteComponent} from '@app/pages/quotes/components/cancelled-quote/cancelled-quote.component';
import {ManageQuotesComponent} from '@app/pages/quotes/manage-quotes.component';
import {QuoteDetailsDialogComponent} from '@app/pages/quotes/components/quotedetails/quote-details-dialog/quote-details-dialog.component';
import {QuoteDetailsComponent} from '@app/pages/quotes/components/quotedetails/quote-details.component';
import {LostQuoteComponent} from '@app/pages/quotes/components/lost-quote/lost-quote.component';
import {QuotesSearchComponent} from '@app/pages/quotes/components/quotes-search/quotes-search.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';
import {MaterialComponentsModule} from '@app/material-components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UtilsModule} from '@app/utils/utils.module';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {SharedModule} from '@app/shared/shared.module';

const routes: Routes = [
  {path: '', component: ManageQuotesComponent, pathMatch: 'full', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
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
    ManageQuotesComponent,
    WonQuoteComponent,
    QuoteDetailsComponent,
    QuoteDetailsDialogComponent,
    LostQuoteComponent,
    CancelledQuoteComponent,
    QuotesSearchComponent
  ],
  entryComponents: [
    WonQuoteComponent,
    LostQuoteComponent,
    CancelledQuoteComponent,
    QuoteDetailsDialogComponent
  ],
  exports: [
    ManageQuotesComponent,
    WonQuoteComponent,
    QuoteDetailsComponent,
    QuoteDetailsDialogComponent,
    LostQuoteComponent,
    CancelledQuoteComponent,
    QuotesSearchComponent
  ],
  providers: [
    QuotesService
  ]
})
export class QuotesModule { }
