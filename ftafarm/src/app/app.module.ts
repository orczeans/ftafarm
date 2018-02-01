import {NgModule} from "@angular/core";
import {IonicApp, IonicModule} from "ionic-angular";
import {HttpModule} from '@angular/http';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {IonicStorageModule} from '@ionic/storage';
import {Camera} from '@ionic-native/camera';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import {SignaturePadModule} from 'angular2-signaturepad';
import {FileUploadModule} from "ng2-file-upload";

import {MyApp} from "./app.component";

import {HomePage} from "../pages/common/home/home";
import {LoginPage} from "../pages/common/login/login";
import {InfoPage} from "../pages/common/info/info";
import {TermsUsePage} from "../pages/common/terms/terms-use";
import {TermsPrivatePage} from "../pages/common/terms/terms-private";

import {OAuthInterceptor} from '../components/oauth/interceptors/o-auth-interceptor';
import {OAuthService} from '../components/oauth/providers/o-auth-service';
import {FileService} from '../components/file/providers/file-service';
import {CodeService} from '../components/code/providers/code-service';
import {RendererService} from '../components/renderer/providers/renderer-service';
import {LoadingService} from '../components/loading/providers/loading-service';

import {MkerPage} from "../pages/ftafarm/mker/mker";
import {MkerDetailPage} from "../pages/ftafarm/mker/mker-detail";
import {ItemPage} from "../pages/ftafarm/item/item";
import {ItemDetailPage} from "../pages/ftafarm/item/item-detail";
import {LedgerPage} from "../pages/ftafarm/ledger/ledger";
import {DocumentPage} from "../pages/ftafarm/document/document";
import {Terms01Page} from "../pages/ftafarm/terms/terms01";
import {Terms02Page} from "../pages/ftafarm/terms/terms02";
import {OrgplcePage} from "../pages/ftafarm/orgplce/orgplce";
import {OrgplceDetailPage} from "../pages/ftafarm/orgplce/orgplce-detail";
import {OrgplceDetailFilter} from "../pages/ftafarm/orgplce/orgplce-detail-filter";

// import services
// end import services
// end import services

// import pages
// end import pages

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        LoginPage,
        InfoPage,
        TermsUsePage,
        TermsPrivatePage,
        MkerPage,
        MkerDetailPage,
        ItemPage,
        ItemDetailPage,
        LedgerPage,
        DocumentPage,
        Terms01Page,
        Terms02Page,
        OrgplcePage,
        OrgplceDetailPage,
        OrgplceDetailFilter
    ],
    imports: [
        HttpModule,
        HttpClientModule,
        BrowserModule,
        SignaturePadModule,
        FileUploadModule,
        IonicModule.forRoot(MyApp, {
            iconMode: 'md',
            mode: 'md'
        }),
        IonicStorageModule.forRoot({
            name: '__mydb',
            driverOrder: ['indexeddb', 'sqlite', 'websql']
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        LoginPage,
        InfoPage,
        TermsUsePage,
        TermsPrivatePage,
        MkerPage,
        MkerDetailPage,
        ItemPage,
        ItemDetailPage,
        LedgerPage,
        DocumentPage,
        Terms01Page,
        Terms02Page,
        OrgplcePage,
        OrgplceDetailPage
    ],
    providers: [
        //브라우져
        InAppBrowser,
        //카메라
        Camera,

        //oAuth 인증 관련
        OAuthInterceptor,
        OAuthService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: OAuthInterceptor,
            multi: true
        },

        //file 관련
        FileService,

        //코드 관련
        CodeService,

        //렌더링 관련
        RendererService,
        
        //로딩 관련
        LoadingService
    ]
})

export class AppModule {
}
