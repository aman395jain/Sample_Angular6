import { ErrorHandler, Injectable, Injector} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ObjectUnsubscribedError } from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {SnackNotification} from '@app/models/SnackNotification';


@Injectable()
export class ErrorsHandler implements ErrorHandler {
  constructor(
    private injector: Injector,
    public snackBar: MatSnackBar,
    private logger: LoggerService
  ) {}

  handleError(error: any | Error | HttpErrorResponse) {
    const notificationService = this.injector.get(NotificationService);
    const router = this.injector.get(Router);
    this.logger.error(error);
    if (error instanceof HttpErrorResponse) {
    // Server error happened
      if (!navigator.onLine) {
        // No Internet connection
        return notificationService.notify(new SnackNotification('No Internet Connection', null));
      }
      // Http Error
      return notificationService.notify(new SnackNotification(`${error.status} - ${error.message}`, null));
    } else if (error instanceof TypeError || error instanceof ObjectUnsubscribedError || error.name === 'ObjectUnsubscribedError' ||
      error.message.indexOf('ExpressionChangedAfterItHasBeenCheckedError') !== -1) {

    } else if (!error.errorPage) {
      return notificationService.notify(new SnackNotification(error.message, 5000));
    } else {
      router.navigate(['/error'], { queryParams: {error: error} });
    }
    notificationService.hideLoader();
  }
}

