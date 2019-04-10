export class SnackNotification {
    public msg: string;
    public duration: number;


    constructor (msg: string, duration: number) {

      if (msg === null || msg === undefined) {
         this.msg = 'Default Error Message';
      } else {
       this.msg = msg;
      }

      if ( duration === null) {
        this.duration = 3000;
      } else {
        this.duration = duration;
      }

    }
}
