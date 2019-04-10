import {IRow} from '@app/pages/tictactoe/services/matrix/matrix.service';
import {State} from '@app/pages/tictactoe/models/states';
import {ICell} from '@app/pages/tictactoe/models/ICell';

export function easyStrategy(rows: IRow[], targetState: State): void {
  const candidates: ICell[] = [], xRef: {[id: number]: ICell} = {};
  for (let x = 0; x < rows.length; x += 1) {
    const row = rows[x];
    for (let y = 0; y < row.length; y += 1) {
      const cell = row[y], id = cell.row * 3 + cell.col;
      if (cell.state === State.None && xRef[id] === undefined) {
        candidates.push(cell);
        xRef[id] = cell;
      }
    }
    if (candidates.length > 0) {
      candidates[Math.floor(Math.random() * candidates.length)].state = targetState;
      return;
    }
  }
}
