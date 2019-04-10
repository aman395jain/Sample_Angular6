import { Component, Inject, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CustomInputHostDirective } from './CustomInputHost.directive';
import { NonTabComponent } from './NonTab/NonTab.component';
import { TabsComponent } from './Tabs/Tabs.component';
import { CustomInputInt } from './CustomInputInt';

@Component({
  selector: 'app-CustomInputDialog',
  templateUrl: './CustomInputDialog.component.html',
  styleUrls: ['./CustomInputDialog.component.css']
})
export class CustomInputDialogComponent implements OnInit {

  @ViewChild(CustomInputHostDirective) customInputHost: CustomInputHostDirective;

  constructor(
    public dialogRef: MatDialogRef<CustomInputDialogComponent>,
    private componentFactoryResolver: ComponentFactoryResolver,
     private translate: TranslateService,
     @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {

    let component: any = NonTabComponent;
    this.data.customOption.customOptions.forEach(element => {
      if (element.customKey === 'GetTabQty') {
        component = TabsComponent;
      }
    });

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);

    const viewContainerRef = this.customInputHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
     (<CustomInputInt>componentRef.instance).data = this.data;
  }

}
