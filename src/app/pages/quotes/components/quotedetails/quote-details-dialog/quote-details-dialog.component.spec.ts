import { QuoteDetailsDialogComponent } from './quote-details-dialog.component';

describe('QuoteDetailsDialogComponent', () => {
  let component: QuoteDetailsDialogComponent;

  beforeEach(() => {
    component = new QuoteDetailsDialogComponent(null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
