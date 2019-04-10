import { ManageQuotesComponent } from './manage-quotes.component';

describe('ManageQuotesComponent', () => {
  let component: ManageQuotesComponent;

  beforeEach(() => {
    component = new ManageQuotesComponent(null, null, null, null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
