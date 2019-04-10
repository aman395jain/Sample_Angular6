import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {environment} from '@env/environment';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {
  public src = '/assets/images/sadstapler.png';
  public routeParams;

  constructor(
    private activatedRoute: ActivatedRoute,
  ) {
      if (environment.production) {

        this.src = '/angular/assets/images/sadstapler.png';

    }
   }

  ngOnInit() {
    this.routeParams = this.activatedRoute.snapshot.queryParams;
  }

}
