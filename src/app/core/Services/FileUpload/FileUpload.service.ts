import 'rxjs/add/observable/forkJoin';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subscription} from 'rxjs/Subscription';
import {Observable, of} from 'rxjs';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import {environment} from '../../../../environments/environment';
import {FileInterrogation} from '../../../models/FileInterrogation';
import {PrintBrokerResponse} from '../../../models/printbroker/PrintBrokerResponse';
import {ActiveJob} from '../../../models/ActiveJob';
import {BackgroundTaskStatusService} from '../background-task-status/background-task-status.service';
import {CustomSBError} from '../../../errors/CustomErrorObjects/CustomSBError';
import {InformationDialogComponent} from '../../../shared/components/information-dialog/information-dialog.component';
import {BackgroundTask} from '../../../models/BackgroundTask';
import {StoreinfoService} from '../storeinfo/storeinfo.service';
import {LoggerService} from '../logger-service/logger-service.service';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {SharedDataService} from '../shared-data/shared-data.service';
import {SubmitType} from '@app/config/common-constants';

@Injectable()
export class FileUploadService {

  private rootUrl = environment.rootApiUrl + '/file/';
  private printBrokerInfo: any;
  private storeSpecificUrl: string;
  private appKey = 'CLOUD';
  private printBrokerSettings: any;
  private cloudUrl = '';
  public printBrokerError = '';
  private useCloudVersion = '';
  private preFlightRequest = '';
  private pbUrl = '';
  private isHrefChange = false;
  private rPbInfoSub: Subscription;
  private rPbSettingsSub: Subscription;
  private orderRouterUrl: string;
  private domain = '';
  private useCloudPbByStore;
  private shippingFeatureEnabled = false;
  private errorMsgs;
  private WF_API_KEY: string;
  private PB_SECRET_KEY: string;
  private WF_API_URL: string;
  public failedFileList: Array<any> = [];

  constructor(
    private storeInfoService: StoreinfoService,
    private statusService: BackgroundTaskStatusService,
    private http: HttpClient,
    private translate: TranslateService,
    private dialog: MatDialog,
    private LOG: LoggerService,
    private sharedDataService: SharedDataService
  ) {
  }

  setPrintBrokerInfo(printBrokerInfo) {
    this.printBrokerInfo = printBrokerInfo;
  }

  setPrintBrokerSettings(printBrokerSettings) {
    this.printBrokerSettings = printBrokerSettings;
  }

  useCloudPB() {
    // uncomment to force use of local PB
    // return false;
    return this.useCloudPbByStore || this.useCloudVersion;
  }

  /**
   * Function to call SBCUSTSVCS and get print broker settings for store
   */
  retrievePrintBrokerInfo() {
    return this.http.get(this.rootUrl + 'printbroker/info?storeId=' + this.storeInfoService.getStoreId())
      .timeoutWith(10000, Observable.throw(new Error(this.translate.instant('COMMON.error.printbroker.pbInfoTimeOut'))));
  }

  /**
   * Call Print Broker API to get settings
   * @param printBrokerSettingsURL
   */
  retrievePrintBrokerSettings(printBrokerSettingsURL) {

    const httpOptions = {
      headers: new HttpHeaders({
        'x-secret-key': this.PB_SECRET_KEY
      })
    };
     
    return this.http.get(printBrokerSettingsURL, httpOptions)
      .timeoutWith(10000, Observable.throw(new Error(this.translate.instant('COMMON.error.printbroker.pbSettingsTimeOut'))));
  }

  callPbPreflightApi(domain, formData) {
    return this.http.post(domain + 'api/preflight/files', formData)
      .timeoutWith(600000, Observable.throw(new Error(this.translate.instant('COMMON.error.printbroker.pbOrderSubmitTimeOut'))));
  }

  pingPrintBroker(url) {
    this.sharedDataService.pbServerStatus = 'Unchecked';
    return this.http.get(url, {responseType: 'text'}).catch( err => {
      // If local Print Broker server is unreachable then an error will be thrown and server status set accordingly
      if (this.sharedDataService.pbServerStatus === 'Local Unavailable') {
        // If local Print Broker is down use cloud version
        this.useCloudVersion = 'true';
        this.useCloudPbByStore = 'true';
        this.appKey = 'CLOUD';
        this.printBrokerError = url + ' is down';
        this.LOG.error(this.printBrokerError);
      }
      return of({description: this.printBrokerError});
    }).subscribe();
  }

