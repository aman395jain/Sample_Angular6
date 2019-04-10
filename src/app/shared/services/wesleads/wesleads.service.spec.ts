import { WesleadsService } from './wesleads.service';

describe('WesleadsService', () => {
  let component: WesleadsService;

  beforeEach(() => {
    component = new WesleadsService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
