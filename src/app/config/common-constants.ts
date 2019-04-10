import {PrintBrokerResponse} from '@app/models/printbroker/PrintBrokerResponse';
import {FileDescriptions} from '@app/models/printbroker/FileDescriptions';
import {PrintBrokerThumbnail} from '@app/models/printbroker/PrintBrokerThumbnail';

export class CommonConstants {
  public static ACTIVE_ORDER_IDS = [8, 30, 24];
  public static PAID_ORDER_IDS = [24];
  public static SAVED_ORDER_IDS = [6];
  public static QUOTE_STATUS_MESSAGES = ['Pending', 'Lost', 'Won', 'Cancelled'];
  public static STATES = [{'shortName': 'AL', 'fullName': 'Alabama'},
    {'shortName': 'AK', 'fullName': 'Alaska'},
    {'shortName': 'AZ', 'fullName': 'Arizona'},
    {'shortName': 'AR', 'fullName': 'Arkansas'},
    {'shortName': 'CA', 'fullName': 'California'},
    {'shortName': 'CO', 'fullName': 'Colorado'},
    {'shortName': 'CT', 'fullName': 'Connecticut'},
    {'shortName': 'DE', 'fullName': 'Delaware'},
    {'shortName': 'DC', 'fullName': 'District of Columbia'},
    {'shortName': 'FL', 'fullName': 'Florida'},
    {'shortName': 'GA', 'fullName': 'Georgia'},
    {'shortName': 'HI', 'fullName': 'Hawaii'},
    {'shortName': 'ID', 'fullName': 'Idaho'},
    {'shortName': 'IL', 'fullName': 'Illinois'},
    {'shortName': 'IN', 'fullName': 'Indiana'},
    {'shortName': 'IA', 'fullName': 'Iowa'},
    {'shortName': 'KS', 'fullName': 'Kansas'},
    {'shortName': 'KY', 'fullName': 'Kentucky'},
    {'shortName': 'LA', 'fullName': 'Louisiana'},
    {'shortName': 'ME', 'fullName': 'Maine'},
    {'shortName': 'MD', 'fullName': 'Maryland'},
    {'shortName': 'MA', 'fullName': 'Massachusetts'},
    {'shortName': 'MI', 'fullName': 'Michigan'},
    {'shortName': 'MN', 'fullName': 'Minnesota'},
    {'shortName': 'MS', 'fullName': 'Mississippi'},
    {'shortName': 'MO', 'fullName': 'Missouri'},
    {'shortName': 'MT', 'fullName': 'Montana'},
    {'shortName': 'NE', 'fullName': 'Nebraska'},
    {'shortName': 'NV', 'fullName': 'Nevada'},
    {'shortName': 'NH', 'fullName': 'New Hampshire'},
    {'shortName': 'NJ', 'fullName': 'New Jersey'},
    {'shortName': 'NM', 'fullName': 'New Mexico'},
    {'shortName': 'NY', 'fullName': 'New York'},
    {'shortName': 'NC', 'fullName': 'North Carolina'},
    {'shortName': 'ND', 'fullName': 'North Dakota'},
    {'shortName': 'OH', 'fullName': 'Ohio'},
    {'shortName': 'OK', 'fullName': 'Oklahoma'},
    {'shortName': 'OR', 'fullName': 'Oregon'},
    {'shortName': 'PA', 'fullName': 'Pennsylvania'},
    {'shortName': 'PR', 'fullName': 'Puerto Rico'},
    {'shortName': 'RI', 'fullName': 'Rhode Island'},
    {'shortName': 'SC', 'fullName': 'South Carolina'},
    {'shortName': 'SD', 'fullName': 'South Dakota'},
    {'shortName': 'TN', 'fullName': 'Tennessee'},
    {'shortName': 'TX', 'fullName': 'Texas'},
    {'shortName': 'UT', 'fullName': 'Utah'},
    {'shortName': 'VT', 'fullName': 'Vermont'},
    {'shortName': 'VA', 'fullName': 'Virginia'},
    {'shortName': 'WA', 'fullName': 'Washington'},
    {'shortName': 'WV', 'fullName': 'West Virginia'},
    {'shortName': 'WI', 'fullName': 'Wisconsin'},
    {'shortName': 'WY', 'fullName': 'Wyoming'}];

