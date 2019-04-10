import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {Idle} from '@ng-idle/core';
import {Router} from '@angular/router';
import {AuthService} from '@app/core/Services/auth/auth.service';

@Component({
  selector: 'app-time-out-dialog',
  templateUrl: './time-out-dialog.component.html',
  styleUrls: ['./time-out-dialog.component.css']
})
export class TimeOutDialogComponent implements OnInit {

  public countdown: number;

  constructor(
    public dialogRef: MatDialogRef<TimeOutDialogComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private idle: Idle,
    private auth: AuthService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.countdown = countdown;

      if ( this.countdown === 1 ) {
        this.logout();
      }
    });
  }

  logout() {
    this.auth.logout();
    this.dialogRef.close(true);
    this.dialog.closeAll();
    this.router.navigate([ '/login' ]);
  }

  stayConnected() {
    this.dialogRef.close(false);
  }
}
