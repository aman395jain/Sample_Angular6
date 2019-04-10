import { LoggerService } from './logger-service.service';

describe('LoggerService', () => {
  let component: LoggerService;

  beforeEach(() => {
    component = new LoggerService(null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
