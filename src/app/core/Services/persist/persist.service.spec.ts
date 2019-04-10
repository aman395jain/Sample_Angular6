import { PersistService } from './persist.service';

describe('PersistService', () => {
  let component: PersistService;

  beforeEach(() => {
    component = new PersistService(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
