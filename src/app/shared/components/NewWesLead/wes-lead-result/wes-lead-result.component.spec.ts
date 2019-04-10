import { WesLeadResultComponent } from './wes-lead-result.component';

describe('WesLeadResultComponent', () => {
  let component: WesLeadResultComponent;
  let data: any;

  beforeEach(() => {
    data = {};
    component = new WesLeadResultComponent(null, data, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
