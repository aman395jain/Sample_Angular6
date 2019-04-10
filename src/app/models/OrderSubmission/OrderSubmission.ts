import { CustomerObject } from '../customer-object';
import { OrderSubmissionJob } from './OrderSubmissionJob';
import { ShippingInfoJ } from '@app/models/ShippingInfoJ';
import { TurnTimeSet } from '@app/models/TurnTimeSet';

export class OrderSubmission {
    public country: string;
    public customer: CustomerObject;
    public dueDate: string;
    public jobs: OrderSubmissionJob[];
    public orderType: string;
    public isEdit: boolean;
    public storeId;
    public storeNumber;
    public userName: string;
    public totalOrderPrice: number;
    public orderName: string;
    public isRestapleOriginals: boolean;
    public orderNumber: string = null;
    public shippingInfoJ: ShippingInfoJ;
    public deliveryMode: String = null;
	public isCustomerSearch : boolean = false;
}