  /**
   * Function that should be called first to get print broker information/settings
   */
  setupPrintBroker() {
    this.translate.get('COMMON.error.printbroker').subscribe(result => {
      this.errorMsgs = result;
    });
    return new Promise((resolve, reject) => {
      let errorMsg = '';
      this.rPbInfoSub = this.retrievePrintBrokerInfo().subscribe(resultData => {
          const result: any = resultData;
          this.setPrintBrokerInfo(result);
          this.useCloudVersion = result.useCloudPrintBrokerVersion;
          // uncomment to force use of local PB
          // this.useCloudVersion = 'false';

          this.cloudUrl = result.printBrokerCloudURL;
          this.preFlightRequest = result.preFlightRequestContent;
          this.pbUrl = result.pbUrl;
          this.useCloudPbByStore = result.enableCloudPbByStore;

          // uncomment to force use of local PB
          // this.useCloudPbByStore = false;

          this.orderRouterUrl = result.orderRouterUrl;
          this.PB_SECRET_KEY = result.pbSecretKey;

          if ('true' !== this.useCloudVersion && 'true' !== this.useCloudPbByStore) {
            this.rPbSettingsSub = this.retrievePrintBrokerSettings(result.printBrokerSettingsURL).subscribe(resultData2 => {
                const data: any = resultData2;
                this.setPrintBrokerSettings(data);
                if (Object.keys(data).indexOf('Settings') > -1) {
                  data.Settings.forEach(element => {
                    if (element.Name === 'Broker.MachineName') {
                      this.storeSpecificUrl = 'https://' + element.Value + '.printbroker.staplesamsrtl.com:8443/';
                      this.appKey = element.Value;
                      // Ping the local Print Broker server
                      this.pingPrintBroker(this.storeSpecificUrl + 'api/brokerping');
                      // replace call with this to test localy
                      // this.pingPrintBroker('http://localhost:8080/api/brokerping');
                    }
                  });
                  resolve('success');
                }
              },
              err => {
                errorMsg = this.errorMsgs.settingsRetrieval;
                this.isHrefChange = false;
                reject(errorMsg);
              });
          } else {
            resolve('success');
          }
        },
        err => {
          errorMsg = this.errorMsgs.pbInfoRetrieval;
          this.isHrefChange = false;
          reject(errorMsg);
        });
    });
  }

  retrieveWorkFrontInfo() {
    return this.http.get(this.rootUrl + 'workfront/info')
      .timeoutWith(10000, Observable.throw(new Error(this.translate.instant('FILEUPLOAD.workFront.workfrontConfigTimeOut'))));
  }

  workFrontFileUpload(workFrontTaskMap: Map<number, string>, cart: Map<number, ActiveJob>, orderNo: string) {
    const promiseList = [];
    const fileError: string[] = [];
    const fileErrorTitle = this.translate.instant('FILEUPLOAD.workFront.workfronFileFailTitle') + orderNo;
    let messageCounter = 0;
    const backgroundTaskID = 'WORKFRONT' + orderNo;

    // Retrieves the API URL and key from the backend which inturn gets it from propert configurator table
    this.retrieveWorkFrontInfo().subscribe((configMap) => {
      this.WF_API_URL = configMap['WF_API_URL'];
      this.WF_API_KEY = configMap['WF_API_KEY'];

      const rejectedPromises = [];
      const resolvedPromises = [];

      Object.keys(workFrontTaskMap).forEach(key => {
        const taskID = workFrontTaskMap[key];

        if (!cart[key].multipleFiles) {
          return;
        }

        this.statusService.addTask(backgroundTaskID,
          new BackgroundTask(this.translate.instant('FILEUPLOAD.workFront.workFrontUploadInProgress') +
            orderNo, null, 0, false));
        const files = cart[key].multipleFiles;

        for (let fileCounter = 0; fileCounter < files.length; fileCounter++) {
          promiseList.push(this.uploadFile(files[fileCounter], taskID, cart[key])
            .then((result) => {
              resolvedPromises.push(result);
            }, (error) => {
              rejectedPromises.push(error);
            }
            ));
        }
      });
      Observable.forkJoin(promiseList).subscribe((results) => {
        this.LOG.debug(rejectedPromises);
        if (rejectedPromises && rejectedPromises.length > 0) {
          for (let errorCounter = 0; errorCounter < rejectedPromises.length; errorCounter++) {
            messageCounter++;
            fileError[messageCounter] = rejectedPromises[errorCounter].job + ' : ' + rejectedPromises[errorCounter].file;
          }
          this.showWorkFrontFileUploadWarning(fileErrorTitle, fileError);
        }
        this.statusService.deleteTask(backgroundTaskID);
      });
    }
    );
  }

