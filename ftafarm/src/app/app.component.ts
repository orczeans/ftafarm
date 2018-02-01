import {Component, ViewChild} from "@angular/core";
import {Platform, Nav, AlertController} from "ionic-angular";

import {OAuthService} from '../components/oauth/providers/o-auth-service';
import {FileService} from '../components/file/providers/file-service';

import {HomePage} from "../pages/common/home/home";
import {InfoPage} from "../pages/common/info/info";
import {LoginPage} from "../pages/common/login/login";

import {MkerPage} from "../pages/ftafarm/mker/mker";
import {ItemPage} from "../pages/ftafarm/item/item";

export interface MenuItem {
    title: string;
    component: any;
    icon: string;
    eventType : string;
}

@Component({
    templateUrl: 'app.html'
})

export class MyApp {
    @ViewChild(Nav) nav: Nav;

    appMenuItems: Array<MenuItem>;
    alert: any;

    constructor(public platform: Platform, private oAuthService: OAuthService, private fileService: FileService, private alertCtrl: AlertController) {
        this.initializeApp();

        this.appMenuItems = [
            { title: '홈', component: HomePage, icon: 'home', eventType: 'root' },
            { title: '생산자', component: MkerPage, icon: 'contacts', eventType: 'root' },
            { title: '품목', component: ItemPage, icon: 'leaf', eventType: 'root' },
            { title: '로그아웃', component: InfoPage, icon: 'log-out', eventType: 'logout' },
            { title: '정보', component: InfoPage, icon: 'information-circle', eventType: 'detail' }
        ];
    }

    initializeApp() {
        this.platform.ready().then(() => {

            //로그인 상태에 따른 구독 처리
            this.oAuthService.isAuthenticated()
                .subscribe(
                isAuth => {
                    console.log('isAuth: ', isAuth);
                    if (isAuth) {
                        this.nav.setRoot(HomePage);
                    } else {
                        this.nav.setRoot(LoginPage);
                    }
                }
                );

            //하드웨어 뒤로가기 버튼 처리
            this.platform.registerBackButtonAction(() => {
                if (this.nav.canGoBack()) {
                    this.nav.pop();
                } else {
                    if (this.alert) {
                        this.alert.dismiss();
                        this.alert = null;
                    } else {
                        this.showExitAlert();
                    }
                }
            });
        });
    }

    showExitAlert() {
        this.alert = this.alertCtrl.create({
            title: '종료',
            message: '종료 하시겠습니까?',
            buttons: [
                {
                    text: '취소',
                    role: 'cancel',
                    handler: () => {
                        this.alert = null;
                    }
                },
                {
                    text: '종료',
                    handler: () => {
                        this.platform.exitApp();
                    }
                }
            ]
        });
        this.alert.present();
    }

    //메뉴클릭
    clickMenu(page): void {
        if (page.eventType == 'root') {
            this.nav.setRoot(page.component);
        } else if (page.eventType == 'logout') {
            this.oAuthService.logout()
        } else {
            this.nav.push(page.component);
        }
    }

    //프로필 이미지
    getAvatarUrl(): string {
        return this.fileService.getUrl(this.oAuthService.getUser().userImageSysSn, 'assets/img/avatar.png');
    }
}