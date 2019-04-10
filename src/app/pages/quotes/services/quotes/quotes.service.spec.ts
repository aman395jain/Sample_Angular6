import { QuotesService } from './quotes.service';

describe('QuotesService', () => {
  let component: QuotesService;

  beforeEach(() => {
    component = new QuotesService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