  async uploadFile(file: File, taskID: string, job: ActiveJob) {
    const promiseResult = {};
    promiseResult['job'] = job.configProduct.name;
    promiseResult['file'] = file.name;
    return await new Promise((resolve, reject) => {
      this.uploadWorkFrontFile(file).subscribe(
        (fdResult) => {
          const fileUploadResponse: any = fdResult;
          const request = {};
          request['name'] = file.name;
          request['handle'] = fileUploadResponse.data.handle;
          request['docObjCode'] = 'TASK';
          request['objID'] = taskID;
          this.LOG.debug(request);
          this.linkWorkFrontFileToTask(request).subscribe(
            (success) => { resolve(promiseResult); },
            (error) => { this.LOG.error(error); this.failedFileList.push(promiseResult); reject(promiseResult); }
          );
        }, (error) => {
          this.LOG.error(error);
          this.failedFileList.push(promiseResult);
          reject(promiseResult);
        }
      );
    });
  }

  uploadWorkFrontFile(file: File) {
    const wfFormData = new FormData();
    wfFormData.append('uploadedFile', file, file.name);
    return this.http.post(environment.rootURL + '/workfrontproxy/attask/api/v9.0/upload?apiKey=' + this.WF_API_KEY, wfFormData)
      .timeoutWith(600000, Observable.throw(new Error(this.translate.instant('FILEUPLOAD.workFront.uploadTimeOut'))));
  }

  linkWorkFrontFileToTask(request) {
    return this.http.post<any>(environment.rootURL + '/workfrontproxy/attask/api/v9.0/document?updates&apiKey=' + this.WF_API_KEY, request, { observe: 'response' })
      .timeoutWith(600000, Observable.throw(new Error('FILEUPLOAD.workFront.fileAttachTimeOut')));
  }

  preflightFile(uploadedFile, isWesUpload) {
    return new Promise<PrintBrokerResponse>((resolve, reject) => {
      if ('true' === this.useCloudVersion || 'true' === this.useCloudPbByStore || isWesUpload) {
        this.domain = this.cloudUrl;
      } else {
        this.domain = this.storeSpecificUrl;
        // when running locally use this path since it will be proxied
        if (!environment.production) {
          this.domain = '/';
        }
      }

      // uncomment to force use of local PB
      // this.domain = 'http://localhost:8080/';

      if (this.domain != null && this.domain !== '') {
        const preFlightRequestStartTime = performance.now();

        let preFlightJSON = this.preFlightRequest;
        if (this.appKey !== 'CLOUD') {
          preFlightJSON = this.preFlightRequest.replace('123456789-4444', this.appKey);
        }

        const newFormData = new FormData();

        const newFileName = uploadedFile.name.replace(/[^a-zA-Z0-9.]/g, '');
        newFormData.append('theFile', uploadedFile, newFileName);
        newFormData.append('PreflightRequest', preFlightJSON);
        this.isHrefChange = true;

        this.callPbPreflightApi(this.domain, newFormData).subscribe(result => {
            const brokerRes: any = result;
            const files = brokerRes.fileDescriptions;

            if (brokerRes.errorMessage && brokerRes.errorMessage.length > 0) {
              for (let i = 0; i < brokerRes.errorMessage.length ; i++) {
                this.LOG.error(brokerRes.errorMessage[i], 'hello');
              }
            }

            if (files != null && files.length > 2) {
              resolve(brokerRes);
            } else {
              this.isHrefChange = false;
              reject(this.errorMsgs.preflightFailure);
            }
          },
          error => {
            this.isHrefChange = false;
            this.sharedDataService.pbServerStatus = 'Unchecked';
            const preFlightRequestErrorTime = performance.now();
            this.LOG.error('Error in file conversion: STORE=' + this.storeInfoService.getStoreId() +
              ' FILE=' + newFileName + ' SIZE=' + this.formatFileSize(uploadedFile.size) + ' URL=' +
              this.domain + ' DURATION=' + (preFlightRequestErrorTime - preFlightRequestStartTime).toFixed(2) + 'ms');
            reject(this.translate.instant('COMMON.error.printbroker.preflightFailure'));
          });
      }
    });
  }

