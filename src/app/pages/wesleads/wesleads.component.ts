import { Component, OnInit, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {MatPaginator, MatTableDataSource, MatSort, MatDialog, Sort} from '@angular/material';
import {NewWesLeadComponent} from '@app/shared/components/NewWesLead/new-wes-lead.component';
import {SelectedWesLead} from '@app/models/selected-wes-lead';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {WesLeadData} from '@app/models/wes-lead-data';
import {TableSortService} from '@app/shared/services/table-sort/table-sort.service';
import {WesleadsService} from '@app/shared/services/wesleads/wesleads.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';




@Component({
  selector: 'app-wesleads',
  templateUrl: './wesleads.component.html',
  styleUrls: ['./wesleads.component.css']
})

export class WesleadsComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[];
  data: string;
  step = 0;
  wesData:  any = [];
  wesPricingIssueEnabled = false;

  @ViewChild('tablePaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    public wesleadService: WesleadsService,
    public sharedDataService: SharedDataService,
    public storeInfoService: StoreinfoService,
    vcr: ViewContainerRef,
    public tableSort: TableSortService,
    private notificationService: NotificationService
  ) {
  }


  ngOnInit() {
    this.notificationService.showLoader();
    this.wesPricingIssueEnabled = this.storeInfoService.isStoreFeature('wesPricingIssue');
    if (this.wesPricingIssueEnabled) {
      this.displayedColumns = ['customerName', 'submissionDate', 'request', 'rtype', 'status'];
    } else {
      this.displayedColumns = ['customerName', 'submissionDate', 'request', 'status'];
    }

    // Get list of Wesleads for store
    this.wesleadService.retreiveWesData().subscribe(
      data => {
        this.wesData = data;
        this.paginator.pageIndex = 0;
        this.dataSource.data = data;
        if (data !== null) {
          this.sortData(this.sort);
        }
        this.notificationService.hideLoader();
      },
      err => {
        this.notificationService.hideLoader();
        if (err.error instanceof Error) {
          const msg = 'Client-side error occured.';
          throw new Error(msg);
        } else {
           const msg =  'Unable to load table.';
           throw new Error(msg);
        }
      }
    );

  }

  ngAfterViewInit () {
    this.dataSource.paginator = this.paginator;
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    const data = this.dataSource.data.slice();
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      if (this.wesPricingIssueEnabled) {
        switch (sort.active) {
          case 'customerName': return this.tableSort.compare(a.name.toLowerCase(), b.name.toLowerCase(), isAsc);
          case 'submissionDate': return this.tableSort.compare(Date.parse(a.created_DATE_CALC__C), Date.parse(b.created_DATE_CALC__C), isAsc);
          case 'request': return this.tableSort.compare(a.description.toLowerCase(), b.description.toLowerCase(), isAsc);
          case 'status': return this.tableSort.compare(a.comments, b.comments, isAsc);
          case 'rtype': return this.tableSort.compare(this.nvl(a.pricingIssue), this.nvl(b.pricingIssue), isAsc);
          default: return 0;
        }
      } else {
        switch (sort.active) {
          case 'customerName': return this.tableSort.compare(a.name.toLowerCase(), b.name.toLowerCase(), isAsc);
          case 'submissionDate': return this.tableSort.compare(Date.parse(a.created_DATE_CALC__C), Date.parse(b.created_DATE_CALC__C), isAsc);
          case 'request': return this.tableSort.compare(a.description.toLowerCase(), b.description.toLowerCase(), isAsc);
          case 'status': return this.tableSort.compare(a.comments, b.comments, isAsc);
          // case 'rtype': return this.tableSort.compare(this.nvl(a.pricingIssue), this.nvl(b.pricingIssue), isAsc);
          default: return 0;
        }
      }
    });
  }

  nvl(pIssue) {
      if (pIssue == undefined) {
        return false;
      }
      return pIssue;
  }

  openDialog(lead: any) {
    this.notificationService.showLoader();
    // get selected weslead details
    this.wesleadService.retrieveWesLead(lead.id).subscribe(
      data => {
        if (data == null) {
            this.notificationService.hideLoader();
            const msg =  'Unable to show WES Lead Data.';
            throw new Error(msg);

        }

        this.sharedDataService.changeSelectedWesLead(new SelectedWesLead(data, lead.id, lead));
        this.notificationService.hideLoader();
        this.nextStep();
      },
      err => {
          this.notificationService.hideLoader();
        if (err.error instanceof Error) {
          const msg = 'Client-side error occured.';
          throw new Error(msg);
        } else {
           const msg =  'Server-side error occured.';
           throw new Error(msg);
        }
      }
    );

  }

  openNewWesLeadDialog(leadType): void {
    if (!this.wesPricingIssueEnabled) {
      leadType = null;
    }

      const dialogRef = this.dialog.open(NewWesLeadComponent, {
        width: '800px',
        height: 'auto',
        data: { name: this.data, leadType: leadType }
      });

      dialogRef.afterClosed().subscribe(result => {

        if ( result.status === 'success') {
        } else if (result.status === 'cancel') {
          this.sharedDataService.newWesLeadInfo = new WesLeadData();
        } else {
          throw new Error(result.msg);
        }

       //  this.data = result;
      });
    }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
  }

}
