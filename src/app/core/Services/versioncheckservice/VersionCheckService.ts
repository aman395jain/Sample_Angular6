import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {environment} from '@env/environment';


@Injectable()
export class VersionCheckService {
  // this will be replaced by actual hash post-build.js
  private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';
  private interval: any;
  constructor(private http: HttpClient,
              private LOGGER: LoggerService) {}

  /**
   * Checks in every set frequency the version of frontend application
   * @param url
   * @param {number} frequency - in milliseconds, defaults to 30 minutes
   */
  public initVersionCheck() {
    if (environment.enableVersionCheck) {
      this.LOGGER.info('Version Check Enabled')  
      this.interval = this.checkVersion(environment.versionCheckUrl);
      setInterval(() => this.interval, 1000 * 60 * environment.versionCheckFrequency);   
    } else {
      this.LOGGER.info('Version Check Disabled');
    }
  }

  /**
   * called to cancel the interval so it doesn't keep checking after you navigate away from login screen
   */
  public cancelInterval() {
    if (this.interval) {
      this.LOGGER.debug('Clearing Version Check Interval');
      clearInterval(this.interval);
    }
  }

  /**
   * Will do the call and check if the hash has changed or not
   * @param url
   */
  private checkVersion(url) {
    // timestamp these requests to invalidate caches
    this.http.get(url + '?t=' + new Date().getTime())
      .subscribe(
        (response: any) => {
          const hash = response.hash;
          const hashChanged = this.hasHashChanged(this.currentHash, hash);

          // If new version, do something
          if (hashChanged) {
            // ENTER YOUR CODE TO DO SOMETHING UPON VERSION CHANGE
            this.LOGGER.info('New Version Available. Refreshing!');
            location.reload(true);
          }
          // store the new hash so we wouldn't trigger versionChange again
          // only necessary in case you did not force refresh
          this.currentHash = hash;
        },
        (err) => {
          this.LOGGER.error(err, 'Could not get version');
        }
      );
  }

  /**
   * Checks if hash has changed.
   * This file has the JS hash, if it is a different one than in the version.json
   * we are dealing with version change
   * @param currentHash
   * @param newHash
   * @returns {boolean}
   */
  private hasHashChanged(currentHash, newHash) {
    return currentHash !== newHash;
  }
}