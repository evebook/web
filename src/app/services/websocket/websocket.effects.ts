import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs/Rx';
import {
  AuthenticateFailed, AuthenticateSuccess,
  Connect, ConnectError, ConnectSuccess, ConnectTimeout, Disconnected, SocketError, SubscribeFail,
  SubscribeSuccess, SubscribeToAllianceWall, SubscribeToCharacterWall, SubscribeToCorporationWall,
  SubscribeToHashtagWall,
  SubscribeToLatestWall, SubscribeToPostComments,
  WebsocketActionTypes,
} from './websocket.actions';
import { IAppState } from '../../app.store';
import { select, Store } from '@ngrx/store';
import { concatMap, filter, map, mergeMap } from 'rxjs/internal/operators';
import { environment } from '../../../environments/environment';
import {
  WS_EVENT_AUTHENTICATION, WS_EVENT_SUBSCRIPTION, WS_NEW_SUBSCRIPTION_EVENT, WS_SUBSCRIBE_EVENTS,
  WS_SUBSCRIPTIONS,
} from './websocket.constants';
import * as io from 'socket.io-client';
import { fromEvent, race } from 'rxjs/index';
import {
  DWebsocketAuthentication, DWebsocketSubscribeToAllianceWall, DWebsocketSubscribeToCharacterWall,
  DWebsocketSubscribeToCorporationWall, DWebsocketSubscribeToHashtagWall,
  DWebsocketSubscribeToLatestWall, DWebsocketSubscribeToPostComment,
} from './websocket.dto';
import {
  DWsNewSubscriptionEvent,
  IAuthenticationResponse, ISubscriptionResponse,
  IWebsocketException,
} from './websocket.interface';
import { MatSnackBar } from '@angular/material';
import { DPost } from '../post/post.dto';
import { NewPost } from '../post/post.actions';
import {
  getPostListKeyForAllianceWall,
  getPostListKeyForCharacterWall, getPostListKeyForCorporationWall, getPostListKeyForHashtagWall,
  getPostListKeyForLatestWall,
} from '../post/post.constants';
import { getCommentListKey } from '../comment/comment.constants';
import { DComment } from '../comment/comment.dto';
import { NewComment } from '../comment/comment.actions';

@Injectable()
export class WebsocketEffects {

