import { PrintQuoteTicketsComponent } from './PrintQuoteTickets.component';
import { ValidatorsService } from '../../../services';

describe('PrintQuoteTicketsComponent', () => {
  let component: PrintQuoteTicketsComponent;
  let validatorsService: ValidatorsService;
  let data: any;

  beforeEach(() => {
    data = {};
    validatorsService = new ValidatorsService(null);
    component = new PrintQuoteTicketsComponent(null, null, null, validatorsService, null, data, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
