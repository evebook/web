import { Action } from '@ngrx/store';
import { DPost, DPostList } from './post.dto';

export enum PostActionTypes {
  GET_SUCCESS = '[Post] Get posts success',
  GET_LATEST = '[Post] Get latest posts',
  GET_HASHTAG = '[Post] Get posts for hashtag',
  GET_CHARACTER_WALL = '[Post] Get posts for character wall',
  GET_CORPORATION_WALL = '[Post] Get posts for corporation wall',
  GET_ALLIANCE_WALL = '[Post] Get posts for alliance wall',
  POST_AS_CHARACTER = '[Post] Create post as character',
  POST_AS_CORPORATION = '[Post] Create post as corporation',
  POST_AS_ALLIANCE = '[Post] Create post as alliance',
  POST_SUCCESS = '[Post] Create post success',
}

export class GetSuccess implements Action {
  readonly type = PostActionTypes.GET_SUCCESS;

  constructor(public payload: DPostList) {
  }
}

export class GetLatest implements Action {
  readonly type = PostActionTypes.GET_LATEST;

  constructor(public payload: { page: number, limit: number }) {
  }
}

export class GetHashtag implements Action {
  readonly type = PostActionTypes.GET_HASHTAG;

  constructor(public payload: { hashtag: string, page: number, limit: number }) {

  }
}

export class GetCharacterWall implements Action {
  readonly type = PostActionTypes.GET_CHARACTER_WALL;

  constructor(public payload: { characterId: string, page: number, limit: number }) {
  }
}

export class GetCorporationWall implements Action {
  readonly type = PostActionTypes.GET_CORPORATION_WALL;

  constructor(public payload: { corporationId: string, page: number, limit: number }) {
  }
}

export class GetAllianceWall implements Action {
  readonly type = PostActionTypes.GET_ALLIANCE_WALL;

  constructor(public payload: { allianceId: string, page: number, limit: number }) {
  }
}

export class PostAsCharacter implements Action {
  readonly type = PostActionTypes.POST_AS_CHARACTER;

  constructor(public payload: { content: string, type: 'TEXT', options: any }) {
  }
}

export class PostAsCorporation implements Action {
  readonly type = PostActionTypes.POST_AS_CORPORATION;

  constructor(public payload: { content: string, type: 'TEXT', options: any }) {
  }
}

export class PostAsAlliance implements Action {
  readonly type = PostActionTypes.POST_AS_ALLIANCE;

  constructor(public payload: { content: string, type: 'TEXT', options: any }) {
  }
}

export class PostSuccess implements Action {
  readonly type = PostActionTypes.POST_SUCCESS;

  constructor(public payload: DPost) {
  }
}


export type PostActionsUnion =
  GetSuccess
  | GetLatest
  | GetHashtag
  | GetCharacterWall
  | GetCorporationWall
  | GetAllianceWall
  | PostSuccess
  | PostAsCharacter
  | PostAsCorporation
  | PostAsAlliance;
