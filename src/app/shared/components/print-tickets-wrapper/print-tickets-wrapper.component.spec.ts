import { PrintTicketsWrapperComponent } from './print-tickets-wrapper.component';

describe('PrintTicketsWrapperComponent', () => {
  let component: PrintTicketsWrapperComponent;
  let data: any;

  beforeEach(() => {
    data = {};
    component = new PrintTicketsWrapperComponent(null, null, data);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
