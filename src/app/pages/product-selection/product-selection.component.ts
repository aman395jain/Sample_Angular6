import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy, ChangeDetectorRef} from '@angular/core';
import Shuffle from 'shufflejs';
import {TreeComponent} from 'angular-tree-component/dist/components/tree.component';
import {TREE_ACTIONS, KEYS, ITreeOptions} from 'angular-tree-component/dist/angular-tree-component';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {CommonConstants} from '@app/config/common-constants';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {ProductsService} from '@app/pages/product-selection/services/products/products.service';

@Component({
  selector: 'app-product-selection',
  templateUrl: './product-selection.component.html',
  styleUrls: ['./product-selection.component.css']
})

export class ProductSelectionComponent implements OnInit, OnDestroy, AfterViewInit {



  @ViewChild('focusElement') focusEl: ElementRef;
  products = [];
  categories = [];
  favorites: Map<number, any> = new Map<number, any>();
  favKeys: any;
  navNodes = [{'id': 9999999, 'name': 'All'}];
  productSubscription: any;
  selectedFilter = 'All';
  shuffleInstance: any;
  gridContainerElement = document.getElementById('my-shuffle-container');
  prodCount = 0;
  displaySort = false;
  showFavorites = false;

  private allowed_workfront_category: Array<any> = CommonConstants.ALLOWED_WORKFRONT_CATEGORY;

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  options: ITreeOptions = {
    actionMapping: {
      mouse: {
        click: (tree, node, $event) => {
          this.selectedFilter = node.data.name;
          this.filter(node.id);
          TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
          if (node.hasChildren) {
            TREE_ACTIONS.EXPAND(tree, node, $event);
          }
        }
      },
      keys: {
        [KEYS.ENTER]: (tree, node, $event) => {
          node.expandAll();
        }
      }
    }
  };

  constructor(
    public productService: ProductsService,
    private router: Router,
    private translate: TranslateService,
    private orderConfigService: OrderConfigService,
    private notificationService: NotificationService,
    private changeDetRef: ChangeDetectorRef,
    private LOGGER: LoggerService
  ) {
  }

  ngOnInit() {
    if (!this.notificationService._loading$) {
      this.notificationService.showLoader();
    }
    // Call product service to get list of products
    this.productSubscription = this.productService.retrieveStoreProducts().subscribe(result => {
        const data: any = result;

        // Loop through array of objects of categories which have a products property under it
        data.forEach(obj => {

          // add category to tree
          this.categories[obj.id] = obj;
          const temp = {
            'id': obj.id,
            'name': obj.name,
            'classes': ['productSection']
          };
          const tempChildren = [];

          /*
          if prodcut property  is not null loop through products to add to screen
           */
          if (obj.products != null) {
            obj.products.forEach(prod => {
              const tempC = {
                'id': prod.id,
                'name': prod.name,
                'isFavorite': true,
                'classes': ['productCategory']
              };

              if (prod.hasPreconfiguredProducts === 'Y') {
                prod.preconfiguredProducts.forEach(preConfig => {
                  let temp = [];
                  temp.push(prod.categoryId);
                  temp.push(preConfig.productId);
                  preConfig.groups = JSON.stringify(temp);
                  preConfig.categoryId = obj.id;
                  preConfig.categoryCode = obj.code;

                  if (preConfig.smallImageUrl.includes('resources')) {
                    preConfig.smallImageUrl = preConfig.smallImageUrl.replace('resources', 'assets');
                  }
                  preConfig.smallImageName = preConfig.smallImageName.replace('wid=260&hei=260', 'wid=200&hei=200');

                  if (!preConfig.smallImageUrl.endsWith('/')) {
                    preConfig.smallImageUrl += '/';
                  }
                  preConfig.imgUrl = preConfig.smallImageUrl + '' + preConfig.smallImageName;

                  const displaySequence = preConfig.displaySequence || 10;
                  preConfig.displaySequence = displaySequence + (100 * obj.displaySequence);
                  preConfig.isFavorite = false;

                  this.products.push(preConfig);
                });
              } else {
                let temp = [];
                temp.push(prod.categoryId);
                temp.push(prod.id);
                temp.push(obj.id);
                prod.groups = JSON.stringify(temp);
                prod.categoryId = obj.id;
                prod.categoryCode = obj.code;
                prod.isFavorite = false;

                if (prod.smallImageUrl.includes('resources')) {
                  prod.smallImageUrl = prod.smallImageUrl.replace('resources', 'assets');
                }
                prod.smallImageName = prod.smallImageName.replace('wid=260&hei=260', 'wid=200&hei=200');

                if (!prod.smallImageUrl.endsWith('/')) {
                  prod.smallImageUrl += '/';
                }
                prod.imgUrl = prod.smallImageUrl + '' + prod.smallImageName;

                const displaySequence = prod.displaySequence || 10;
                prod.displaySequence = displaySequence + (100 * obj.displaySequence);

                this.products.push(prod);

              }

              tempChildren.push(tempC);
            });
          }
          temp['children'] = tempChildren;
          this.navNodes.push(temp);
        });
        this.tree.treeModel.update();
        this.notificationService.hideLoader();
      },
      err => {
        this.notificationService.hideLoader();
        this.LOGGER.error('error products component' + err);
      });
  }

