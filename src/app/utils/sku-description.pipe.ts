import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'skuDescription'
})
export class SkuDescriptionPipe implements PipeTransform {

  transform(value: any, args?: any): any {
      if (value == null ) {
          return value;
      }
      let newValue = value.replace(/,/g, '<br/><strong>');
       newValue = newValue.replace(/^/gm, '<strong>');
       newValue = newValue.replace(/:/g, ': </strong>');
      return `${newValue}`;
  }
}
