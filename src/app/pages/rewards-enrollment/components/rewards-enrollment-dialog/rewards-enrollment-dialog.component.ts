import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-rewards-enrollment-dialog',
  templateUrl: './rewards-enrollment-dialog.component.html',
  styleUrls: ['./rewards-enrollment-dialog.component.css']
})
export class RewardsEnrollmentDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RewardsEnrollmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 

  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
