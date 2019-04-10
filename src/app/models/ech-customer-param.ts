import {CustomerObject} from "@app/models/customer-object";

export class EchCustomerParam {
  customer: CustomerObject;
  country: string;
  optIn: boolean;
}
