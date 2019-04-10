import {Component, Inject, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-file-preview-modal-wrapper',
  templateUrl: './file-preview-modal-wrapper.component.html',
  styleUrls: ['./file-preview-modal-wrapper.component.css']
})
export class FilePreviewModalWrapperComponent implements OnInit {

  public innerHeight;

  constructor(
    public dialogRef: MatDialogRef<FilePreviewModalWrapperComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog

  ) { }

  ngOnInit() {
    this.innerHeight = window.innerHeight - 90;

  }

}
