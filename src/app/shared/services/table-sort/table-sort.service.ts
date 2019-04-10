import { Injectable } from '@angular/core';

@Injectable()
export class TableSortService {

  constructor() { }

  public compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
