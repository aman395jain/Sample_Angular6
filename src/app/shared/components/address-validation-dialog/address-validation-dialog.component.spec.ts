import { AddressValidationDialogComponent } from './address-validation-dialog.component';

describe('AddressValidationDialogComponent', () => {
  let component: AddressValidationDialogComponent;

  beforeEach(() => {
    component = new AddressValidationDialogComponent(null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