  pbOrderSubmit(orderSubmitResponse, isFileUpload) {
    const pniNumber = orderSubmitResponse.flightDeckWSResponseMsg[0].split(';;')[1];
    let counter = 0;
    const httpOptions = {
      headers: new HttpHeaders({
        'order-api-version': '2'
      })
    };
    // setting background task notification
    this.statusService.addTask(orderSubmitResponse.sbOrderNumber,
      new BackgroundTask(this.translate.instant('FILEUPLOAD.pollingOrderStatus') +
        orderSubmitResponse.sbOrderNumber + this.translate.instant('FILEUPLOAD.inFlightDeck'), null, 0, false));

    const pollingData = Observable.interval(3000)
      .switchMap(() => this.http.get<any>(this.orderRouterUrl + pniNumber, httpOptions)).map((response) => response)
      .subscribe((response) => {
 
        this.shippingFeatureEnabled = this.storeInfoService.isStoreFeature('Shipping_Enabled');

        let isDispatched;
        let orderStatus;

        if (this.shippingFeatureEnabled) {
          isDispatched = response.SubOrderInfos[0].IsDispatched;
        } else {
          orderStatus = response.SubOrderInfos[0].SubOrderStatus;
        }
      
        if ((this.shippingFeatureEnabled && !!isDispatched) ||
            (!this.shippingFeatureEnabled && orderStatus === 'Order Pulled')) {
          this.sharedDataService.changeFdSuccess(true);
          this.sharedDataService.changeShowProgressBar(false);
          this.sharedDataService.changeFdSubmitFinished(true);
          this.statusService.deleteTask(orderSubmitResponse.sbOrderNumber);
          // Update OrderConfirmationDialog with Success to FD message
          if (!!this.sharedDataService.orderType) {
            if (this.sharedDataService.orderType === SubmitType.Order) {
              this.sharedDataService.changeConfirmationTitle(this.translate.instant('ORDER.checkout.orderSubmitted'));
            }
          }

          if (response.SubOrderInfos[0].OrderItemInfos[0].MisJobId !== undefined && isFileUpload) {
            for (const key in orderSubmitResponse.fileIds) {
              const Mis_JobId = response.SubOrderInfos[0].OrderItemInfos[key].MisJobId;
              let fileId = '';
              let fileName = '';
              let displayJobNumber = Number(key);
              displayJobNumber++;

              this.statusService.addTask(Mis_JobId, new BackgroundTask(this.translate.instant('FILEUPLOAD.attachFileToJob') +
                displayJobNumber + this.translate.instant('FILEUPLOAD.ofOrder') + orderSubmitResponse.sbOrderNumber +
                this.translate.instant('FILEUPLOAD.inFlightDeck'), null, 0, false));

              if (orderSubmitResponse.fileIds.hasOwnProperty(key)) {
                fileId = orderSubmitResponse.fileIds[key];
              }

              if (orderSubmitResponse.fileNames.hasOwnProperty(key)) {
                if (orderSubmitResponse.fileNames[key] === null) {
                  break;
                }

                fileName = orderSubmitResponse.fileNames[key];
                fileName = fileName.substring(fileName.indexOf('=') + 1, fileName.length);
                if (orderSubmitResponse.fileNames != null && 'true' !== this.useCloudPbByStore) {
                  this.printBrokerFilePost(fileId, Mis_JobId, fileName, orderSubmitResponse.pbUrl,
                    orderSubmitResponse.inputIds, Mis_JobId);
                }
              }
            }
          }
          pollingData.unsubscribe();
        } else  {        
          counter++;
          if (counter === 25) {
            pollingData.unsubscribe();
            this.processFdFailure(orderSubmitResponse.sbOrderNumber);
            throw new CustomSBError(this.translate.instant('COMMON.error.printbroker.pollingLimitErrorMsg'),
              this.translate.instant('COMMON.error.printbroker.pollingLimitErrorName'), false);
          }
        }
      }, (error) => {
        pollingData.unsubscribe();
        this.processFdFailure(orderSubmitResponse.sbOrderNumber);
        throw new CustomSBError(this.translate.instant('FILEUPLOAD.orderRouterFail'),
          this.translate.instant('FILEUPLOAD.orderRouterFailDesc'), false);
      });
  }

