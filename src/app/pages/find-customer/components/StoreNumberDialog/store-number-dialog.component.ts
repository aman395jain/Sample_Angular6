import {Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';


@Component({
  selector: 'app-store-number-dialog',
  templateUrl: './store-number-dialog.component.html',
  styleUrls: ['./store-number-dialog.component.css']
})

export class StoreNumberDialogComponent implements AfterViewInit {
  storeNumber = this.validators.getStoreNumberVal();

  @ViewChild('focusElement') focusEl: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<StoreNumberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public storeInfoService: StoreinfoService,
    public validators: ValidatorsService
  ) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusEl.nativeElement.focus();
    }, 500);
  }

  onNoClick() {
    this.dialogRef.close();
  }

  saveStoreNum() {
    this.storeInfoService.setStoreNumber(parseInt(this.storeNumber.value));
    this.dialogRef.close();
  }

  saveStoreNumWithEnter($event) {
    if ($event.keyCode === 13 && !this.storeNumber.invalid) {
      this.saveStoreNum();
    }
  }
}
