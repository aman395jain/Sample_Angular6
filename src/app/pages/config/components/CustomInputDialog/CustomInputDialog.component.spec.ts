import { CustomInputDialogComponent } from './CustomInputDialog.component';

describe('CustomInputDialogComponent', () => {
  let component: CustomInputDialogComponent;

  beforeEach(() => {
    component = new CustomInputDialogComponent(null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
