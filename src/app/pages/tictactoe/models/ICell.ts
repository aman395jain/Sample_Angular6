import {State} from '@app/pages/tictactoe/models/states';

export interface ICell {
  row: number;
  col: number;
  state: State;
  winningCell: boolean;
}
