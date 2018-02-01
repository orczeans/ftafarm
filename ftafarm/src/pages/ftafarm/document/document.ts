import {Component} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {NavController, NavParams, AlertController} from "ionic-angular";
import {Camera, CameraOptions} from '@ionic-native/camera';

import {environment} from '../../../environments/environment';

import {FileService} from '../../../components/file/providers/file-service';
import {RendererService} from '../../../components/renderer/providers/renderer-service';

import {FileObject} from '../../../components/file/models/file-object';
import {Mker} from '../../../components/ftafarm/models/mker';
import {MkerDoc} from '../../../components/ftafarm/models/mker-doc';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Component({
  selector: 'page-ftafarm-document',
  templateUrl: 'document.html'
})
export class DocumentPage {

  mker: Mker;
  code: string;
  name: string;

  docs: MkerDoc[];

  options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    //A4 사이즈로 고정
    targetWidth: window.screen.width,
    targetHeight: window.screen.height,
    correctOrientation: true
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, private camera: Camera, private http: HttpClient, public rendererService: RendererService, private fileService: FileService) {
    this.mker = this.navParams.get("mker");
    this.code = this.navParams.get("code");
    this.name = this.navParams.get("name");

    this.docs = [];
    this.getMkerDocs();
  }

  getMkerDocs(): void {
    this.http.get(join(environment.dataUrl, '/ftafarm/mker/', this.mker.mkerSysSn, 'doc', this.code))
      .take(1)
      .subscribe((docs: MkerDoc[]) => {
        this.docs = this.docs.concat(docs);
      });
  }

  getImageURL(doc: MkerDoc): string {
    return this.fileService.getUrl(doc.fileSysSn, 'assets/img/blank.png');
  }

  getSortSeq(): number {
    let sortSeq: number = 0;
    for (let doc of this.docs) {
      console.log('sortSeq', sortSeq);
      console.log('doc.sortSeq', doc.sortSeq);
      if (sortSeq <= doc.sortSeq) {
        sortSeq = doc.sortSeq;
      }
    }
    return sortSeq + 1;
  }

  takePicture() {
    this.camera.getPicture(this.options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;

      //파일 업로드
      this.fileService.upload(this.fileService.getBlobFromDataURL(base64Image), 'document.png')
        .subscribe((file: FileObject) => {
          console.log('file', file);

          //저장 Object 생성
          let doc: MkerDoc = new MkerDoc();
          doc.mkerSysSn = this.mker.mkerSysSn;
          doc.docCode = this.code;
          doc.sortSeq = this.getSortSeq();
          doc.fileSysSn = file.fileSysSn;

          this.docs.push(doc);
        });

    }, (err) => {
      console.error(err);
    });
  }

  removePicture() {
    this.docs.splice(0, this.docs.length);

    //        var index  = this.docs.findIndex(function (obj) {
    //            return obj.sortSeq == doc.sortSeq;
    //        });
    //        if(index > -1)
    //            this.docs   = this.docs.splice(index, 1);
    //
    console.log('docs', this.docs);
  }

  savePicture() {
    //증빙 이미지 저장
    this.http.post(join(environment.dataUrl, '/ftafarm/mker', this.mker.mkerSysSn, 'doc', this.code), this.docs).subscribe((docs: MkerDoc[]) => {
      let alert = this.alertCtrl.create({
        title: '처리완료',
        subTitle: '증빙 이미지가 저장되었습니다.',
        buttons: ['닫기']
      });
      alert.present();
    });
  }
}
