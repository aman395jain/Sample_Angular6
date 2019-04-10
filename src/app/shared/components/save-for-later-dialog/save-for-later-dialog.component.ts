import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-save-for-later-dialog',
  templateUrl: './save-for-later-dialog.component.html',
  styleUrls: ['./save-for-later-dialog.component.css']
})
export class SaveForLaterDialogComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    public dialogRef: MatDialogRef<SaveForLaterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
  }

  createNewOrder() {
    this.dialogRef.close(this.data.orderNumber);
  }

}
