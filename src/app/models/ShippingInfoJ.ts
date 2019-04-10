import { Recipient } from '@app/models/Recipient';
export class ShippingInfoJ {
    carrierName: string = null;
    serviceName: string = null;
    serviceCode: string = null;
    deliveryDate: Date = null;
    feeTemplateSku: string = null;
    shippingFee: number;
    shippingSkus: string = null;
    recipient: Recipient = new Recipient(null, null, null, null,
      null, null, null, null, null, null, null);

    firstName: string = null;
    lastName: string = null;
    address1: string = null;
    address2: string = null;
    city: string = null;
    state: string = null;
    zip: string = null;
    addressType: string = null;


    constructor(firstName, lastName, address1, address2, city, state, zip, addressType) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.address1 = address1;
        this.address2 = address2;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.addressType = addressType;
    }
}
