import { Component, OnInit, Inject, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {CustomerInformation} from '@app/models/CustomerInformation';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {WesLeadData} from '@app/models/wes-lead-data';

@Component({
  selector: 'app-wes-lead-result',
  templateUrl: './wes-lead-result.component.html',
  styleUrls: ['./wes-lead-result.component.css']
})
export class WesLeadResultComponent implements OnInit, AfterViewChecked {

  model: WesLeadData;
  successStatus = false;
  message = '';
  currentDate = '';
  storeNumber = '';
  printSrc = '';
  public showCloseButton = false;
  @ViewChild('printPreview') iframe: ElementRef;

  constructor (
    public dialogRef: MatDialogRef<WesLeadResultComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    public orderConfigService: OrderConfigService,
    public dialog: MatDialog,
    public router: Router,
    public storeInfoService: StoreinfoService,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    this.model = data.model;
    this.successStatus = data.status;
  }

  ngOnInit () {
    this.storeNumber = this.storeInfoService.getStoreNumber().toString();
    const now = new Date();
    this.currentDate = now.toDateString();
    if (this.router.url.includes( '/config') || this.router.url.includes( '/checkout')) {
      this.showCloseButton = true;
    }
  }

  ngAfterViewChecked () {
    this.printSrc = document.getElementById('printSrc').innerHTML;
    this.changeDetectorRef.detectChanges();
  }

  onNoClick () {
    this.dialogRef.close();
  }

  // Opens file upload and product configuration with wes lead customer
  continueWithOrder () {
    if (!this.orderConfigService.orderCustomerSelected
            || this.orderConfigService.orderCustomer.lastname !== this.model.lastName) {
      this.orderConfigService.orderCustomerSelected = true;
      const customer = new CustomerInformation();
      this.populateCustomerInformation(customer);
      this.orderConfigService.setOrderCustomer(customer);
    }

    this.dialogRef.close();

    this.router.navigate(['/product']);
  }

  // goes back to customer search screen
  nextCustomer() {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }

  // prints receipt for wes lead
  print () {
    const content = this.iframe.nativeElement.contentWindow;
    content.focus();
    content.print();
  }

  populateCustomerInformation (customer: CustomerInformation) {
    customer.firstname = this.model.firstName;
    customer.lastname = this.model.lastName;
    customer.address1 = this.model.address1;
    customer.address2 = this.model.address2;
    customer.city = this.model.city;
    customer.company = this.model.company;
    customer.email = this.model.email;
    customer.phoneNumber = this.model.phoneNumber;
    customer.rewardsNumber = this.model.rewardsNumber;
    customer.state = this.model.state;
    customer.zip = this.model.zipCode;
  }
}
