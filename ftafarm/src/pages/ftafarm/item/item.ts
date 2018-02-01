import {Component} from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import {NavController, NavParams, MenuController} from "ionic-angular";

import {environment} from '../../../environments/environment';

import {FileService} from '../../../components/file/providers/file-service';
import {OAuthService} from '../../../components/oauth/providers/o-auth-service';
import {RendererService} from '../../../components/renderer/providers/renderer-service';

import {Data} from '../../../components/http/models/data';
import {Item} from '../../../components/ftafarm/models/item';

import {ItemDetailPage} from '../../ftafarm/item/item-detail';
import {InfoPage} from "../../common/info/info";

import {OAuthCmpny} from "../../../components/oauth/models/o-auth-cmpny";

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Component({
  selector: 'page-item',
  templateUrl: 'item.html'
})
export class ItemPage {

  //검색 파리미터
  private nowPage: number;
  private rowPerPage: number;
  public query: string;

  //프로퍼티
  public listTy: string;
  public items: Item[];
  public cmpnys: OAuthCmpny[];
  public cmpny: OAuthCmpny;

  constructor(public nav: NavController, public navParams: NavParams, private http: HttpClient, private menuCtrl: MenuController, private fileService: FileService, private oAuthService: OAuthService, public rendererService: RendererService) {
    this.menuCtrl.swipeEnable(true, 'authenticated');

    //변수 초기화
    this.listTy = 'cmpny';
    this.initializeItems();
  }

  ionViewDidEnter() {
    
    //품목 정보 자동 로드
    this.reset(null);
  }

  initializeItems() {
    this.cmpnys = this.oAuthService.cmpnys;
    this.cmpny = this.oAuthService.cmpny;
    this.items = [];
    this.nowPage = 1;
    this.rowPerPage = 20;
  }

  reset(ev: any) {
    //데이터 초기화
    this.initializeItems();

    //이벤트가 있는 경우, 업데이트
    this.findAll();
  }

  findAll(): void {
    let params = new HttpParams()
      .set('nowPage', this.nowPage.toLocaleString())
      .set('rowPerPage', this.rowPerPage.toLocaleString());

    if (this.listTy === 'all' && this.query != null) {
      params = params.set('itemNm', this.query);
    }else if(this.listTy === 'cmpny'){
      params = params.set('headerOnly', 'Y');      
    }
    
    let url = 'ftafarm/basis/prdctn/item';
    
    if(this.listTy == 'all'){
      url = 'ftafarm/basis/item';
    }

    this.http.get(join(environment.dataUrl, url), {params: params})
      .subscribe((res: Data<Item>) => {
        this.items = this.items.concat(res.data);
      });
  }

  findMore(): void {
    this.nowPage++;
    this.findAll(); 
  }

  //이미지
  getImageUrl(item: Item): string {
    return this.fileService.getUrl(item.prdctnItemImageSn, 'assets/img/blank.png');
  }

  viewOne(item: Item): void {
    this.nav.push(ItemDetailPage, item);
  }

  //정보 페이지 이동
  viewInfo(): void {
    this.nav.push(InfoPage);
  }
  
  addOne(item: Item): void {
    this.http.post(join(environment.dataUrl, 'ftafarm/basis/prdctn/item'), [item])
        .take(1)
        .map(response => <boolean>response)
        .subscribe(() => {
          //탭이동
          this.listTy = 'cmpny';
          //목록 갱신
          this.reset(null);
        });
  }
}
