import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { SearchService } from '../../services/search/search.service';
import { ICharacter } from '../../services/character/character.interface';
import { ICorporation } from '../../services/corporation/corporation.interface';
import { IAlliance } from '../../services/alliance/alliance.interface';

@Component({
  selector: 'app-navbar-search',
  templateUrl: './navbar-search.component.html',
  styleUrls: ['./navbar-search.component.scss'],
})
export class NavbarSearchComponent implements OnInit {

  @select(['search', 'data', 'characters'])
  characters$: Observable<ICharacter[]>;
  charactersLess: Observable<ICharacter[]>;
  showCharacters: Observable<boolean>;

  @select(['search', 'data', 'corporations'])
  corporations$: Observable<ICorporation[]>;
  corporationsLess: Observable<ICorporation[]>;
  showCorporations: Observable<boolean>;

  @select(['search', 'data', 'alliances'])
  alliances$: Observable<IAlliance[]>;
  alliancesLess: Observable<IAlliance[]>;
  showAlliances: Observable<boolean>;

  searchCtrl = new FormControl();

  searchHover = false;
  searchFocus = false;

  private limit = 5;

  constructor(private router: Router, private searchService: SearchService) {

    this.searchCtrl.valueChanges
    .debounceTime(500)
    .subscribe(query => {
      if (query.length > 2) {
        this.searchService.search(query);
      } else if (this.showCharacters || this.showCorporations || this.showAlliances) {
        this.searchService.clear();
      }
    });

    this.charactersLess = this.characters$
    .map(characters => characters.splice(0, this.limit));
    this.showCharacters = this.characters$.map(characters => !!characters.length);

    this.corporationsLess = this.corporations$
    .map(corporation => corporation.splice(0, this.limit));
    this.showCorporations = this.corporations$.map(corporations => !!corporations.length);

    this.alliancesLess = this.alliances$
    .map(alliances => alliances.splice(0, this.limit));
    this.showAlliances = this.alliances$.map(alliances => !!alliances.length);
  }

  ngOnInit() {
  }

  openCharacter(character: ICharacter) {
    this.router.navigate(['/character', character.id])
  }

  openCorporation(corporation: ICorporation) {
    this.router.navigate(['/corporation', corporation.id])
  }

  openAlliance(alliance: IAlliance) {
    this.router.navigate(['/alliance', alliance.id])
  }

  leftSearch() {
    this.searchHover = false;
  }

  enterSearch() {
    this.searchHover = true;
  }

  toggleBlur() {
    this.searchFocus = false;
  }

  toggleFocus() {
    this.searchFocus = true;
  }
}