  public static ALLOWED_FILE_TYPES = ['gif', 'jpg', 'jpeg', 'tif', 'tiff',
    'png', 'bmp', 'pdf', 'docx', 'xlsx', 'pptx', 'vsd', 'doc', 'xls', 'ppt'];
  public static ALLOWED_FILE_TYPES_WORKFRONT = ['gif', 'jpg', 'jpeg', 'tif', 'tiff',
    'png', 'bmp', 'pdf', 'docx', 'xlsx', 'pptx', 'vsd', 'doc', 'xls', 'ppt', 'zip', 'indd', 'ai', 'psd', 'eps','txt','csv'];
  public static WORKFRONT_MAX_FILE_SIZE = 501000000;

  public static TIMEPICKER_HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  public static TIMEPICKER_MINUTES = ['00', '15', '30', '45'];
  public static TIMEPICKER_AMPM = ['AM', 'PM'];
  public static ALLOWED_WORKFRONT_CATEGORY = ['C124', 'C127'];
  public static CUSTOM_INPUT_PROPERTY = {
    GetTabCopy: {
      isMandatory: 'Y',
      valueType: 'alphaNumeric'
    },
    GetTabPage: {
      isMandatory: 'Y',
      valueType: 'positiveInteger'
    },
    GetTabQty: {
      isMandatory: 'Y',
      valueType: 'positiveInteger'
    },
    GetNonZeroQty: {
      isMandatory: 'Y',
      valueType: 'positiveInteger'
    },
    GetNonZeroNoPriceQty: {
      isMandatory: 'Y',
      valueType: 'positiveInteger'
    },
    GetHeight: {
      isMandatory: 'Y',
      valueType: 'decimal'
    },
    GetWidth: {
      isMandatory: 'Y',
      valueType: 'decimal'
    },
    GetPrice: {
      isMandatory: 'Y',
      valueType: 'decimal'
    },
    GetDescription: {
      isMandatory: 'Y',
      valueType: 'alphaNumeric'
    },
    GetTopQty: {
      isMandatory: 'Y',
      valueType: 'positiveIntegerAndZero'
    },
    GetBottomQty: {
      isMandatory: 'Y',
      valueType: 'positiveIntegerAndZero'
    }
  };

  public static PRODUCT_SKU = 'PRODUCT_SKU';
  public static PRECONFIG_PRODUCT_SKU = 'PRECONFIG_PRODUCT_SKU';
  public static NO_PRODUCT_SKU = 'NO_PRODUCT_SKU';
  public static IDLE_TIME = 1500;
  public static TIMEOUT = 300;
  public static KEEPALIVE_INTERVAL = 300;
  public static readonly ORDER_NAME_LENGTH = 50;

  public static SAMPLE_FILES = new PrintBrokerResponse(null,
    [ new FileDescriptions(null, null, null, null, 'assets/sample-files/blank.jpg', null)
      , null, null, null, new FileDescriptions(null, null, null, null, 'assets/sample-files/blank.jpg', null)],
    null, null,
    [new PrintBrokerThumbnail(null, null, 'assets/sample-files/blank.jpg', null )]
    , null, null, null);

}

export enum SubmitType {
  Quote = 'Quote',
  Order = 'Order',
  SaveForLater = 'SaveForLater'
}

export enum deliveryMethod {
  Pickup = 'Pick Up',
  Delivery = 'Delivery'
}


export enum QuoteActions {
  Reorder,
  Copy,
  Edit,
  OrderEdit
}

