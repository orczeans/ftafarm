import {Component} from "@angular/core";
import {NavController, NavParams, Platform} from "ionic-angular";
import { InAppBrowser } from '@ionic-native/in-app-browser';

import {TermsUsePage} from "../terms/terms-use";
import {TermsPrivatePage} from "../terms/terms-private";

@Component({
    selector: 'page-ftafarm-info',
    templateUrl: 'info.html'
})
export class InfoPage {

    constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private iab: InAppBrowser) {

    }

    openURL(url : string) {
        this.iab.create(url);
    }
    
    viewTermsUse(){
        this.navCtrl.push(TermsUsePage);
    }
    
     viewTermsPrivate(){
        this.navCtrl.push(TermsPrivatePage);
    }
}
