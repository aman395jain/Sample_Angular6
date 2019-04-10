import { StoreNumberDialogComponent } from './store-number-dialog.component';
import { ValidatorsService } from '../../../services/validators/validators.service';

describe('StoreNumberDialogComponent', () => {
  let component: StoreNumberDialogComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new StoreNumberDialogComponent(null, null, null, validatorsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
