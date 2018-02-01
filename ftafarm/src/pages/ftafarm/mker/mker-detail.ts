import {Component, ViewChild} from "@angular/core";
import {HttpClient, HttpParams} from '@angular/common/http';
import {NavController, NavParams, AlertController} from "ionic-angular";

import {SignaturePad} from 'angular2-signaturepad/signature-pad';

import {environment} from '../../../environments/environment';

import {FileService} from '../../../components/file/providers/file-service';
import {CodeService} from '../../../components/code/providers/code-service';
import {RendererService} from '../../../components/renderer/providers/renderer-service';
import {LoadingService} from '../../../components/loading/providers/loading-service';

import {FileObject} from '../../../components/file/models/file-object';
import {Code} from '../../../components/code/models/code';
import {Data} from '../../../components/http/models/data';

import {Mker} from '../../../components/ftafarm/models/mker';
import {MkerDoc} from '../../../components/ftafarm/models/mker-doc';
import {Lot} from '../../../components/ftafarm/models/lot';
import {Item} from '../../../components/ftafarm/models/item';
import {Ledger} from '../../../components/ftafarm/models/ledger';

import {ItemDetailPage} from '../item/item-detail';
import {LedgerPage} from '../ledger/ledger';
import {Terms01Page} from "../terms/terms01";
import {Terms02Page} from "../terms/terms02";
import {DocumentPage} from "../document/document";
import {OrgplcePage} from '../orgplce/orgplce';

declare var require: (moduleId: string) => any;
var join = require('join-path');
var numeral = require('numeral');
var moment = require('moment');

@Component({
  selector: 'page-ftafarm-mker',
  templateUrl: 'mker-detail.html'
})
export class MkerDetailPage {
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;

  public signaturePadOptions: Object = {
  };

  //프로퍼티
  public mker: Mker;
  public btnTy: string;
  public lotAr: number;
  public lotArStr: string;

  public terms01At: boolean;
  public terms02At: boolean;
  public signatureAt: boolean;

  public ledgerStartDt: string;
  public ledgerEndDt: string;

  public ledgers: Ledger[];

  //코드
  public docCode01: Code[];
  public docCode02: Code[];
  public sttusCode: Code[];

  constructor(public nav: NavController, private alertCtrl: AlertController, public navParams: NavParams, private http: HttpClient, private codeService: CodeService, private loadingService: LoadingService, public rendererService: RendererService, private fileService: FileService) {
    this.mker = this.navParams.data.mker;
    this.btnTy = this.navParams.data.btnTy;

    this.ledgerStartDt = moment().format("YYYY-MM-DDTHH:mm");
    this.ledgerEndDt = moment().format("YYYY-MM-DDTHH:mm");

    //생산저 정보 가져오기
    this.findOne();

    //코드 가져오기
    this.codeService.getCodes('/FTAFARM/MKERDOC')
      .subscribe((code: Code) => {
        this.docCode01 = code[0].children;
      });
    this.codeService.getCodes('/FTAFARM/ORGPLCE')
      .subscribe((code: Code) => {
        this.docCode02 = code[0].children;
      });
    this.codeService.getCodes('/FTAFARM/WRHOUSNG')
      .subscribe((code: Code) => {
        this.sttusCode = code[0].children;
      });
  }

  ionViewDidEnter() {
    this.findOne();
    
    this.findAllForLedger();
  }

  findOne(): void {
    this.loadingService.present();

    this.http.get(join(environment.dataUrl, 'ftafarm/mker', this.mker.mkerSysSn, 'mobile'))
      .take(1)
      .finally(() => {
        this.loadingService.dismiss();
      })
      .subscribe((res: Mker) => {
        this.mker = res;

        //필지 면적 구하기
        this.setLotAr();

        //서명 초기화
        this.signatureInit();
      });
  }

  findAllForLedger(): void {
    let params = new HttpParams()
      .set('startDate', this.ledgerStartDt.replace(/\-/g, '').substring(0, 8))
      .set('endDate', this.ledgerEndDt.replace(/\-/g, '').substring(0, 8))
      .set('mkerSysSn', this.mker.mkerSysSn.toString())
      .set('withItem', 'Y');

    this.http.get(join(environment.dataUrl, 'ftafarm/wrhousng'), {params: params})
      .take(1)
      .subscribe((res: Data<Ledger>) => {
        this.ledgers = res.data;
      });
  }

