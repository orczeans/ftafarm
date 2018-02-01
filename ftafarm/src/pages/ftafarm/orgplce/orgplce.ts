import {Component} from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import {NavController, NavParams} from "ionic-angular";

import {environment} from '../../../environments/environment';

import {Data} from '../../../components/http/models/data';

import {LoadingService} from '../../../components/loading/providers/loading-service';

import {Mker} from '../../../components/ftafarm/models/mker';
import {Orgplce} from '../../../components/ftafarm/models/orgplce';

import {OrgplceDetailPage} from './orgplce-detail';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Component({
    selector: 'page-ftafarm-orgplce',
    templateUrl: 'orgplce.html'
})
export class OrgplcePage {

    public orgplceStartDt: string;
    public orgplceEndDt: string;

    //프로퍼티
    public mker: Mker;
    public orgplces: Orgplce[];

    constructor(public navCtrl: NavController, public navParams: NavParams, private http: HttpClient, private loadingService: LoadingService) {
        this.mker = this.navParams.data;

        this.orgplceStartDt = new Date().toISOString();
        this.orgplceEndDt = new Date().toISOString();

        this.getOrgplce();
    }

    getOrgplce(): void {
        let params = new HttpParams()
            .set('startDate', this.orgplceStartDt.replace(/\-/g, '').substring(0, 8))
            .set('endDate', this.orgplceEndDt.replace(/\-/g, '').substring(0, 8))
            .set('mkerSysSn', this.mker.mkerSysSn.toString());

        this.loadingService.present();

        this.http.get(join(environment.dataUrl, 'ftafarm/orgplce/oricon'), { params: params })
            .take(1)
            .finally(() => {
                this.loadingService.dismiss();
            })
            .subscribe((res: Data<Orgplce>) => {
                this.orgplces = res.data;
            });
    }

    addOrgplce(): void {
        let params = new HttpParams()
            .set('mkerSysSn', this.mker.mkerSysSn.toString());

        this.loadingService.present();

        this.http.get(join(environment.dataUrl, '/ftafarm/orgplce/oricon/options/import'), { params: params })
            .take(1)
            .finally(() => {
                this.loadingService.dismiss();
            })
            .subscribe((orgplce: Orgplce) => {
                this.viewOrgplce(orgplce);
            });
    }

    viewOrgplce(orgplce: Orgplce): void {
        this.navCtrl.push(OrgplceDetailPage, { mker: this.mker, orgplce: orgplce });
    }
}
