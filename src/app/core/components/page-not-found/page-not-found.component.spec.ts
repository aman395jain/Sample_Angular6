import { PageNotFoundComponent } from './page-not-found.component';

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent;

  beforeEach(() => {
    component = new PageNotFoundComponent(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
