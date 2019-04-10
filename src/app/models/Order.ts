import {CustomerInformation} from '@app/models/CustomerInformation';
import {ShippingInfoJ} from '@app/models/ShippingInfoJ';
import {PreferredContact} from '@app/models/PreferredContact';
import {ActiveJob} from '@app/models/ActiveJob';

export class Order {
  // Variable used to store the selected customer for the order
  public orderCustomer = new CustomerInformation();
  // Variable used to store the customer shipping info for the order
  public shippingInfoJ = new ShippingInfoJ(null, null, null, null, null, null, null, null);
  // Stores selected shipping rates for jobs with shipping
  public selectedShippingOptions: Array<any>;
  // used to track if new customer of if customer was searched and selected
  public orderCustomerSelected = false;
  public orderCustomerPreferredContact = new PreferredContact(null, null, null, null, null, null);
  public activeConfigProduct = {'name': 'N/A'};


  public activeJob = new ActiveJob();
  public activeExceptionPage: any;


  public orderPricing: any;
  public orderName = '';
  public cart: Map<number, ActiveJob> = new Map<number, ActiveJob>();
  public jobIdCounter = 1;
  public exceptionPageCounter = 1;
  public totalOrderPrice = 0;
  public totalOrderOriginalPrice = 0;
  public totalOrderQuantityDiscount = 0;
  public totalOrderBdpDiscount = 0;
  public totalOrderSavings = 0;
  public template;
  public isReorder = false;
  public isOrderCustomerInfoValid = false;
  public isShippingInfoValid = false;
  public isPickUpInfoValid = false;
  public showShipping = false;
  public shippingOption: any;
}
