import {Component, OnInit, ElementRef, Renderer2} from '@angular/core';
import {trigger, style, transition, animate, state, useAnimation} from '@angular/animations';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {lightSpeedOut} from 'ng-animate';
import {AttrOptionSelectorModalComponent} from '@app/pages/config/components/attr-option-selector-modal/attr-option-selector-modal.component';
import {ExceptionPageComponent} from '@app/pages/config/components/ExceptionPage/ExceptionPage.component';
import {CustomInputDialogComponent} from '@app/pages/config/components/CustomInputDialog/CustomInputDialog.component';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {AttributeOptionMessageDialogComponent} from '@app/pages/config/components/attribute-option-message-dialog/attribute-option-message-dialog.component';
import {InformationDialogComponent} from '@app/shared/components/information-dialog/information-dialog.component';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';

@Component({
  selector: 'app-configoptions',
  templateUrl: './configoptions.component.html',
  styleUrls: [ './configoptions.component.css' ],
  animations: [
    trigger('slideInOut', [
      state('true', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('false', style({
        transform: 'translate3d(-100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('dcsTruckOut', [
      transition('* => *', useAnimation(lightSpeedOut))

    ])
  ]
})
export class ConfigoptionsComponent implements OnInit {

  showSideBar: Boolean = true;
  optionsFullScreen = false;

  private subscription: Subscription;
  optionsMenuData: any = null;
  private subMenuOptions: any = null;
  private position = 'below';
  private first = true;
  private errorMsgs: any;
  private catMap = {};
  private addExceptionTitle;
  public currentCategory = '';
  public currentSectionId = '';
  private dcsTruckClicked;
  private dcsTruckClickCount = 0;

  // used to store clicked menu option to change background color when selected
  private selectedOption: String;

  constructor (
    private translate: TranslateService,
    public configurationService: ConfigurationScreenService,
    public sharedDataService: SharedDataService,
    public orderConfigService: OrderConfigService,
    public dialog: MatDialog,
    private elRef: ElementRef,
    private renderer: Renderer2,
    public notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });

    this.subscription = this.sharedDataService.notifyMenuChangeObservable$.subscribe((res) => {
      this.showSideBar = res;
    });

    this.orderConfigService.templateDoneLoading.subscribe(value => {
      // build list and map for scrolling coloring
      const categoryList = this.orderConfigService.getActiveJob().groupVO;

      for (let i = 0; i < categoryList.length; i++) {
        this.catMap[ categoryList[ i ].id ] = categoryList[ i ].name;

        if (i === 0) {
          this.currentCategory = categoryList[ i ].name;
          this.currentSectionId = categoryList[ i ].id;
        }
      }

      if (this.orderConfigService.activeJob.exceptionPageObj) {
        this.catMap[ 'ExceptionPage' ] = this.translate.instant('CONFIG.exceptionPages.exceptionPageTitle');
      }

      this.catMap[ 'SpecialInstructions' ] = this.translate.instant('CONFIG.specialInstructions');
      this.notificationService.hideLoader();
    });
  }

  closeOptionsNav() {
    if (this.optionsFullScreen) {
      this.optionsFullScreen = !this.optionsFullScreen;
    } else {
      this.sharedDataService.notifyMenuChange(false);
    }
  }

  openOptionsNav() {
    this.showSideBar = true;
    this.sharedDataService.notifyMenuChange(true);
  }

  toggleOptionsFullScreen() {
    this.optionsFullScreen = !this.optionsFullScreen;
  }

  /**
   * function used to set what option was clicked
   * calls shared data service to pass to canvas component for drawing
   * @param category
   * @param option
   */
  optionSelected(option) {
    this.orderConfigService.canProceed = false;
    if (option.associateMessage !== '' && option.associateMessage !== undefined) {
      const dialogRef = this.dialog.open(AttributeOptionMessageDialogComponent, {
        width: '300px',
        data: {message: option.associateMessage}
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.callPricingSelectedOption(option);
        }
      });
    // } else if (option.customOptions[0].customKey === 'DisplayOnly') {
      // TODO update if statement above to check Attribute Property table
      // Object.keys(this.orderConfigService.activeJob.productDetails[option.id].attributePropertyMap).includes('DisplayOnly') {
      //   const message = this.orderConfigService.activeJob.productDetails[option.id].attributePropertyMap['DisplayOnly'];
      // }
     // const message = option.customOptions[0].customPrompt;
     // this.openInformationDialog(option, message);
    } else {
      this.callPricingSelectedOption(option);
    }
  }

  callPricingSelectedOption(option) {
    this.notificationService.showLoader();
    this.orderConfigService.changeSelectedItem(option);
    this.configurationService.getPricingandConditionalTicketing(
      this.orderConfigService.createTicketingAndPricingObject(option, false , 'CP')).subscribe(result => {
      const data: any = result;
      if (data === null || data === undefined) {
        this.notificationService.hideLoader();
        throw new CustomSBError(this.errorMsgs.pAndCError, this.errorMsgs.pAndCErrorName, false);
      }

      this.orderConfigService.processPricing(data.orderPricing, data.jobs);
      for (let i = 0; i < data.jobs.length; i ++) {
        if ( data.jobs[ i ].activeJob ) {
          this.orderConfigService.processConditionalTicketing(data.jobs[ i ]);
        }
      }
      this.notificationService.hideLoader();
    });
  }

  openOptionsMenu() {
    this.showSideBar = true;
    this.sharedDataService.notifyMenuChange(this.showSideBar);
  }

  /**
   * function to set this.optionsMenuData which stores the list of options that are displayed in the submenu
   * @param cat
   */
  changeOptionsMenu(data) {
    // this.selectedCategory = category;
    this.selectedOption = data.name;
    this.optionsMenuData = data;
    this.sharedDataService.notifyMenuChange(true);
   // this.sharedDataService.notifyClickedOptionData(data);
  }

  count(obj) {
    return Object.keys(obj).length;
  }

  openInformationDialog(option, message): void {
    const messages = message.split('.');
    const dialogRef = this.dialog.open(InformationDialogComponent, {
      data: {
        title: option.value,
        messages: messages,
        closeTitle: this.translate.instant('BUTTON.close')
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.callPricingSelectedOption(option);
      }
    });
  }

  openAttributeOptionDialog(groupVO, title): void {
    const dialogRef = this.dialog.open(AttrOptionSelectorModalComponent, {
      width: '450px',
      data: {groupVO: groupVO, title: title}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.optionSelected(result);
      }
    });
  }

  openCustomInputDialog(option, title): void {
    const dialogRef = this.dialog.open(CustomInputDialogComponent, {
      width: '450px',
      height: 'auto',
      data: {customOption: option, title: title}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.optionSelected(result);
      }
    });
  }

  hasCustomOptions(option) {
    if (this.orderConfigService.activeJob.hasFinishedDimensions
      && Object.keys(this.orderConfigService.activeJob.productDetails[option.id].attributePropertyMap)
      .includes('Finished Dimensions Required')) {
      if ( this.orderConfigService.activeJob.productDetails[option.id]
        .attributePropertyMap['Finished Dimensions Required'].toUpperCase() === 'Y' ) {
        return false;
      }
    }
    if (option.customOptions && option.customOptions.length > 0) {
      return true;
    }
    return false;
  }

  // Sets active link on sidebar based on config options in view
  setActiveSidebarLink(event) {
    const catIDs = [];
    let el, linkEl;
    let elName: string;
    let linkActive = false;

    const categoryList = this.orderConfigService.getActiveJob().groupVO;
    for (let i = 0; i < categoryList.length; i++) {
      catIDs.push(categoryList[ i ].id);
    }

    if (this.orderConfigService.activeJob.exceptionPageObj) {
      catIDs.push('ExceptionPage');
    }

    catIDs.push('SpecialInstructions');

    for (const id in catIDs) {
      elName = 'wrap' + catIDs[ id ].toString();
      el = document.getElementById(elName);
      linkEl = document.getElementById('l' + catIDs[ id ].toString());
      if (this.checkVisibility(el) && !linkActive) {
        this.renderer.addClass(linkEl, 'sidebarLink');
        linkActive = true;
        this.currentCategory = this.catMap[ catIDs[ id ].toString() ];
        this.currentSectionId = catIDs[ id ].toString();
      } else {
        this.renderer.removeClass(linkEl, 'sidebarLink');
      }
    }
  }

  checkVisibility(el) {
    const rect = el.getBoundingClientRect();
    const elemTop = rect.top;
    const elemBottom = rect.bottom;

    const isVisible = elemTop < window.innerHeight && elemBottom >= 130;
    return isVisible;
  }

  addExceptionPage() {
    this.orderConfigService.activeExceptionPage = this.orderConfigService.activeJob.exceptionPageObj;

    const dialogRef = this.dialog.open(ExceptionPageComponent, {
      width: '780px',
      height: 'auto',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  editExceptionPage(id) {
    this.orderConfigService.editExceptionPage(id);

    const dialogRef = this.dialog.open(ExceptionPageComponent, {
      width: '780px',
      height: 'auto',
      data: {edit: true, id: id}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  deleteExceptionPage(id) {
    this.orderConfigService.deleteExceptionPageFromJob(id);
    this.callPricingSelectedOption(this.orderConfigService.getFirstSelectedOption());
  }

  updateSpecialInstructions(specialInstructions) {
    this.orderConfigService.addSpecialInstructionsToJob(specialInstructions);
  }

  dcsTruck(option) {
    if (this.dcsTruckClicked !== null && this.dcsTruckClickCount === 1) {
      this.dcsTruckClickCount = 0;
      clearTimeout(this.dcsTruckClicked);
      this.dcsTruckClicked = null;
      option.dcsAnimate = !option.dcsAnimate;
    } else {
      this.dcsTruckClickCount++;
    }

    if (!this.dcsTruckClicked) {
      this.dcsTruckClicked = setTimeout(() => {
        this.dcsTruckClickCount = 0;
        clearTimeout(this.dcsTruckClicked);
        this.dcsTruckClicked = null;
      }, 5000);
    }
  }

  formatUrl(smallImage: string, file: string) {
    if (!smallImage.endsWith('/')) {
      smallImage = smallImage + '/';
    }
    smallImage = smallImage.replace('resources', 'assets');
    return smallImage + file;
  }

  checkIfGroupIsDisabled(group) {
    for (let grc = 0; grc < group.length; grc++) {
      if (!group[ grc ].isDisabled) {
        return false;
      }
    }
    return true;
  }

  impressionCountInvalid() {

    let toggle =  (!!this.orderConfigService.activeJob.impressions 
      && this.orderConfigService.activeJob.impressions === 1);

    if (!toggle) {
      this.addExceptionTitle = this.translate.instant('CONFIG.exceptionPages.addException');
    } else {
      this.addExceptionTitle = this.translate.instant('CONFIG.exceptionPages.moreThanOne');
    }

    return toggle;
  }

  returnKeys(obj) {
    return Object.keys(obj);
  }

  scrollToAnchor(anchor) {
    const elt = document.querySelector('#' + anchor);
    if (elt) elt.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
  }

}
