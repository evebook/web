import { Action } from '@ngrx/store';
import { Subscription } from 'rxjs/Rx';

export enum WebsocketActionTypes {
  CONNECT = '[Websocket] Try to establish connection',
  CONNECT_SUCCESS = '[Websocket] Successfully connected',
  CONNECT_ERROR = '[Websocket] Connection failed',
  CONNECT_TIMEOUT = '[Websocket] Connection timeout',
  DISCONNECTED = '[Websocket] Connection disconnected',
  AUTHENTICATE = '[Websocket] Authenticate websocket connection',
  AUTHENTICATE_SUCCESS = '[Websocket] Authenticate websocket connection success',
  AUTHENTICATE_FAIL = '[Websocket] Authenticate websocket connection failed',
  ERROR = '[Websocket] Error happened',

  SUBSCRIBE_TO_LATEST_WALL = '[Websocket] Subscribe to latest wall',
  SUBSCRIBE_TO_HASHTAG_WALL = '[Websocket] Subscribe to hashtag wall',
  SUBSCRIBE_TO_CHARACTER_WALL = '[Websocket] Subscribe to character wall',
  SUBSCRIBE_TO_CORPORATION_WALL = '[Websocket] Subscribe to corporation wall',
  SUBSCRIBE_TO_ALLIANCE_WALL = '[Websocket] Subscribe to alliance wall',
  SUBSCRIBE_TO_POST_COMMENTS = '[Websocket] Subscribe to post comments',
  SUBSCRIBE_SUCCESS = '[Websocket] Subscribe success',
  SUBSCRIBE_FAIL = '[Websocket] Subscribe fail',
}

export class Connect implements Action {
  readonly type = WebsocketActionTypes.CONNECT;
}

export class ConnectSuccess implements Action {
  readonly type = WebsocketActionTypes.CONNECT_SUCCESS;
}

export class ConnectTimeout implements Action {
  readonly type = WebsocketActionTypes.CONNECT_TIMEOUT;
}

export class ConnectError implements Action {
  readonly type = WebsocketActionTypes.CONNECT_ERROR;
}

export class Disconnected implements Action {
  readonly type = WebsocketActionTypes.DISCONNECTED;
}

export class Authenticate implements Action {
  readonly type = WebsocketActionTypes.AUTHENTICATE;

  constructor(public payload: string) {
  }
}

export class AuthenticateSuccess implements Action {
  readonly type = WebsocketActionTypes.AUTHENTICATE_SUCCESS;
}

export class AuthenticateFailed implements Action {
  readonly type = WebsocketActionTypes.AUTHENTICATE_FAIL;
}

export class SocketError implements Action {
  readonly type = WebsocketActionTypes.ERROR;

  constructor(public payload: Error) {
  }
}

export class SubscribeToLatestWall implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_TO_LATEST_WALL;
}

export class SubscribeToHashtagWall implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_TO_HASHTAG_WALL;

  constructor(public payload: { hashtag: string }) {
  }
}

export class SubscribeToCharacterWall implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_TO_CHARACTER_WALL;

  constructor(public payload: { characterId: number|string }) {
  }
}

export class SubscribeToCorporationWall implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_TO_CORPORATION_WALL;

  constructor(public payload: { corporationId: number|string }) {
  }
}

export class SubscribeToAllianceWall implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_TO_ALLIANCE_WALL;

  constructor(public payload: { allianceId: number|string }) {
  }
}

export class SubscribeToPostComments implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_TO_POST_COMMENTS;

  constructor(public payload: { postId: string }) {
  }
}

export class SubscribeSuccess implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_SUCCESS;

  constructor(public payload: { key: string }){
  }
}

export class SubscribeFail implements Action {
  readonly type = WebsocketActionTypes.SUBSCRIBE_FAIL;
}

export type WebsocketActionsUnion =
  Authenticate
  | AuthenticateSuccess
  | AuthenticateFailed
  | Connect
  | ConnectSuccess
  | ConnectError
  | ConnectTimeout
  | Disconnected
  | SocketError
  | SubscribeToLatestWall
  | SubscribeToHashtagWall
  | SubscribeToCharacterWall
  | SubscribeToCorporationWall
  | SubscribeToAllianceWall
  | SubscribeToPostComments
  | SubscribeSuccess
  | SubscribeFail;
