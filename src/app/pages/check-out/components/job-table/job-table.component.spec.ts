import { JobTableComponent } from './job-table.component';

describe('JobTableComponent', () => {
  let component: JobTableComponent;

  beforeEach(() => {
    component = new JobTableComponent(null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
