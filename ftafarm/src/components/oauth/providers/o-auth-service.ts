import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Storage} from '@ionic/storage';

import Rx from "rxjs/Rx";
import 'rxjs/add/operator/map';

import {environment} from '../../../environments/environment';

import {OAuthToken} from "../models/o-auth-token";
import {OAuthUser} from "../models/o-auth-user";
import {OAuthCmpny} from "../models/o-auth-cmpny";

import {LoadingService} from '../../loading/providers/loading-service';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Injectable()
export class OAuthService {

  private isRefreshingToken: boolean;
  private authSubject: Rx.BehaviorSubject<boolean>;

  token: OAuthToken;
  user: OAuthUser;
  cmpnys: OAuthCmpny[];
  cmpny: OAuthCmpny;

  constructor(private http: HttpClient, private storage: Storage, private loadingService: LoadingService) {
    this.isRefreshingToken = false;
    this.authSubject = new Rx.BehaviorSubject(false);

    this.storage.get('token').then(
      token => {
        if (token && token.access_token) {
          this.setToken(token) //토큰 설정
            .flatMap((token: OAuthToken) => this.setUser()) //사용자 설정
            .flatMap((user: OAuthUser) => this.setCmpnys()) //회사 설정
            .subscribe(token => {
              //인증 상태 갱신
              this.authSubject.next(this.token != null);
            });
        }
      }
    );
  }

  //로그인 여부 체크
  isAuthenticated(): Rx.BehaviorSubject<boolean> {
    return this.authSubject;
  }

  //헤더설정
  private getHeader(): HttpHeaders {
    let header: HttpHeaders = new HttpHeaders();
    header = header.append('Content-type', 'application/x-www-form-urlencoded');
    header = header.append('Authorization', 'Basic ' + btoa([environment.clientId, environment.clientSecret].join(':')));

    return header;
  }

  //로그인
  login(username: string, password: string): void {
    this.loadingService.present();

    const options = {headers: this.getHeader()};
    const body = [
      'grant_type=password',
      'username=' + username,
      'password=' + password
    ].join('&');

    this.http.post(join(environment.authUrl, 'oauth/token'), body, options)  //토큰 얻기
      .take(1)
      .finally(() => {
        this.loadingService.dismiss();
      })
      .flatMap((token: OAuthToken) => this.setToken(token)) //토큰 설정
      .flatMap((token: OAuthToken) => this.setUser()) //사용자 설정
      .flatMap((user: OAuthUser) => this.setCmpnys()) //회사 설정
      .subscribe((cmpnys: OAuthCmpny[]) => {
        //인증 상태 갱신, app.component.ts 에서 구독하여 페이지 변경
        this.authSubject.next(this.token != null);
      });
  }

  // 로그아웃
  logout(): Rx.Observable<any> {
    this.loadingService.present();

    //로그인 정보 삭제
    this.removeToken()
      .take(1)
      .finally(() => {
        this.loadingService.dismiss();
      })
      .subscribe(
        token => {
          //인증 상태 갱신
          this.authSubject.next(this.token != null);
        }
      )
    return Rx.Observable.throw('');
  }

  //인증토큰 갱신
  refresh(): Rx.Observable<OAuthToken> {
    console.log('refresh...');

    //토큰정보가 있는 경우에만, 리프레쉬 가능
    if (this.token == null || this.token.refresh_token == null) {
      return null;
    }

    const refresh_token = this.token.refresh_token;
    const options = {headers: this.getHeader()};
    const body = [
      'grant_type=refresh_token',
      'refresh_token=' + refresh_token
    ].join('&');

    return this.removeToken()  //토큰 초기화
      .flatMap(() => this.http.post(join(environment.authUrl, 'oauth/token'), body, options))  //토큰 갱신
      .flatMap((token: OAuthToken) => this.setToken(token)) //토큰 설정
      .take(1);
  }

  //토큰정보 초기화
  removeToken(): Rx.Observable<OAuthToken> {
    this.token = null;

    return Rx.Observable.fromPromise(this.storage.remove('token'))
      .map(token => this.token)
      .take(1);
  }

  //토큰정보 설정
  setToken(token: OAuthToken): Rx.Observable<OAuthToken> {
    if (token)
      console.log('token : ', token.access_token);

    this.token = token;

    return Rx.Observable.fromPromise(this.storage.set('token', token))
      .map(token => this.token)
      .take(1);
  }

  //사용자 정보 가져오기
  setUser(): Rx.Observable<OAuthUser> {
    return this.http.get(join(environment.dataUrl, 'common/member/profile'))  //사용자 정보 얻기
      .flatMap((user: OAuthUser) => {
        this.user = user;

        console.log('user : ', this.user);

        return Rx.Observable.of(this.user);
      }) //사용자 설정
      .take(1);
  }

  //회사 정보 가져오기
  setCmpnys(): Rx.Observable<any> {
    return this.http.get(join(environment.dataUrl, 'common/cmpny'))  //회사 정보 얻기
      .flatMap((cmpnys: OAuthCmpny[]) => {
        this.cmpnys = cmpnys;

        //회사가 하나인 경우 자동 설정
        if (cmpnys && cmpnys.length == 1) {
          this.cmpny = this.cmpnys[0];
        }

        console.log('cmpnys : ', this.cmpnys);

        return Rx.Observable.fromPromise(this.storage.set('cmpny', this.cmpny));
      })
      .take(1);
  }

  //토큰정보 가져오기
  getToken(): OAuthToken {
    return this.token;
  }

  //사용자정보 가져오기
  getUser(): OAuthUser {
    if (this.user == null)
      return this.user = new OAuthUser();
    return this.user;
  }

  //회사정보 가져오기
  getCmpny(): OAuthCmpny {
    if (this.cmpny == null)
      return this.cmpny = new OAuthCmpny();
    return this.cmpny;
  }
}
