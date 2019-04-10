import { TestBed, inject } from '@angular/core/testing';

import { TableSortService } from './table-sort.service';

describe('TableSortService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableSortService]
    });
  });

  it('should be created', inject([TableSortService], (service: TableSortService) => {
    expect(service).toBeTruthy();
  }));
});
