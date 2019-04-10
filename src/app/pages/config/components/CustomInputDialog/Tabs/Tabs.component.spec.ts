import { TabsComponent } from './Tabs.component';
import { ValidatorsService } from '@app/services';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let validatorsService: ValidatorsService;

  beforeEach(() => {
    validatorsService = new ValidatorsService(null);
    component = new TabsComponent(null, null, null, null, validatorsService, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