  ngAfterViewInit() {
    this.focusEl.nativeElement.focus();
    this.changeDetRef.detectChanges();
  }

  /**
   * unsubscribe from subscription to prevent memory leak
   */
  ngOnDestroy() {
    this.productSubscription.unsubscribe();
  }

  favorite(product: any, i: any) {
    if (product.isFavorite) {
      product.isFavorite = false;
      this.favorites.delete(i);
      this.favKeys = Array.from(this.favorites.keys());
    } else {
      product.isFavorite = true;
      this.favorites.set(i, JSON.parse(JSON.stringify(product)));
      this.favKeys = Array.from(this.favorites.keys());
    }
  }
  /**
   * function called by domChange directive to detect when all products have finished loading to initialize
   * shuffle.js
   * @param $event
   */
  onDomChange($event): void {
    if ($event.addedNodes.length === 0) {
      return;
    }

    if ($event.addedNodes[0].localName === 'mat-card') {
      this.prodCount++;
    }
    if (this.prodCount === this.products.length && this.products.length > 0) {
      this.shuffleInstance = new Shuffle(document.getElementById('my-shuffle-container'), {
        itemSelector: '.shuffle-item',
        columnWidth: 220,
        gutterWidth: 20,
        isCentered: false
      });

      this.shuffleInstance.sort({by: this.sortByAlphabetical});

      this.gridContainerElement = document.getElementById('my-shuffle-container');
      // this.notificationService.hideLoader();
    }
  }

  /**
   * function used to filter products based on what is selected from tree
   * @param group
   */
  filter(group) {
    // show all products
    if (group === 9999999) {
      group = null;
    }

    const sortOptions = {by: (this.displaySort) ? this.sortByDisplaySequence : this.sortByAlphabetical};
    this.shuffleInstance.filter(group, sortOptions);
  }

  /**
   * function used to filter based on what is typed in the search box
   * @param event
   */
  onKey(event) {
    this.selectedFilter = event.target.value;
    const searchText = event.target.value.toLowerCase();
    const sortOptions = {by: (this.displaySort) ? this.sortByDisplaySequence : this.sortByAlphabetical};
    this.shuffleInstance.filter(function (element, shuffle) {
      const titleElement = element.querySelector('.productTitle');
      const titleText = titleElement.textContent.toLowerCase().trim();

      return titleText.indexOf(searchText) !== -1;
    }, sortOptions);
  }

  /**
   * set required product data in orderconfig service before routing to config page
   * @param product
   */
  selectProduct(product) {
    if (this.allowed_workfront_category.indexOf(product.categoryCode) >= 0) {
        this.orderConfigService.hasWorkFrontJob = true;
    }
    this.orderConfigService.setActiveConfigProduct(product);
    this.notificationService.showLoader();
    this.router.navigate(['/config'], { queryParams: { product: product.code } });
  }

  sortByDisplaySequence(element) {
    return parseInt(element.getAttribute('displaySequence'), 10);
  }

  sortByAlphabetical(element) {
    return element.getAttribute('title').toLowerCase();
  }

  updateSort($event) {
    this.displaySort = $event.checked;
    const sortOptions = {by: (this.displaySort) ? this.sortByDisplaySequence : this.sortByAlphabetical};
    this.shuffleInstance.sort(sortOptions);
  }
}
