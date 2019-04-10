import { TimeOutDialogComponent } from './time-out-dialog.component';

describe('TimeOutDialogComponent', () => {
  let component: TimeOutDialogComponent;

  beforeEach(() => {
    component = new TimeOutDialogComponent(null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
