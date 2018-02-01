import {Component, ViewChild} from "@angular/core";
import {HttpClient} from '@angular/common/http';

import {NavController, NavParams, AlertController} from "ionic-angular";

import {environment} from '../../../environments/environment';

import {SignaturePad} from 'angular2-signaturepad/signature-pad';

import {FileService} from '../../../components/file/providers/file-service';
import {CodeService} from '../../../components/code/providers/code-service';
import {RendererService} from '../../../components/renderer/providers/renderer-service';
import {OAuthService} from '../../../components/oauth/providers/o-auth-service';
import {LoadingService} from '../../../components/loading/providers/loading-service';

import {FileObject} from '../../../components/file/models/file-object';
import {Code} from '../../../components/code/models/code';

import {Mker} from '../../../components/ftafarm/models/mker';
import {Ledger} from '../../../components/ftafarm/models/ledger';


declare var require: (moduleId: string) => any;
var join = require('join-path');
var moment = require('moment');

@Component({
    selector: 'page-ftafarm-ledger',
    templateUrl: 'ledger.html'
})
export class LedgerPage {
    @ViewChild(SignaturePad) public signaturePad: SignaturePad;

    public signatureTy: string;

    public signatureAt: boolean;
    public signatureNm: string;
    public signatureTelno: string;

    public signaturePadOptions: Object = {
    };

    //프로퍼티
    public mker: Mker;
    public ledger: Ledger;

    public ctvtBeginDt: string;
    public ctvtEndDt: string;
    public shipmntDt: string;
    public wrhousngDt: string;

    //코드
    public qyUnitCode: Code[];

    constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private http: HttpClient, private oAuthService: OAuthService, private loadingService:LoadingService, public rendererService: RendererService, private codeService: CodeService, private fileService: FileService) {
        this.mker = this.navParams.data.mker;
        this.ledger = this.navParams.data.ledger;
        this.signatureTy = 'button';

        this.getLedger();

        //코드 가져오기
        this.codeService.getCodes('/CUSTOM/CT0070')
            .subscribe((code: Code) => {
                this.qyUnitCode = code[0].children;
            });
    }

    ngAfterViewInit() {

    }

    getLedger(): void {
        this.loadingService.present();

        this.http.get(join(environment.dataUrl, '/ftafarm/wrhousng', this.ledger.wrhousngSysSn))
            .take(1)
            .finally(() => {
                this.loadingService.dismiss();
            })
            .subscribe((ledger: Ledger) => {
                this.ledger = ledger;

                console.log('ledger', this.ledger);

                this.ctvtBeginDt = moment(this.ledger.ctvtBeginDt, 'YYYYMMDD').format("YYYY-MM-DDTHH:mm");
                this.ctvtEndDt = moment(this.ledger.ctvtEndDt, 'YYYYMMDD').format("YYYY-MM-DDTHH:mm");
                this.shipmntDt = moment(this.ledger.shipmntDt, 'YYYYMMDD').format("YYYY-MM-DDTHH:mm");
                this.wrhousngDt = moment(this.ledger.wrhousngDt, 'YYYYMMDD').format("YYYY-MM-DDTHH:mm");
            });
    }

    //재배 확인
    saveShipmnt(): void {
        this.ledger.ctvtBeginDt = this.ctvtBeginDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.ctvtEndDt = this.ctvtEndDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.shipmntDt = this.shipmntDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.wrhousngDt = this.wrhousngDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.shipmntMkerNm = this.signatureNm;
        this.ledger.shipmntTlphonNo = this.signatureTelno;

        this.loadingService.present();

        this.fileService.upload(this.fileService.getBlobFromDataURL(this.signaturePad.toDataURL()), 'signature.png')
            .finally(() => {
                this.loadingService.dismiss();
            }).flatMap((file: FileObject) => {
                this.ledger.shipmntMkerSignSn = file.fileSysSn;
                return this.http.post(join(environment.dataUrl, '/ftafarm/wrhousng', this.ledger.wrhousngSysSn), this.ledger).take(1);
            }).subscribe((ledger: Ledger) => {
                let alert = this.alertCtrl.create({
                    title: '확인완료',
                    subTitle: '재배 확인 되었습니다.',
                    buttons: ['닫기']
                });
                alert.present();
                this.signatureTy = 'button';
                this.signatureInit();

                this.getLedger();
            });
    }

    //입고 확인
    saveCnfirm(): void {
        this.ledger.ctvtBeginDt = this.ctvtBeginDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.ctvtEndDt = this.ctvtEndDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.shipmntDt = this.shipmntDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.wrhousngDt = this.wrhousngDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.cnfirmUserNm = this.signatureNm;
        this.ledger.cnfirmUserTelno = this.signatureTelno;

        this.loadingService.present();

        this.fileService.upload(this.fileService.getBlobFromDataURL(this.signaturePad.toDataURL()), 'signature.png')
            .finally(() => {
                this.loadingService.dismiss();
            }).flatMap((file: FileObject) => {
                this.ledger.cnfirmUserSignSn = file.fileSysSn;
                return this.http.post(join(environment.dataUrl, '/ftafarm/wrhousng', this.ledger.wrhousngSysSn), this.ledger).take(1);
            }).flatMap((ledger: Ledger) => {
                return this.http.put(join(environment.dataUrl, '/ftafarm/wrhousng/confirm'), [ledger]).take(1);
            }).flatMap((ledger: Ledger) => {
                return this.http.get(join(environment.dataUrl, '/ftafarm/wrhousng', this.ledger.wrhousngSysSn, 'acptnc')).take(1);
            }).subscribe((ledger: Ledger) => {
                this.ledger = ledger;
                
                let alert = this.alertCtrl.create({
                    title: '확인완료',
                    subTitle: '입고 확인 되었습니다.',
                    buttons: ['닫기']
                });
                alert.present();
                this.signatureTy = 'button';
                this.signatureInit();
                
                this.getLedger();
            });
    }

    //검수 확인
    saveAcptnc(): void {
        this.ledger.ctvtBeginDt = this.ctvtBeginDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.ctvtEndDt = this.ctvtEndDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.shipmntDt = this.shipmntDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.wrhousngDt = this.wrhousngDt.replace(/\-/g, '').substring(0, 8);
        this.ledger.acptncUserNm = this.signatureNm;
        this.ledger.acptncUserTelno = this.signatureTelno;

        this.loadingService.present();

        this.fileService.upload(this.fileService.getBlobFromDataURL(this.signaturePad.toDataURL()), 'signature.png')
            .finally(() => {
                this.loadingService.dismiss();
            }).flatMap((file: FileObject) => {
                this.ledger.acptncUserSignSn = file.fileSysSn;
                return this.http.post(join(environment.dataUrl, '/ftafarm/wrhousng/acptnc', this.ledger.wrhousngSysSn), this.ledger).take(1);
            }).flatMap((ledger: Ledger) => {
                return this.http.put(join(environment.dataUrl, '/ftafarm/wrhousng/acptnc', this.ledger.wrhousngSysSn, 'issue'), ledger).take(1);
            }).subscribe(() => {
                let alert = this.alertCtrl.create({
                    title: '검수완료',
                    subTitle: '검수 확인 되었습니다.',
                    buttons: ['닫기']
                });
                alert.present();
                this.signatureTy = 'button';
                this.signatureInit();

                this.getLedger();
            });
    }

    signatureInit() {
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
        this.signatureAt = false;
    }

    signatureOnEnd() {
        this.signatureAt = true;
    };

    signatureComplete() {
        if (this.signatureTy === 'shipmnt') {
            this.saveShipmnt();
        } else if (this.signatureTy === 'cnfirm') {
            this.saveCnfirm();
        } else if (this.signatureTy === 'acptnc') {
            this.saveAcptnc();
        }
    }

    //재배확인 서명 열기
    openShipmnt(): void {
        this.signatureNm = this.mker.mkerNm;
        this.signatureTelno = this.mker.tlphonNo;
        this.signatureTy = 'shipmnt';
    }

    //입고확인 서명 열기
    openCnfirm(): void {
        this.signatureNm = this.oAuthService.user.userNm;
        this.signatureTelno = this.oAuthService.user.tlphonNo;
        this.signatureTy = 'cnfirm';
    }

    openAcptnc(): void {
        this.signatureNm = this.oAuthService.user.userNm;
        this.signatureTelno = this.oAuthService.user.tlphonNo;
        this.signatureTy = 'acptnc';
    }
}
