import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let component: StepperComponent;

  beforeEach(() => {
    component = new StepperComponent(null, null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
