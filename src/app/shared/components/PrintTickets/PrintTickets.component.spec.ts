import { PrintTicketsComponent } from './PrintTickets.component';
import { ValidatorsService } from '../../../services';

describe('PrintTicketsComponent', () => {
  let component: PrintTicketsComponent;
  let validatorsService: ValidatorsService;
  let data: any;

  beforeEach(() => {
    data = {};
    validatorsService = new ValidatorsService(null);
    component = new PrintTicketsComponent(null, null, validatorsService, null, null, null, data, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
