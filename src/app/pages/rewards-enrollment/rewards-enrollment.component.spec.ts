import { RewardsEnrollmentComponent } from './rewards-enrollment.component';
import { ValidatorsService } from '@app/services';

describe('RewardsEnrollmentComponent', () => {
  let component: RewardsEnrollmentComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new RewardsEnrollmentComponent(null, validatorsService, null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
