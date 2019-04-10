import { ConfirmationDialogComponent } from './ConfirmationDialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;

  beforeEach(() => {
    component = new ConfirmationDialogComponent(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
