export class BackgroundTask {
   public taskName: string;
   public progressBarType: string;
   public progressBarValue: number;
   public cancelTask:boolean;

   constructor(taskName: string, progressBarType: string, progressBarValue: number, cancelTask:boolean) {
     this.taskName = taskName;
     if(progressBarType) {
       this.progressBarType = progressBarType;
     } else {
       this.progressBarType = 'indeterminate'
     }
     this.progressBarValue = progressBarValue;
     this.cancelTask = cancelTask;
   }
}