  //생산자 이미지
  getImageUrl(): string {
    return this.fileService.getUrl(this.mker.mkerImageSn, 'assets/img/avatar.png');
  }

  //생산자 셔멍 이미지
  getSignatureUrl(): string {
    return this.fileService.getUrl(this.mker.mkerSignSn, '');
  }

  setLotAr(): void {
    this.lotAr = 0;

    //필지 면적 구하기
    if (this.mker.lotList) {
      for (let lot of this.mker.lotList as Lot[]) {
        this.lotAr = this.lotAr + lot.lotAr;
      }
    }

    this.lotArStr = (numeral(this.lotAr).format('0,0.00'));
  }

  viewItem(item: Item): void {
    this.nav.push(ItemDetailPage, item);
  }

  onItemCheck(ev: boolean, item: Item): void {
    //추가하는 경우
    if (item.itemSeq == null) {
      this.http.post(join(environment.dataUrl, 'ftafarm/mker', this.mker.mkerSysSn, 'lot', item.lotSeq, 'item'), item)
        .take(1)
        .map(response => <boolean>response)
        .subscribe(() => {
          //정보 갱신
          this.findOne();
        });

      //삭제하는 경우
    } else {
      this.http.delete(join(environment.dataUrl, 'ftafarm/mker', this.mker.mkerSysSn, 'lot', item.lotSeq, 'item', item.itemSeq))
        .take(1)
        .map(response => <boolean>response)
        .subscribe(() => {
          //정보 갱신
          this.findOne();
        });
    }
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
    this.mker.mkerSignSn = null;
  }

  signatureInit() {
    this.signatureClear();

    //서명 입력하기
    if (this.mker.mkerSignSn != null) {
      //            var signaturePad    = this.signaturePad;
      //            this.fileService.getDataURL(this.mker.mkerSignSn).subscribe(
      //                result => {
      //                    console.log('result', result);
      //                    signaturePad.fromDataURL(result);
      //                }
      //            );
      this.terms01At = true;
      this.terms02At = true;
      this.signatureAt = true;
    }
  }

  signatureOnEnd() {
    this.signatureAt = true;
  };

  signatureComplete() {
    //서명 데이터 얻기
    let url = this.signaturePad.toDataURL();

    console.log('url', url);

    //파일 업로드
    this.fileService.upload(this.fileService.getBlobFromDataURL(url), 'signature.png')
      .subscribe((file: FileObject) => {
        console.log('file', file);

        //저장 Object 생성
        let doc: MkerDoc = new MkerDoc();
        doc.mkerSysSn = this.mker.mkerSysSn;
        doc.docCode = 'IIOWC';
        doc.sortSeq = 0;
        doc.fileSysSn = file.fileSysSn;

        console.log('doc', doc);

        //생산자 서명 저장
        this.http.post(join(environment.dataUrl, '/ftafarm/mker', this.mker.mkerSysSn, 'doc/IIOWC'), [doc]).subscribe((docs: MkerDoc[]) => {

          this.findOne();

          let alert = this.alertCtrl.create({
            title: '처리완료',
            subTitle: '서명 및 동의 처리되었습니다.',
            buttons: ['닫기']
          });
          alert.present();
        });
      });
  }

  //약관보기
  viewTerms01() {
    this.nav.push(Terms01Page, {
      mker: this.mker,
      callback: this.setTerms01At
    });
  }
  setTerms01At = (termsAt: boolean) => {
    this.terms01At = termsAt;
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
  viewTerms02() {
    this.nav.push(Terms02Page, {
      mker: this.mker,
      callback: this.setTerms02At
    });
  }
  setTerms02At = (termsAt: boolean) => {
    this.terms02At = termsAt;
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  viewLedger(ledger: Ledger): void {
    this.nav.push(LedgerPage, {mker: this.mker, ledger: ledger});
  }

  addLedger(): void {
    let params = new HttpParams()
      .set('mkerSysSn', this.mker.mkerSysSn.toString());

    this.http.get(join(environment.dataUrl, '/ftafarm/wrhousng/generate'), {params: params})
      .subscribe((ledger: Ledger) => {
        this.viewLedger(ledger);
      });
  }

  viewDocument(code: string, name: string) {
    this.nav.push(DocumentPage, {
      mker: this.mker,
      code: code,
      name: name
    });
  }

  viewOrgplce(): void {
    this.nav.push(OrgplcePage, this.mker);
  }
}
