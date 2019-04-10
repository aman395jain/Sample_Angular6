import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicTacToeWrapperComponent } from './tic-tac-toe-wrapper.component';
import { CellComponent } from './components/cell/cell.component';
import { TicTacToeBoardComponent } from './components/tic-tac-toe-board/tic-tac-toe-board.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '@app/core/Services/auth/AuthGuard';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialComponentsModule} from '@app/material-components.module';
import {MatrixService} from '@app/pages/tictactoe/services/matrix/matrix.service';
import {StrategyService} from '@app/pages/tictactoe/services/strategy/strategy.service';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@app/app.module';
import {HttpClient} from '@angular/common/http';

const routes: Routes = [
  {path: '', component: TicTacToeWrapperComponent, pathMatch: 'full', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MaterialComponentsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [TicTacToeWrapperComponent, CellComponent, TicTacToeBoardComponent],
  exports: [
    TicTacToeWrapperComponent, CellComponent, TicTacToeBoardComponent
  ],
  providers: [
    MatrixService,
    StrategyService,
  ]
})
export class TicTacToeModule { }
