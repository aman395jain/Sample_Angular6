import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-address-validation-dialog',
  templateUrl: './address-validation-dialog.component.html',
  styleUrls: ['./address-validation-dialog.component.css']
})
export class AddressValidationDialogComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    public dialogRef: MatDialogRef<AddressValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  suggestedAddress() {
    this.dialogRef.close('change');
  }

  inputtedAddress() {
    this.dialogRef.close('keep');
  }

}
