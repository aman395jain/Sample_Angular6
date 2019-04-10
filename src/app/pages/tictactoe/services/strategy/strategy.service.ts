import { Injectable } from '@angular/core';
import {easyStrategy} from '../../models/strategy-easy';
import {hardStrategy} from '../../models/strategy-hard';
import {IRow} from '../matrix/matrix.service';
import {State} from '../../models/states';

@Injectable({
  providedIn: 'root'
})
export class StrategyService {

  constructor() { }

  public easyMode = false;

  public executeStrategy(rows: IRow[], targetState: State) {
    const strategy: (rows: IRow[], targetState: State) => void =
      this.easyMode ? easyStrategy : hardStrategy;
    strategy(rows, targetState);
  }
}