  @Effect()
  connect$: Observable<ConnectSuccess | ConnectTimeout | ConnectError> = this.actions$.pipe(
    ofType<Connect>(WebsocketActionTypes.CONNECT),
    mergeMap(action => {
      // If previous connection exists, clean it
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }
      // If socket doesn't exist yet, create new one
      // and add some utility listeners
      this.socket = io((<any>environment).apiEndpoint);

      // Listen for status events
      fromEvent(this.socket, 'disconnect')
      .subscribe(event => this.store.dispatch(new Disconnected()));
      fromEvent<Error>(this.socket, 'error')
      .subscribe(event => this.store.dispatch(new SocketError(event)));

      fromEvent<IWebsocketException>(this.socket, 'exception')
      .subscribe(event => this.showSnackBar(event.status + ' - ' + event.message));

      // Listen for connect events
      return race(
        fromEvent<string>(this.socket, 'connect'),
        fromEvent<string>(this.socket, 'connect_timeout'),
        fromEvent<string>(this.socket, 'connect_error'),
      ).pipe(map(event => {
        if (!event) {
          this.showSnackBar('Websocket connected');
          return new ConnectSuccess();
        }
        if (event === 'timeout') return new ConnectTimeout();
        return new ConnectError();
      }));
    }),
  );

  @Effect()
  authenticate$: Observable<AuthenticateSuccess | AuthenticateFailed> = this.actions$.pipe(
    ofType<ConnectSuccess>(WebsocketActionTypes.CONNECT_SUCCESS),
    mergeMap(action => this.store.pipe(
      select('authentication', 'data', 'accessToken'),
      mergeMap(accessToken => {
        this.socket.emit(WS_EVENT_AUTHENTICATION, new DWebsocketAuthentication(accessToken));
        // Wait for response
        return fromEvent<IAuthenticationResponse>(this.socket, WS_EVENT_AUTHENTICATION).pipe(
          map(event => {
            if (event.success) {
              this.showSnackBar('Websocket Authentication Success');
              return new AuthenticateSuccess();
            }
            this.showSnackBar('Websocket Authentication Failed');
            return new AuthenticateFailed();
          }));
      }),
    )),
  );

  @Effect()
  subscribeToHashtagWall$: Observable<SubscribeSuccess | SubscribeFail> = this.actions$.pipe(
    ofType<SubscribeToHashtagWall>(WebsocketActionTypes.SUBSCRIBE_TO_HASHTAG_WALL),
    concatMap(action => {
      this.socket.emit(
        WS_SUBSCRIBE_EVENTS.TO_HASHTAG_WALL,
        new DWebsocketSubscribeToHashtagWall(action.payload.hashtag));
      // Wait for response
      return fromEvent<ISubscriptionResponse>(this.socket, WS_EVENT_SUBSCRIPTION).pipe(
        map(event => {
          if (event.success) {
            const key = getPostListKeyForHashtagWall(action.payload.hashtag);
            const subscription = fromEvent<DWsNewSubscriptionEvent<DPost>>(
              this.socket,
              WS_NEW_SUBSCRIPTION_EVENT)
            .pipe(
              filter(event => event.subscription === WS_SUBSCRIPTIONS.TO_HASHTAG_WALL),
              // We also need to filter if it applies to our specific subscription
              filter(event => !!event.payload.hashtags.find(
                hashtag => hashtag === action.payload.hashtag,
              )),
            ).subscribe(event => {
              this.store.dispatch(new NewPost({ post: event.payload, key }));
            });
            return new SubscribeSuccess({ key });
          }
          return new SubscribeFail();
        }));
    }));

  @Effect()
  subscribeToCharacterWall$: Observable<SubscribeSuccess | SubscribeFail> = this.actions$.pipe(
    ofType<SubscribeToCharacterWall>(WebsocketActionTypes.SUBSCRIBE_TO_CHARACTER_WALL),
    filter(action => !this.subscriptions[getPostListKeyForCharacterWall(action.payload.characterId)]),
    concatMap(action => {
      this.socket.emit(
        WS_SUBSCRIBE_EVENTS.TO_CHARACTER_WALL,
        new DWebsocketSubscribeToCharacterWall(action.payload.characterId));
      // Wait for response
      return fromEvent<ISubscriptionResponse>(this.socket, WS_EVENT_SUBSCRIPTION).pipe(
        map(event => {
          if (event.success) {
            const key = getPostListKeyForCharacterWall(action.payload.characterId);
            const subscription = fromEvent<DWsNewSubscriptionEvent<DPost>>(
              this.socket,
              WS_NEW_SUBSCRIPTION_EVENT)
            .pipe(
              filter(event => event.subscription === WS_SUBSCRIPTIONS.TO_CHARACTER_WALL),
              // We use == for a reason. As action.payload.characterId can be number
              filter(event =>
                event.payload.characterWall.id == action.payload.characterId ||
                event.payload.character.id == action.payload.characterId,
              ),
            ).subscribe(event => {
              this.store.dispatch(new NewPost({ post: event.payload, key }));
            });
            return new SubscribeSuccess({ key });
          }
          return new SubscribeFail();
        }));
    }));

  @Effect()
  subscribeToLatestWall$: Observable<SubscribeSuccess | SubscribeFail> = this.actions$.pipe(
    ofType<SubscribeToLatestWall>(WebsocketActionTypes.SUBSCRIBE_TO_LATEST_WALL),
    filter(action => !this.subscriptions[getPostListKeyForLatestWall()]),
    concatMap(action => {
      this.socket.emit(
        WS_SUBSCRIBE_EVENTS.TO_LATEST_WALL,
        new DWebsocketSubscribeToLatestWall());
      // Wait for response
      return fromEvent<ISubscriptionResponse>(this.socket, WS_EVENT_SUBSCRIPTION).pipe(
        map(event => {
          if (event.success) {
            const key = getPostListKeyForLatestWall();
            const subscription = fromEvent<DWsNewSubscriptionEvent<DPost>>(
              this.socket,
              WS_NEW_SUBSCRIPTION_EVENT)
            .pipe(
              filter(event => event.subscription === WS_SUBSCRIPTIONS.TO_LATEST_WALL),
            ).subscribe(event => {
              this.store.dispatch(new NewPost({
                post: event.payload,
                key,
              }));
            });
            return new SubscribeSuccess({ key });
          }
          return new SubscribeFail();
        }));
    }));

  @Effect()
  subscribeToCorporationWall$: Observable<SubscribeSuccess | SubscribeFail> = this.actions$.pipe(
    ofType<SubscribeToCorporationWall>(WebsocketActionTypes.SUBSCRIBE_TO_CORPORATION_WALL),
    filter(action => !this.subscriptions[getPostListKeyForCorporationWall(action.payload.corporationId)]),
    concatMap(action => {
      this.socket.emit(
        WS_SUBSCRIBE_EVENTS.TO_CORPORATION_WALL,
        new DWebsocketSubscribeToCorporationWall(action.payload.corporationId));
      // Wait for response
      return fromEvent<ISubscriptionResponse>(this.socket, WS_EVENT_SUBSCRIPTION).pipe(
        map(event => {
          if (event.success) {
            const key = getPostListKeyForCorporationWall(action.payload.corporationId);
            const subscription = fromEvent<DWsNewSubscriptionEvent<DPost>>(
              this.socket,
              WS_NEW_SUBSCRIPTION_EVENT)
            .pipe(
              filter(event => event.subscription === WS_SUBSCRIPTIONS.TO_CORPORATION_WALL),
              // We use == for a reason. As action.payload.corporationId can be number
              filter(event => event.payload.corporationWall.id == action.payload.corporationId
                || event.payload.corporation.id == action.payload.corporationId,
              ),
            ).subscribe(event => {
              this.store.dispatch(new NewPost({ post: event.payload, key }));
            });
            return new SubscribeSuccess({ key });
          }
          return new SubscribeFail();
        }));
    }));

  @Effect()
  subscribeToAllianceWall$: Observable<SubscribeSuccess | SubscribeFail> = this.actions$.pipe(
    ofType<SubscribeToAllianceWall>(WebsocketActionTypes.SUBSCRIBE_TO_ALLIANCE_WALL),
    filter(action => !this.subscriptions[getPostListKeyForAllianceWall(action.payload.allianceId)]),
    concatMap(action => {
      this.socket.emit(
        WS_SUBSCRIBE_EVENTS.TO_ALLIANCE_WALL,
        new DWebsocketSubscribeToAllianceWall(action.payload.allianceId));
      // Wait for response
      return fromEvent<ISubscriptionResponse>(this.socket, WS_EVENT_SUBSCRIPTION).pipe(
        map(event => {
          if (event.success) {
            const key = getPostListKeyForAllianceWall(action.payload.allianceId);
            const subscription = fromEvent<DWsNewSubscriptionEvent<DPost>>(
              this.socket,
              WS_NEW_SUBSCRIPTION_EVENT)
            .pipe(
              filter(event => event.subscription === WS_SUBSCRIPTIONS.TO_ALLIANCE_WALL),
              // We use == for a reason. As action.payload.allianceId can be number
              filter(event => event.payload.allianceWall.id == action.payload.allianceId
                || event.payload.alliance.id == action.payload.allianceId,
              ),
            ).subscribe(event => {
              this.store.dispatch(new NewPost({ post: event.payload, key }));
            });
            return new SubscribeSuccess({ key });
          }
          return new SubscribeFail();
        }));
    }));

  @Effect()
  subscribeToPostComments$: Observable<SubscribeSuccess | SubscribeFail> = this.actions$.pipe(
    ofType<SubscribeToPostComments>(WebsocketActionTypes.SUBSCRIBE_TO_POST_COMMENTS),
    filter(action => !this.subscriptions[getCommentListKey(action.payload.postId)]),
    concatMap(action => {
      this.socket.emit(
        WS_SUBSCRIBE_EVENTS.TO_POST_COMMENTS,
        new DWebsocketSubscribeToPostComment(action.payload.postId));
      // Wait for response
      return fromEvent<ISubscriptionResponse>(this.socket, WS_EVENT_SUBSCRIPTION).pipe(
        map(event => {
          if (event.success) {
            const key = getCommentListKey(action.payload.postId);
            const subscription = fromEvent<DWsNewSubscriptionEvent<DComment>>(
              this.socket,
              WS_NEW_SUBSCRIPTION_EVENT)
            .pipe(
              filter(event => event.subscription === WS_SUBSCRIPTIONS.TO_POST_COMMENTS),
              filter(event => event.payload.postId === action.payload.postId),
            ).subscribe(event => {
              this.store.dispatch(new NewComment({ comment: event.payload, key }));
            });
            return new SubscribeSuccess({ key });
          }
          return new SubscribeFail();
        }));
    }));

  public socket: SocketIOClient.Socket;
  private subscriptions: { [key: string]: boolean };

  constructor(
    private actions$: Actions,
    private store: Store<IAppState>,
    private snackBar: MatSnackBar,
  ) {
    this.store.pipe(select('websocket', 'subscriptions'))
    .subscribe(subscriptions => this.subscriptions = subscriptions)
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, null, { duration: 2500 });
  }

}
