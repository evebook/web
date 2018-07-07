import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DPostList } from '../../services/post/post.dto';
import { DCorporation } from '../../services/corporation/corporation.dto';
import { select, Store } from '@ngrx/store';
import { IAppState } from '../../app.store';
import { GetCorporationWall } from '../../services/post/post.actions';
import { Load } from '../../services/corporation/corporaiton.actions';

@Component({
  selector: 'app-corporation',
  templateUrl: './corporation.component.html',
  styleUrls: ['./corporation.component.scss'],
})
export class CorporationComponent implements OnInit {

  authenticated$: Observable<boolean>;
  corporation$: Observable<DCorporation>;
  wall$: Observable<DPostList>;

  corporation: DCorporation;
  wall: DPostList;

  page: number;

  loadingProfile: boolean = true;
  loadingWall: boolean = true;

  allianceName: string;
  allianceId: number;

  constructor(
    private store: Store<IAppState>,
    private route: ActivatedRoute,
  ) {
    this.authenticated$ = this.store.pipe(select('authentication', 'authenticated'));
    this.corporation$ = this.store.pipe(select('corporation', 'data'));
    this.wall$ = this.store.pipe(select('post', 'list'));

    this.setInitValues();

    let id = this.route.snapshot.params['id'];
    this.store.dispatch(new Load(id));

  }

  ngOnInit() {
    this.corporation$.subscribe(corporation => {
      this.corporation = corporation;
      if (this.corporation) {
        this.loadingProfile = false;
        // After corporation is loaded, start loading the wall
        this.store.dispatch(new GetCorporationWall({
          corporationId: this.corporation.id,
          page: this.page,
          limit: 20,
        }));
      }
      if (this.corporation && this.corporation.alliance) {
        this.allianceId = this.corporation.alliance.id;
        this.allianceName = this.corporation.alliance.name;
      }
    });
    this.wall$.subscribe(wall => {
      this.wall = wall;
      if (this.wall) this.loadingWall = false;
    });
  }

  onScroll() {
    this.page++;
    this.store.dispatch(new GetCorporationWall({
      corporationId: this.corporation.id,
      page: this.page,
      limit: 20,
    }));
  }

  private setInitValues(): void {
    this.loadingProfile = true;
    this.loadingWall = true;
    this.page = 0;
  }

}