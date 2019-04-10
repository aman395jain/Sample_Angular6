import { Injectable } from '@angular/core';
import { CanDeactivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
 canDeactivate: (nextState: RouterStateSnapshot) => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuardService implements CanDeactivate<CanComponentDeactivate> {
  public checkoutButtonActive: Boolean = false;
  public deleteOrderActive: Boolean = false;
  public jobTabActive: Boolean = false;

  canDeactivate(component: CanComponentDeactivate,
    route: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot) {
    return component.canDeactivate ? component.canDeactivate(nextState) : true;
  }
}
