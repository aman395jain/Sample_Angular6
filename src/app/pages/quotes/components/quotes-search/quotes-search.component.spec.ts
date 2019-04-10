import { QuotesSearchComponent } from './quotes-search.component';
import { ValidatorsService } from '@app/services';

describe('QuotesSearchComponent', () => {
  let component: QuotesSearchComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new QuotesSearchComponent(null, null, null, null, validatorsService, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
