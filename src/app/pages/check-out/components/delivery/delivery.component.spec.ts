import { DeliveryComponent } from './delivery.component';
import { ValidatorsService } from '@app/services';

describe('DeliveryComponent', () => {
  let component: DeliveryComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new DeliveryComponent(null, validatorsService, null, null, null, null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
