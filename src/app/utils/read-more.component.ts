import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'read-more',
  template: `
    <div [class.collapsed]="isCollapsed">
            <ng-content></ng-content>
        </div>
        <a *ngIf="isCollapsed == true" (click)="isCollapsed = false" class="pointer">Read more</a>
        <a *ngIf="isCollapsed == false" (click)="isCollapsed = true" class="pointer">Read Less</a>
  `,
  styles: [`
        div.collapsed {
            height: 150px;
            overflow: hidden;
        }
        
        a.pointer {
           cursor: pointer;
        }
    `]
})
export class ReadMoreComponent implements OnInit {
  isCollapsed: boolean = true;
  constructor() { }

  ngOnInit() {
  }

}
