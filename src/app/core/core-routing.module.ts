import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {LoginPageComponent} from '@app/core/login/login-page/login-page.component';
import {PageNotFoundComponent} from '@app/core/components/page-not-found/page-not-found.component';


const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full'   },
  { path: 'staplesrewards', loadChildren: '@app/pages/rewards-enrollment/rewards-enrollment.module#RewardsEnrollmentModule', canActivate: [AuthGuard]},
  { path: 'checkout', loadChildren: '@app/pages/check-out/check-out.module#CheckOutModule', canActivate: [AuthGuard] },
  { path: 'manageQuotes', loadChildren: '@app/pages/quotes/quotes.module#QuotesModule', canActivate: [AuthGuard] },
  { path: 'product', loadChildren: '@app/pages/product-selection/product-selection.module#ProductSelectionModule', canActivate: [AuthGuard] },
  { path: 'config', loadChildren: '@app/pages/config/config.module#ConfigModule', pathMatch: 'full', canActivate: [AuthGuard], runGuardsAndResolvers: 'always' },
  { path: 'login', component: LoginPageComponent, pathMatch: 'full'},
  { path: 'search', loadChildren: '@app/pages/find-customer/find-customer.module#FindCustomerModule', pathMatch: 'full', canActivate: [AuthGuard]},
  { path: 'wesleads', loadChildren: '@app/pages/wesleads/wes-leads.module#WesLeadsModule', pathMatch: 'full', canActivate: [AuthGuard]  },
  { path: 'staplesrewards', loadChildren: '@app/pages/rewards-enrollment/rewards-enrollment.module#RewardsEnrollmentModule', canActivate: [AuthGuard]},
  { path: 'checkout', loadChildren: '@app/pages/check-out/check-out.module#CheckOutModule', canActivate: [AuthGuard] },
  { path: 'tictactoe', loadChildren: '@app/pages/tictactoe/tic-tac-toe.module#TicTacToeModule', canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class CoreRoutingModule { }