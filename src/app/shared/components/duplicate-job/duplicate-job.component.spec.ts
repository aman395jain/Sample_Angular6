import { DuplicateJobComponent } from './duplicate-job.component';
import { OrderService, StoreinfoService } from '../../../services';
import { MatDialogRef } from '@angular/material/dialog';
import { PersistService } from '../../services/persist/persist.service';
import { HttpClient } from '@angular/common/http';

describe('DuplicateJobComponent', () => {
  let component: DuplicateJobComponent;
  let orderService: OrderService;
  let storeInfoService: StoreinfoService;
  let dialogRef: MatDialogRef<DuplicateJobComponent>;
  let persistService: PersistService;
  let http: HttpClient;
  let data: any;

  beforeEach(() => {
    persistService = jasmine.createSpyObj(['containsKey', 'get']);
    http = new HttpClient(null);
    storeInfoService = new StoreinfoService(persistService, null, http);
    orderService = new OrderService(storeInfoService, http);
    data = {};
    component = new DuplicateJobComponent(dialogRef, null, null, null, null, null, null, null, null, null, orderService, data);
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
