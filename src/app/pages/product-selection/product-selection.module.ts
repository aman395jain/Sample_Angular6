import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProductSelectionComponent} from '@app/pages/product-selection/product-selection.component';
import {ProductMutationObserverDirective} from '@app/pages/product-selection/product-mutation-observer.directive';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';
import {MaterialComponentsModule} from '@app/material-components.module';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {TreeModule} from 'angular-tree-component';
import {ProductsService} from '@app/pages/product-selection/services/products/products.service';

const routes: Routes = [
  {path: '', component: ProductSelectionComponent, pathMatch: 'full', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    MaterialComponentsModule,
    RouterModule.forChild(routes),
    TreeModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    ProductSelectionComponent,
    ProductMutationObserverDirective
  ],
  exports: [
    ProductSelectionComponent,
    ProductMutationObserverDirective
  ],
  providers: [
    ProductsService
  ]
})
export class ProductSelectionModule { }
