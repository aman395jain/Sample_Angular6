import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceLineBreaks'
})
export class ReplaceLineBreaksPipe implements PipeTransform {

  transform(value: any, args?: any): any {
      if(value == null ){
          return value; 
      }
      
      let newValue = value.replace(/(?:\\[rn]|[\r\n]+)+/g, '<br/>');
      return `${newValue}`;
  }

}
