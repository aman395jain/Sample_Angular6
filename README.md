# SolutionBuilder

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.0.

## Development server

Run `ng serve --proxy-config proxy.config.json --aot` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build --prod --build-optimizer --base-href=/sb/` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.
change the base-href to what directory you are building too. Ie ...staples.com/angular should be --base-href=/angular/ 
If building to /sb you can also use npm run build and it will issue the proper command.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Information on modules used
Library documentation
1. Translation library - // https://github.com/ngx-translate/core ;
2. Modals: https://material.angular.io/components/dialog/overview
3. Data table https://l-lin.github.io/angular-datatables/#/basic/angular-way
5. Popover: https://github.com/pleerock/ngx-popover
6. persistence //https://www.npmjs.com/package/angular-persistence#1
7. Moment: https://github.com/urish/angular2-moment, http://momentjs.com/docs/#/displaying/format/
8. Loading Spinner https://www.npmjs.com/package/ngx-loading 
9. https://github.com/googlei18n/libphonenumber/ 
10. https://angular2-tree.readme.io/docs/action-mapping
11. https://vestride.github.io/Shuffle/
12. https://libraries.io/npm/@thisissoon%2Fangular-scrollspy

Look into currency pipe and setting format based on country

Angular routing
https://blog.angular-university.io/angular2-router/ 

## Icons
https://fontawesome.com/how-to-use/svg-with-js
font awesome has been included to provide icons for the site. If possible use an icon from fontawesome instead of including an image.

icons used
paperclip to show job/order has a file
<i class="fa fa-paperclip fa-3x"></i>

## Environments
When creating services you must include a check of the environment to toggle url if it changes. See storeinfo service as an example
 
## How to show a loader
Import the NotificationService into the component (Path may vary depending on location of component)
  ```angular2html
  import {NotificationService} from "../../../services/notification/notification.service";
  ```
Declare the NotificationService in the constructor
```angular2html
 constructor(
       ...
       public notificationService: NotificationService
       ...
    ) { }
```

Call the showLoader() function in the NotificationService to show the loader

```angular2html
this.notificationService.showLoader();
```

Call the hideLoader() function in the NotificationService to hide the loader

```angular2html
this.notificationService.hideLoader();
```
## How to show a SnackBar notification
Import the NotificationService into the component (Path may vary depending on location of component)
  ```angular2html
  import {NotificationService} from "../../../services/notification/notification.service";
  ```
Declare the NotificationService in the constructor
```angular2html
 constructor(
       ...
       private notificationService: NotificationService
       ...
    ) { }
```

Call the notify() function in the NotificationService to show the SnackBar. The notify() function takes a SnackNotification object which has two
parameters. The first one iis the message to display in the SnackBar the second is the duration to show the SnackBar. If null is passed
for the duration it will show for 3 seconds. 

```angular2html
this.notificationService.notify(new SnackNotification('Message', null))
```


## How to use the translate service in a component.ts
Import the TranslateService into the component 
  ```angular2html
  import { TranslateService } from '@ngx-translate/core';
  ```
Declare the TranslateService in the constructor
```angular2html
 constructor(
       ...
       private translate: TranslateService,
       ...
    ) { }
```

In the onInit() function or anywhere else you call the get() function of the translate service and set a variable to store the values which are 
returned as an object and can be referenced as Key value Pairs
```angular2html
this.translate.get('COMMON.error').subscribe(result => {
    this.errorMsgs = result;
});
```
After you load the translations you can simply reference the variable that you saved the translations too.
```angular2html
throw new CustomSBError(this.errorMsgs.pAndCError, this.errorMsgs.pAndCErrorName, false);
```

###Server Configuration
The WEB-INF folder contains a web.xml file which tells the server to redirect to index.html on 404 errors. 
This corrects the issue when refreshing the page on something other than /angular. Added the WEB-INF folder to the assets
property in the angular.json so it is included in ng builds
