import { TestBed, inject } from '@angular/core/testing';

import { BackgroundTaskStatusService } from './background-task-status.service';

describe('BackgroundTaskStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackgroundTaskStatusService]
    });
  });

  it('should be created', inject([BackgroundTaskStatusService], (service: BackgroundTaskStatusService) => {
    expect(service).toBeTruthy();
  }));
});
