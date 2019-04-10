import { StoreinfoService } from './storeinfo.service';

describe('StoreinfoService', () => {
  let component: StoreinfoService;

  beforeEach(() => {
    component = new StoreinfoService(null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
