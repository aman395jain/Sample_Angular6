import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    if (value == null || value === '') {
      return value;
    }
    let number = value.replace(/[^0-9]/g,'').slice(0,10);
    let areaCode = number.slice(0, 3);
    let phoneNum = number.slice(3);

    let formattedPhoneNumber = "(" + areaCode + ") " + phoneNum.slice(0,3) + "-" + phoneNum.slice(3);
    return formattedPhoneNumber;
  }

}
