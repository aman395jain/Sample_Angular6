import { CheckOutComponent } from './check-out.component';

describe('CheckOutComponent', () => {
  let component: CheckOutComponent;

  beforeEach(() => {
    component = new CheckOutComponent(null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
