import { ConfigComponent } from './config.component';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let translateService: TranslateService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
      })],
      providers: [TranslateService]
    }).compileComponents();
    translateService = TestBed.get(TranslateService);
  }));

  beforeEach(() => {
    component = new ConfigComponent(null, null, null, null, null, null, translateService, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
