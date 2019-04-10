import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {State} from '@app/pages/tictactoe/models/states';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit {

  private static _counter = 1;
  private cellQuote = '';

  public id: number;
  public backgroundColor: string;

  @Input() public row: number;
  @Input() public col: number;
  @Input() public cellState: State;
  @Input() public validTurn: boolean;
  @Input() winningCell: boolean;

  @Output() public stateChangeRequested: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor( ) {
    this.id = CellComponent._counter;
    CellComponent._counter += 1;
  }

  ngOnInit() {
  }



  public get cellText(): string {
    if (this.cellState === State.O) {
      return 'O';
    } else if (this.cellState === State.X) {
      return 'X';
    }

    return this.cellQuote;
  }

  public set(): void {
    if (this.cellState === State.None) {
      if (this.validTurn) {
        this.stateChangeRequested.emit(true);
      }
    }
  }

}
