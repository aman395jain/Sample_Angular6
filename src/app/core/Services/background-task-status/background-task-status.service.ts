import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundTaskStatusService {

  public showStatusWindow = false;
  public expanded = false;
  public taskChanged = new BehaviorSubject(false);
  /*public tasks = {12345: new BackgroundTask("12314: Sending file to flightdeck", "indeterminate",
      0,false), 12344: new BackgroundTask("12314: Sending file to flightdeck", "indeterminate",
      0,false)};*/
  public tasks = {};
  public  mastTaskList = {};


  toggleStatusWindow() {
    this.showStatusWindow = !this.showStatusWindow;
  }

  deleteTask(key) {
    if (this.tasks.hasOwnProperty(key)) {
      delete this.tasks[key];
    }

    if (this.mastTaskList.hasOwnProperty(key)) {
      delete this.mastTaskList[key];
    }

    this.taskChanged.next(true);
    if (Object.keys(this.tasks).length === 0 ) {
      this.toggleStatusWindow();
    }
  }

  hideTask(key) {
    if (this.tasks.hasOwnProperty(key)) {
      delete this.tasks[key];
    }

    this.taskChanged.next(true);
    if (Object.keys(this.tasks).length === 0 ) {
      this.toggleStatusWindow();
    }
  }

  addTask(id, task) {
    this.tasks[id] = task;
    this.mastTaskList[id] = task;
    this.taskChanged.next(true);
    if (!this.showStatusWindow) {
      this.showStatusWindow = true;
    }
    this.expanded = true;
  }

  getTasks(): Observable<any> {
    return of(Object.keys(this.tasks));
  }

  checkIfTaskRunning() {
    if (Object.keys(this.mastTaskList).length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
