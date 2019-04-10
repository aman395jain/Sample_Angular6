import { Recipient } from './Recipient';

export class ShipDetails {
    public facilityCode: string;
    public recipient: Recipient;

constructor($facilityCode: string, $recipient: Recipient) {
       this.facilityCode = $facilityCode;
       this.recipient = $recipient;
   }
}