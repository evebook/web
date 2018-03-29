import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { DPost } from '../services/post/post.dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PostComponent implements OnInit {

  @Input()
  post: DPost;

  name: string;
  link: any[];
  handle: string;
  image: string;
  content: string | SafeHtml;

  constructor(private router: Router, private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    if (this.post.character) {
      this.name = this.post.character.name;
      this.handle = this.post.character.handle;
      this.link = ['/character', this.post.character.id];
      this.image = this.post.character.portrait.px64x64;
    }
    if (this.post.corporation) {
      this.name = this.post.corporation.name;
      this.handle = this.post.corporation.handle;
      this.link = ['/corporation', this.post.corporation.id];
      this.image = this.post.corporation.icon.px64x64;
    }
    if (this.post.alliance) {
      this.name = this.post.alliance.name;
      this.handle = this.post.alliance.handle;
      this.link = ['/alliance', this.post.alliance.id];
      this.image = this.post.alliance.icon.px64x64;
    }

    const html = this.post.content.replace(
      /#(\w*[0-9a-zA-Z]+\w*[0-9a-zA-Z])/g,
      (hashtag) =>
        `<a href="/hashtag/${hashtag.replace('#', '')}" class="text-link">${hashtag}</a>`);

    this.content = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  openItem() {
    this.router.navigate(this.link);
  }

}