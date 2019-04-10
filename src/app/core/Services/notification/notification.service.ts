import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/publish';
import {SnackNotification} from '@app/models/SnackNotification';


@Injectable()
export class NotificationService {

  private _notification: BehaviorSubject<SnackNotification> = new BehaviorSubject(null);
  readonly _notification$: Observable<SnackNotification> = this._notification.asObservable();

  private _loading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  readonly _loading$: Observable<boolean> = this._loading.asObservable();

  constructor() {}

  notify(message: SnackNotification) {
    this._notification.next(message);
  }

  showLoader() {
    this._loading.next(true);
  }

  hideLoader() {
    this._loading.next(false);
  }

}
