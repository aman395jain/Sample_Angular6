import { JobSet } from './JobSet';
import { ShipDetails } from './ShipDetails';

export class ShippingRequest {
    public jobSet: JobSet[];
    public shipDetails: ShipDetails;
    public sourceSystem: string;
    public storeNumber: number;
    public rewardsNumber: string;
}