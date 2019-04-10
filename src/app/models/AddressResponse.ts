import { Address } from "@app/models/Address";

export class AddressResponse {
    addressVerified: boolean;
    replaceAddress: boolean;
    errorMsg: string;
    suggestedAddress: Address;
}