  processFdFailure(orderNumber) {
    // Update OrderConfirmationDialog with Failure to FD message
    this.sharedDataService.changeConfirmationTitle(this.translate.instant('ORDER.checkout.orderFailedToSubmitToFd'));
    this.sharedDataService.changeFdSuccess(false);
    this.sharedDataService.changeShowProgressBar(false);
    this.sharedDataService.changeFdSubmitFinished(true);
    this.statusService.deleteTask(orderNumber);
  }

  printBrokerFilePost(fileId, jobId, fileName, neededUrl, inputIdMap, backGroundTaskId) {
    const httpOptions = {
      headers: new HttpHeaders({
        'x-secret-key': 'D1EB652C-0526-4826-A99E-9CD8E5512F6F'
      })
    };
    const uploadJSON = { 'FileId': fileId, 'FileName': fileName, 'JobId': jobId };


    return this.http.post<any>(this.domain + 'api/FileUpload', uploadJSON, httpOptions).subscribe(data => {
      const fileUploadURL = neededUrl + '/' + data.originalFileId + '?FacilityId=' + data.facilityId;
      this.updateDBFileLocation(inputIdMap[fileId], fileUploadURL, backGroundTaskId);
    }, error => {
      this.statusService.deleteTask(backGroundTaskId);
      throw new CustomSBError(error.message, error.name, false);
    });

  }

  updateDBFileLocation(id, location, backgroundtaskId) {
    this.http.put<any>(this.rootUrl + 'inputs/' + id, { 'fileFullName': location }).subscribe(data => {
      if (backgroundtaskId) {
        this.statusService.deleteTask(backgroundtaskId);
      }
    });
  }

  downloadFile(url: string): any {
    return this.http.get(url, {
      responseType: 'blob'
    }).timeoutWith(30000, Observable.throw(new Error(this.translate.instant('COMMON.error.printbroker.fileRetrievalError'))));
  }

  getXMLFile(path) {
    if (!environment.production) {
      path = path.replace('https', 'http');
    }
    return this.http.get(path, { responseType: 'text' });
  }

  /**
   * Convert points to inches
   */
  convertPointsToInches(points: number) {
    return points / 72;
  }

  processXMLFile(xml): FileInterrogation {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const fileData = new FileInterrogation(null, null, null);
    fileData.color = parseInt(xmlDoc.getElementsByTagName('plates')[0].innerHTML, 10) < 2 ? false : true;
    fileData.impressions = xmlDoc.getElementsByTagName('pages')[0].childElementCount;
    const pages = xmlDoc.getElementsByTagName('pages')[0].children;
    let portrait = 0;
    let landscape = 0;
    for (let p = 0; p < pages.length; p++) {
      const split = pages[p].attributes[2].value.split('/');
      if (split[2] > split[3]) {
        landscape++;
      } else {
        portrait++;
      }
    }
    fileData.portrait = portrait >= landscape;
    return fileData;
  }

  showWorkFrontFileUploadWarning(fileErrorTitle: string, warningFailedFiles: string[]) {
    const dialogRef = this.dialog.open(InformationDialogComponent, {
      data: {
        title: fileErrorTitle,
        messages: warningFailedFiles,
        closeTitle: this.translate.instant('BUTTON.close')
      }
    });
  }

  formatFileSize(bytes: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1000,
      dm = 2,
      sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[ i ];
  }
}
