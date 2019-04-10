import { Component, OnInit, Inject, ChangeDetectorRef, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {OrderTicket} from '@app/models/OrderTicket';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {QuoteTicket} from '@app/models/QuoteTicket';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {CustomerSearchService} from '@app/shared/services/customer-search/customer-search.service';

@Component({
    selector: 'app-QuoteTickets',
    templateUrl: './PrintQuoteTickets.component.html',
    styleUrls: ['./PrintQuoteTickets.component.css']
})
export class PrintQuoteTicketsComponent {

    public orderData = new OrderTicket('', '', '', '', '', '', '', '', '', '', null, '', '', '',
        '', 0, '', null, '', false, '', '', false, '', false, false);

    public quoteData = new QuoteTicket('', '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', '', '', false, 0, 0, '', '', '');

    public selectedCustomer: any;
    printSrc = '';
    @ViewChild('printTablePreview') printTable: ElementRef;

    constructor(
        public dialogRef: MatDialogRef<PrintQuoteTicketsComponent>,
        public customerSearchService: CustomerSearchService,
        public translate: TranslateService,
        public validators: ValidatorsService,
        public storeInfo: StoreinfoService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        vcr: ViewContainerRef,
        public dialog: MatDialog,
        public changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
        let print = this.data.print;
        this.orderData = new OrderTicket(print.customerLastName, print.customerFirstName, print.dueDate, print.orderNo,
            print.orderCreationDate, print.customerPreferredContactNo, print.preferredEmail, print.customerRewardNumber,
            print.customerCompany, print.jobBeanList, print.jobBeanList[0].dueDate, print.unitPrice, print.totalQuantity,
            print.totalOrderPrice, print.discountPrice, print.totalDiscountOnOrder, print.totalOrderDiscountedPrice,
            print.couponsForPymtTickets, print.preferredContactMode, print.printBarcodeOff, print.bdpTier,
            print.customerPhoneNumber, print.contractCustomer, print.formattedContractTotal, print.isDiscounted,
            print.bdpPriceCallSuccess);

        this.quoteData = new QuoteTicket(print.orderCreationDateWithoutTime, print.customeraddress1, print.customeraddress2, print.customercity, print.customerstate, print.customerzip,
            print.quoteExpiryDateWithoutTime, print.storeNumber, print.storeAddress1, print.storeCity, print.storeState, print.storeZip, print.storeSundayOpen, print.storeSundayClose,
            print.storeWeekdayOpen, print.storeWeekdayClose, print.storeSaturdayOpen, print.storeSaturdayClose, print.isAtQuoteDesk, print.quoteDiscountOnOrder,
            print.bdpDiscountOnOrder, print.messageLine1, print.messageLine2, print.storePhonenumber);

            this.customerSearchService.currentSelectedCustomer.subscribe(
                selectedCustomer => {
                    if (selectedCustomer !== null) {
                        this.selectedCustomer = selectedCustomer;
                    }
            });

        this.delay(600).then(any => {
        var divToPrint=document.getElementById("PrintTable");
        let iframedoc =  this.printTable.nativeElement.contentDocument || this.printTable.nativeElement.contentWindow;

         if (iframedoc){
             iframedoc.open();
             iframedoc.writeln(divToPrint.innerHTML);
             iframedoc.close();
         }
         this.printTable.nativeElement.contentWindow.focus();
         this.printTable.nativeElement.contentWindow.print();
        });
    }

    ngAfterViewChecked(){
        this.printSrc = document.getElementById('PrintTable').innerHTML;
        this.changeDetectorRef.detectChanges();
      }

   onNoClick(): void {
        this.dialogRef.close();
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
