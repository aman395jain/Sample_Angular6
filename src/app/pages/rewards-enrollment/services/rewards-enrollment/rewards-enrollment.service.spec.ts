import { RewardsEnrollmentService } from './rewards-enrollment.service';

describe('RewardsEnrollmentService', () => {
  let component: RewardsEnrollmentService;

  beforeEach(() => {
    component = new RewardsEnrollmentService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
