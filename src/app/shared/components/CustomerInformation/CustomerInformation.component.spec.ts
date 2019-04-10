import { CustomerInformationComponent } from './CustomerInformation.component';
import { ValidatorsService } from '@app/services';

describe('CustomerInformationComponent', () => {
  let component: CustomerInformationComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new CustomerInformationComponent(null, validatorsService, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
