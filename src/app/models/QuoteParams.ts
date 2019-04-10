import {LocalDateTime} from 'js-joda/dist/js-joda';

export class QuoteParams {
  public quoteNumber: number;
  public status: number;
  public statusReason: any;
  public storeNumber: number;
  public userId: number;
  public restaple: boolean;
  public country: string;
  public dueDate: LocalDateTime;
  public language: string;

  constructor(quoteNumber, status, statusReason, storeNumber, userId, restaple, country, dueDate, language) {
    this.quoteNumber = quoteNumber;
    this.status = status;
    this.statusReason = statusReason;
    this.storeNumber = storeNumber;
    this.userId = userId;
    this.restaple = restaple;
    this.country = country;
    this.dueDate = dueDate;
    this.language = language;
  }
}
