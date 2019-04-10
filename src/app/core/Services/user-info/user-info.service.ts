import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {User} from '@app/models/User';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {HttpClient} from '@angular/common/http';


@Injectable()
export class UserInfoService {
  rootUrl = environment.rootApiUrl + '/customer/createUser';
  public user: User;
  public backendAppInfo = new BehaviorSubject<String[]>(null);

  constructor(
    private http: HttpClient,
    private storeInfoService: StoreinfoService
  ) {
  }

  /**
   * Retrieves and stores user information based on the employee ID passed in.
   * @param employeeId
   * @returns {Subscription}
   */
  retrieveUserInfo(employeeId) {
    const lookupUser = new User(null, employeeId, '', '', null, null, this.storeInfoService.getStoreNumber());

    return this.http.post<User>(this.rootUrl, lookupUser)
      .timeoutWith(10000, Observable.throwError(new Error('Error retrieving user details. Request timed out.')))
      .subscribe(
        data => {
          this.user = data;
          this.backendAppInfo.next(data.build.split(','));
        });
  }

  retrieveStoreUsers(storeNumber: Number) {
    return this.http.get(environment.rootApiUrl + '/store/' + storeNumber + '/users')
      .timeoutWith(10000, Observable.throwError(new Error('Error retrieving user list. Request timed out.')));
  }

  releaseNotes() {
    return this.http.get(environment.rootApiUrl + '/release/releaseNotes');
  }

  getBackendAppInfo(): Observable<any> {
    return of(this.backendAppInfo);
  }
  /**
   * Tests if this user has the specified role.
   * @param role
   * @returns {boolean}
   */
  hasRole(role) {
    if (this.user && this.user.roles) {
      for (const userRole of this.user.roles) {
        if (userRole === role) {
          return true;
        }
      }
    }
    return false;
  }

}
