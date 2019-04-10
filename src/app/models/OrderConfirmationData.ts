import { OrderSubmission } from '@app/models/OrderSubmission/OrderSubmission';

export class OrderConfiratmationData {
  orderNumber: number;
  success: boolean;
  submitOrderToFlightDeck = false;
  orderType: string;
  isSdsShip = false;
}
