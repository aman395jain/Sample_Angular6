import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/index';
import {BackgroundTaskStatusService} from '../../Services/background-task-status/background-task-status.service';

@Component({
  selector: 'app-background-task-status',
  templateUrl: './background-task-status.component.html',
  styleUrls: ['./background-task-status.component.css'],
})
export class BackgroundTaskStatusComponent implements OnInit {

  public tasksKeyList = new Observable<any>();

  constructor(
    public statusService: BackgroundTaskStatusService
  ) { }

  ngOnInit() {
    this.statusService.taskChanged.subscribe( result => {
      this.tasksKeyList = this.statusService.getTasks();
    });
  }

  hideStatusWindow() {
    this.statusService.toggleStatusWindow();
  }

  cancelTask(key) {
    this.statusService.hideTask(key);
  }

}
