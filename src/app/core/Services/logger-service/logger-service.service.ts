import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {LoggerUtils} from './LoggerUtils';
import { Levels} from './Levels';
import {HttpClient} from '@angular/common/http';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {LoggerLevels} from '@app/config/LoggerLevels';
import {environment} from '@env/environment';
import {LogMessage} from '@app/models/LogMessage';


@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly _isIE: boolean;
  private readonly _logFunc: Function;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId,
    private userInfoService: UserInfoService,
    private storeInfoService: StoreinfoService,
    private http: HttpClient,
  ) {
    this._isIE = isPlatformBrowser(platformId) &&
      !!(navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.match(/Trident\//) || navigator.userAgent.match(/Edge\//));
    this._logFunc = this._isIE ? this._logIE.bind(this) : this._logModern.bind(this);
  }

  public trace(message, ...additional: any[]): void {
      this._log(LoggerLevels.TRACE, message, additional);
  }

  public debug(message, ...additional: any[]): void {
      this._log(LoggerLevels.DEBUG, message, additional);
  }

  public info(message, ...additional: any[]): void {
      this._log(LoggerLevels.INFO, message, additional);
  }

  public log(message, ...additional: any[]): void {
      this._log(LoggerLevels.LOG, message, additional);
  }

  public warn(message, ...additional: any[]): void {
      this._log(LoggerLevels.WARN, message, additional);
  }

  public error(message, ...additional: any[]): void {
      this._log(LoggerLevels.ERROR, message, additional);
  }

  private _logIE(level: LoggerLevels, metaString: string, message: string, additional: any[]): void {

    // Coloring doesn't work in IE
    // make sure additional isn't null or undefined so that ...additional doesn't error
    additional = additional || [];

    switch (level) {
      case LoggerLevels.WARN:
        console.warn(`${metaString} `, message, ...additional);
        break;
      case LoggerLevels.ERROR:
        console.error(`${metaString} `, message, ...additional);
        break;
      case LoggerLevels.INFO:
        console.info(`${metaString} `, message, ...additional);
        break;
      default:
        console.log(`${metaString} `, message, ...additional);
    }
  }

  private _logModern(level: LoggerLevels, metaString: string, message: string, additional: any[]): void {

    const color = LoggerUtils.getColor(level);

    // make sure additional isn't null or undefined so that ...additional doesn't error
    additional = additional || [];

    switch (level) {
      case LoggerLevels.WARN:
        console.warn(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevels.ERROR:
        console.error(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevels.INFO:
        console.info(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevels.TRACE:
        console.trace(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      case LoggerLevels.DEBUG:
        console.debug(`%c${metaString}`, `color:${color}`, message, ...additional);
        break;
      default:
        console.log(`%c${metaString}`, `color:${color}`, message, ...additional);
    }
  }

  private _log(level: LoggerLevels, message, additional: any[] = [], logOnServer: boolean = true): void {
      const isLog2Server = logOnServer && environment.logAPI && level >= environment.serverLogLevel;
      const isLog2Console = !(level < environment.consoleLogLevel);
      if (!(message && (isLog2Server || isLog2Console))) {
          return;
      }

      if (message.message) {
        if (message.message.includes('validatePageRange')) {
          return;
        }
      }
      const logLevelString = Levels[level];

      message = LoggerUtils.prepareMessage(message);

      // only use validated parameters for HTTP requests
      const validatedAdditionalParameters = LoggerUtils.prepareAdditionalParameters(additional);

      const timestamp = new Date().toISOString();

      const callerDetails = LoggerUtils.getCallerDetails();

      if (isLog2Server) {

          const logMessage = new LogMessage(level, timestamp, callerDetails.fileName, parseInt(callerDetails.lineNumber),
            message instanceof Error ? message.stack : message,
            !!this.userInfoService.user ? this.userInfoService.user.loginId : null,
            this.storeInfoService.getStoreNumber(), null);
            this.http.post(environment.rootApiUrl + '/log/', logMessage).subscribe( success => {}, error1 => {});
      }


      // if no message or the log level is less than the environ
      if (isLog2Console) {

          const metaString = LoggerUtils.prepareMetaString(timestamp, logLevelString, callerDetails.fileName, callerDetails.lineNumber);

          return this._logFunc(level, metaString, message, additional);
      }

  }

}
