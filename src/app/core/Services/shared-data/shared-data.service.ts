import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { WesLeadComment } from '@app/models/wes-lead-comment';
import { WesLeadData } from '@app/models/wes-lead-data';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  // Configscreen service
  public configPageReadyBSubj = new BehaviorSubject(false);
  public configPageIsLoaded = false;
  private menuChange = new Subject<any>();
  notifyMenuChangeObservable$ = this.menuChange.asObservable();

  // Order Service
  private selectedOrderSummarySource = new BehaviorSubject<any>('');
  currentSelectedOrderSummary = this.selectedOrderSummarySource.asObservable();
  public orderReviewStep = new BehaviorSubject<boolean>(false);

  // Fileupload Service
  public pbServerStatus = 'Unchecked';
  public orderRouterUrl = '';
  public orderType = '';
  private confirmationTitleSource = new BehaviorSubject<String>('');
  public confirmationTitle = this.confirmationTitleSource.asObservable();
  private fdSuccessSource = new BehaviorSubject<boolean>(false);
  public fdSuccess = this.fdSuccessSource.asObservable();
  private showProgressBarSource = new BehaviorSubject<boolean>(false);
  public showProgressBar = this.showProgressBarSource.asObservable();
  private fdSubmitFinishedSource = new BehaviorSubject<boolean>(false);
  public fdSubmitFinished = this.fdSubmitFinishedSource.asObservable();

  // Wesleads Service
  private selectedWesLeadSource = new BehaviorSubject<any>('');
  currentWesLead = this.selectedWesLeadSource.asObservable();
  public wesFileLink = '';
  public wesFileName = '';
  public wesComments = '';
  public wesComment: WesLeadComment = new WesLeadComment(null, null, null);
  public newWesLeadInfo = new WesLeadData();

  constructor() { }

  /**
   * Observable string streams
   */
  public notifyMenuChange(data: any) {
    this.menuChange.next(data);
  }

  changeSelectedOrderSummary(order: any) {
    this.selectedOrderSummarySource.next(order);
  }

  changeSelectedWesLead(wesLead: any) {
    this.selectedWesLeadSource.next(wesLead);
    this.resetCommentData();
  }

  resetCommentData() {
    this.wesFileName = '';
    this.wesFileLink = '';
    this.wesComment.comments = '';
    this.wesComment.escalationFlag = false;
  }

  changeConfirmationTitle(title: String) {
    this.confirmationTitleSource.next(title);
  }

  changeFdSuccess(fdSuccess: boolean) {
    this.fdSuccessSource.next(fdSuccess);
  }

  changeShowProgressBar(show: boolean) {
    this.showProgressBarSource.next(show);
  }

  changeFdSubmitFinished(finished: boolean) {
    this.fdSubmitFinishedSource.next(finished);
  }
}
