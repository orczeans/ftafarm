import {Component} from "@angular/core";
import {NavController, NavParams, MenuController} from "ionic-angular";
import {HttpClient} from '@angular/common/http';

import Rx from "rxjs/Rx";
import 'rxjs/add/operator/map';

import {OAuthService} from '../../../components/oauth/providers/o-auth-service';
import {LoadingService} from '../../../components/loading/providers/loading-service';

import {InfoPage} from "../../common/info/info";
import {ItemPage} from "../../ftafarm/item/item";
import {MkerPage} from "../../ftafarm/mker/mker";

import {OAuthCmpny} from "../../../components/oauth/models/o-auth-cmpny";

import {environment} from '../../../environments/environment';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    //프로퍼티
    public cmpnys: OAuthCmpny[];
    public cmpny: OAuthCmpny;

    public mkerCnt: number;
    public itemCnt: number;

    constructor(public nav: NavController, public navParams: NavParams, private menuCtrl: MenuController, private http: HttpClient, private loadingService: LoadingService, private oAuthService: OAuthService) {
        this.menuCtrl.swipeEnable(true, 'authenticated');

        //변수 초기화
        this.initializeItems();
    }

    ionViewDidEnter() {

    }

    initializeItems() {
        this.cmpnys = this.oAuthService.cmpnys;
        this.cmpny = this.oAuthService.cmpny;

         this.loadingService.present();

        this.findMkerCnt()
            .finally(() => {
                this.loadingService.dismiss();
            })
            .flatMap(res => {
                this.mkerCnt = res.total;
                return this.findItemCnt();
            })
            .subscribe((res) => {
                this.itemCnt = res.total;
            });
    }

    findMkerCnt(): Rx.Observable<any> {
        return this.http.get(join(environment.dataUrl, 'ftafarm/dashboard/tiles/mker/01'))
            .take(1);
    }

    findItemCnt(): Rx.Observable<any> {
        return this.http.get(join(environment.dataUrl, 'ftafarm/dashboard/tiles/mker/05'))
            .take(1);
    }

    //정보 페이지 이동
    viewInfo(): void {
        this.nav.push(InfoPage);
    }

    //품목 페이지 이동
    viewItems(): void {
        this.nav.push(ItemPage);
    }

    //생산자 페이지 이동
    viewMkers(): void {
        this.nav.push(MkerPage);
    }
}
