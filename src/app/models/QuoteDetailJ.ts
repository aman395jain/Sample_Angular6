import {QuoteSummaryV} from './QuoteSummaryV';
import {QuoteSkuV} from './QuoteSkuV';
import { QuoteJob } from '@app/models/QuoteJob';

export class QuoteDetailJ {
  quoteSummary: QuoteSummaryV;
  quoteJobs: QuoteJob[];
}
