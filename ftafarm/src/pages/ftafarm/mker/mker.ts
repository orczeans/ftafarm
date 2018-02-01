import {Component} from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import {NavController, NavParams, MenuController} from "ionic-angular";

import {environment} from '../../../environments/environment';

import {FileService} from '../../../components/file/providers/file-service';
import {OAuthService} from '../../../components/oauth/providers/o-auth-service';

import {Data} from '../../../components/http/models/data';
import {Mker} from '../../../components/ftafarm/models/mker';

import {MkerDetailPage} from '../../ftafarm/mker/mker-detail';
import {InfoPage} from "../../common/info/info";

import {OAuthCmpny} from "../../../components/oauth/models/o-auth-cmpny";

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Component({
  selector: 'page-home',
  templateUrl: 'mker.html'
})
export class MkerPage {

  //검색 파리미터
  private nowPage: number;
  private rowPerPage: number;
  public query: string;

  //프로퍼티
  public mkers: Mker[];
  public cmpnys: OAuthCmpny[];
  public cmpny: OAuthCmpny;

  constructor(public nav: NavController, public navParams: NavParams, private http: HttpClient, private menuCtrl: MenuController, private fileService: FileService, private oAuthService: OAuthService) {
    this.menuCtrl.swipeEnable(true, 'authenticated');

    //변수 초기화
    this.initializeItems();
  }
  
  ionViewDidEnter() {
    //생산자 정보 자동 로드
    this.reset(null);
  }

  initializeItems() {
    this.cmpnys = this.oAuthService.cmpnys;
    this.cmpny = this.oAuthService.cmpny;
    this.mkers = [];
    this.nowPage = 1;
    this.rowPerPage = 20;
  }

  reset(ev: any) {
    //데이터 초기화
    this.initializeItems();

    //이벤트
    //let val = ev.target.value;

    //이벤트가 있는 경우, 업데이트
    this.findAll();
  }

  findAll(): void {
    let params = new HttpParams()
      .set('nowPage', this.nowPage.toLocaleString())
      .set('rowPerPage', this.rowPerPage.toLocaleString());

    if (this.query != null) {
      params = params.set('query', this.query);
    }

    this.http.get(join(environment.dataUrl, 'ftafarm/mker'), {params: params})
      .subscribe((res: Data<Mker>) => {
        this.mkers = this.mkers.concat(res.data);
      });
  }
  
  findMore(): void {
    this.nowPage++;
    this.findAll(); 
  }

  //생산자 이미지
  getImageUrl(mker: Mker): string {
    return this.fileService.getUrl(mker.mkerImageSn, 'assets/img/avatar.png');
  }

  viewOne(mker: Mker, btnTy: string): void {
    this.nav.push(MkerDetailPage, {mker: mker, btnTy: btnTy});
  }

  //정보 페이지 이동
  viewInfo(): void {
    this.nav.push(InfoPage);
  }

}
