import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllianceComponent } from './alliance.component';
import { MatButtonModule, MatCardModule, MatListModule } from '@angular/material';
import { PostFormModule } from '../../post-form/post-form.module';
import { PostModule } from '../../post/post.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FooterModule } from '../../footer/footer.module';
import { LoadingModule } from '../../loading/loading.module';
import { ProfileHeaderModule } from '../header/header.module';
import { PostListModule } from '../../post-list/post-list.module';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    PostFormModule,
    PostModule,
    InfiniteScrollModule,
    FooterModule,
    LoadingModule,
    ProfileHeaderModule,
    PostListModule,
  ],
  declarations: [AllianceComponent],
  exports: [AllianceComponent],
})
export class AllianceModule {
}