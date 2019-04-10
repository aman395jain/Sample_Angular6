import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appCustomInputHost]'
})
export class CustomInputHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
