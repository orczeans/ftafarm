import {Injectable, Injector} from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpErrorResponse, HttpProgressEvent, HttpResponse, HttpUserEvent} from '@angular/common/http';

import {AlertController} from "ionic-angular";

import Rx from "rxjs/Rx";
import 'rxjs/add/operator/map';

import {environment} from '../../../environments/environment';

import {OAuthService} from '../../../components/oauth/providers/o-auth-service';

@Injectable()
export class OAuthInterceptor implements HttpInterceptor {

  private isRefreshingToken: boolean;
  private tokenSubject: Rx.BehaviorSubject<string>;

  private oauthService: OAuthService;

  constructor(private injector: Injector) {
    this.isRefreshingToken = false;
    this.tokenSubject = new Rx.BehaviorSubject<string>(null);
  }

  //HTTP 요청을 가로 챔
  intercept(req: HttpRequest<any>, next: HttpHandler): Rx.Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    this.oauthService = this.injector.get(OAuthService);

    return next.handle(this.getRequst(req))
      .catch(error => {
        if (error instanceof HttpErrorResponse) {
          switch ((<HttpErrorResponse>error).status) {
            case 401:
              return this.handle401Error(req, next);
            case 403:
              return this.oauthService.logout();
            default:
              return this.handleMessageError(error);
          }
        } else {
          return Rx.Observable.throw(error);
        }
      }).finally(() => {

      });
  }

  //헤더를 변경하여 Requst 생성
  private getRequst(req: HttpRequest<any>): HttpRequest<any> {
    let headers = req.headers;
    //인증정보를 가지지 않은 경우만 인증 정보 추가
    if (this.oauthService.token && req.headers.get('Authorization') == null) {
      headers = headers.set('Authorization', 'Bearer ' + this.oauthService.token.access_token);
    }
    //시스템 정보 추가
    headers = headers.set('X-System-Sys-Sn', environment.systemId);

    //회사 정보 추가
    if (this.oauthService.cmpny) {
      console.log('this.oauthService.cmpny.cmpnySysSn', this.oauthService.cmpny.cmpnySysSn);
      headers = headers.set('X-Cmpny-Sys-Sn', this.oauthService.cmpny.cmpnySysSn.toString());
    }

    return req.clone({headers: headers});
  }

  //토큰 갱신 필요 오류의 경우
  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      // 리프레쉬 토큰이 처리되개 전, 기타 요청들 대기상태로
      this.tokenSubject.next(null);

      //토큰 갱신을 처리
      this.oauthService.refresh().switchMap(token => {
        this.tokenSubject.next(this.oauthService.token.access_token);
        return next.handle(this.getRequst(req));
      })
        .catch(error => {
          return this.oauthService.logout();
        })
        .finally(() => {
          this.isRefreshingToken = false;
        });
    } else {
      return this.tokenSubject
        .filter(token => token != null)
        .take(1)
        .switchMap(token => {
          return next.handle(this.getRequst(req));
        });
    }
  }

  //메세지 표시 필요 오류의 경우
  handleMessageError(error: HttpErrorResponse) {
    const alertCtrl = this.injector.get(AlertController);

    let title = '오류';
    let message = '';

    console.log('e', error.error);

    if(error.error == null){
      message = '관리자에게 문의해 주세요.';
    }else if (typeof error.error.message === 'string') {
      message = error.error.message;
    }else if (typeof error.error === 'object') {
      message = error.error.error_description;
    }

    const alert = alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: '닫기',
          role: 'cancel',
          handler: () => {}
        }
      ]
    });
    alert.present();

    return Rx.Observable.throw("");
  }
}
