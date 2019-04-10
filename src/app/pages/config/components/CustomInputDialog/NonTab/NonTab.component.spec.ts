import { NonTabComponent } from './NonTab.component';
import { ValidatorsService } from '@app/services';

describe('NonTabComponent', () => {
  let component: NonTabComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new NonTabComponent(null, null, null, null, validatorsService, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
