import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';

@Component({
  selector: 'app-attribute-option-message-dialog',
  templateUrl: './attribute-option-message-dialog.component.html',
  styleUrls: ['./attribute-option-message-dialog.component.css']
})
export class AttributeOptionMessageDialogComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    public orderConfigService: OrderConfigService,
    public dialogRef: MatDialogRef<AttributeOptionMessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onOk() {
    this.dialogRef.close(true);
  }

}
