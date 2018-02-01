import {Component, ViewChild} from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import {NavController, NavParams, AlertController} from "ionic-angular";

import {SignaturePad} from 'angular2-signaturepad/signature-pad';

import {environment} from '../../../environments/environment';

import {LoadingService} from '../../../components/loading/providers/loading-service';
import {FileService} from '../../../components/file/providers/file-service';
import {FileObject} from '../../../components/file/models/file-object';

import {Mker} from '../../../components/ftafarm/models/mker';
import {Orgplce} from '../../../components/ftafarm/models/orgplce';
import {Fta} from '../../../components/ftafarm/models/fta';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Component({
    selector: 'page-ftafarm-orgplce-detail',
    templateUrl: 'orgplce-detail.html'
})
export class OrgplceDetailPage {
    @ViewChild(SignaturePad) public signaturePad: SignaturePad;

    public signatureAt: boolean;
    public signaturePadOptions: Object = {
    };

    //프로퍼티
    public mker: Mker;
    public orgplce: Orgplce;
    public ftas: Fta[];

    constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private http: HttpClient, private fileService: FileService, private loadingService: LoadingService) {
        this.mker = this.navParams.data.mker;
        this.orgplce = this.navParams.data.orgplce;

        this.getFtas();
        this.getOrgplce();
    }

    getOrgplce(): void {
        this.loadingService.present();

        let params = new HttpParams()
            .set('mkerSysSn', this.mker.mkerSysSn.toString());
        this.http.get(join(environment.dataUrl, '/ftafarm/orgplce/oricon', this.orgplce.issuNo), { params: params })
            .take(1)
            .finally(() => {
                this.loadingService.dismiss();
            })
            .subscribe((orgplce: Orgplce) => {
                this.orgplce = orgplce;
                console.log('orgplce', this.orgplce);
            });
    }

    getFtas(): void {
        let params = new HttpParams()
            .set('issuNo', this.orgplce.issuNo)
            .set('mkerSysSn', this.mker.mkerSysSn.toString());
        this.http.get(join(environment.dataUrl, '/ftafarm/orgplce/oricon/options/fta-codes'), { params: params })
            .take(1)
            .subscribe((ftas: Fta[]) => {
                this.ftas = ftas;
            });
    }

    //서명 이미지
    getSignatureUrl(): string {
        return this.fileService.getUrl(this.orgplce.wrterSignSn, '');
    }

    signatureClear() {
        if (this.signaturePad == null) {
            return;
        }
        this.signaturePad.clear();
        this.signatureAt = false;
    }

    signatureRefresh() {
        this.signatureClear();
        this.orgplce.wrterSignSn = null;
    }

    signatureInit() {
        this.signatureClear();

        //서명 입력하기
        if (this.orgplce.wrterSignSn != null) {
            this.signatureAt = true;
        }
    }

    signatureOnEnd() {
        this.signatureAt = true;
    };

    signatureComplete() {
        //서명 데이터 얻기
        let url = this.signaturePad.toDataURL();

        this.loadingService.present();

        //파일 업로드
        this.fileService.upload(this.fileService.getBlobFromDataURL(url), 'signature.png')
            .flatMap((file: FileObject) => {
                this.orgplce.wrterSignSn = file.fileSysSn;
                this.orgplce.originalIssuNo = this.orgplce.issuNo;
                //확인서 저장
                return this.http.post(join(environment.dataUrl, '/ftafarm/orgplce/oricon', this.orgplce.issuNo, this.mker.mkerSysSn), this.orgplce).take(1);
            }).flatMap((orgplce: Orgplce) => {
                this.orgplce = orgplce;
                //확인서 발급
                return this.http.put(join(environment.dataUrl, '/ftafarm/orgplce/oricon', this.orgplce.issuNo, this.mker.mkerSysSn, 'issue'), this.orgplce).take(1);
            }).finally(() => {
                this.loadingService.dismiss();
            }).subscribe((orgplce: Orgplce) => {
                let alert = this.alertCtrl.create({
                    title: '처리완료',
                    subTitle: '서명 및 제출 처리되었습니다.',
                    buttons: ['닫기']
                });
                alert.present();

                this.getOrgplce();
            });
    }
}
