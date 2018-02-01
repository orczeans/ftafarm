import {Component} from "@angular/core";
import {NavController, NavParams} from "ionic-angular";

import {Mker} from '../../../components/ftafarm/models/mker';

@Component({
    selector: 'page-ftafarm-terms01',
    templateUrl: 'terms01.html'
})
export class Terms01Page {

    mker: Mker;
    callback: any;

    constructor(public nav: NavController, public navParams: NavParams) {
        this.callback = this.navParams.get("callback");
        this.mker = this.navParams.get("mker");
    }

    termsAt(termsAt: boolean): void {
        this.callback(termsAt).then(() => {
            this.nav.pop();
        });
    }
}
