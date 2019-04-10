import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicTacToeWrapperComponent } from './tic-tac-toe-wrapper.component';

describe('TicTacToeWrapperComponent', () => {
  let component: TicTacToeWrapperComponent;
  let fixture: ComponentFixture<TicTacToeWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicTacToeWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicTacToeWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
