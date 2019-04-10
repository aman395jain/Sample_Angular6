import { ReviewComponent } from './review.component';
import { ValidatorsService } from '@app/services';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new ReviewComponent(null, validatorsService, null, null, null, null, null, null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
