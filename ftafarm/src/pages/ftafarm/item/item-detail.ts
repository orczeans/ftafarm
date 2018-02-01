import {Component} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {NavController, NavParams, AlertController} from "ionic-angular";
import {Camera, CameraOptions} from '@ionic-native/camera';

import {FileService} from '../../../components/file/providers/file-service';
import {RendererService} from '../../../components/renderer/providers/renderer-service';
import {LoadingService} from '../../../components/loading/providers/loading-service';

import {FileObject} from '../../../components/file/models/file-object';
import {Item} from '../../../components/ftafarm/models/item';
import {ItemProcs} from '../../../components/ftafarm/models/item-procs';

import {environment} from '../../../environments/environment';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Component({
    selector: 'page-ftafarm-item-detail',
    templateUrl: 'item-detail.html'
})
export class ItemDetailPage {

    //프로퍼티
    public item: Item;
    public listTy: string;

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

    constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera, private alertCtrl: AlertController, private http: HttpClient, private loadingService: LoadingService, public rendererService: RendererService, private fileService: FileService) {
        //품목정보 가져오기
        this.item = this.navParams.data;

        //품종 탭 기본
        this.listTy = 'spcies';
    }

    ionViewDidEnter() {
        this.findOne();
    }

    findOne(): void {
        this.http.get(join(environment.dataUrl, 'ftafarm/basis/prdctn/item', this.item.itemSysSn))
            .take(1)
            .subscribe((res: Item) => {
                this.item = res;
            });
    }

    update(): void {
        this.loadingService.present();

        console.log('[this.item]', [this.item]);

        this.http.post(join(environment.dataUrl, 'ftafarm/basis/prdctn/item'), [this.item])
            .take(1)
            .finally(() => {
                this.loadingService.dismiss();
            })
            .subscribe(() => {
                //갱신
                this.findOne();
            });
    }

    //품목 삭제
    remove(): void {
        let prompt = this.alertCtrl.create({
            title: '삭제확인',
            message: '삭제 하시겠습니까?',
            buttons: [
                {
                    text: '취소',
                    handler: data => { }
                },
                {
                    text: '삭제',
                    handler: data => {
                        this.http.delete(join(environment.dataUrl, 'ftafarm/basis/prdctn/item', this.item.itemSysSn))
                            .take(1)
                            .map(response => <boolean>response)
                            .subscribe(() => {
                                //목록 이동
                                this.navCtrl.pop();

                                let alert = this.alertCtrl.create({
                                    title: '삭제완료',
                                    subTitle: '삭제 되었습니다.',
                                    buttons: ['닫기']
                                });
                                alert.present();
                            });
                    }
                }
            ]
        });
        prompt.present();
    }

    //품종 이미지
    getItemImageUrl(item: Item): string {
        return this.fileService.getUrl(item.prdctnItemImageSn, 'assets/img/blank.png');
    }

    //품종추가
    addItem(): void {
        let prompt = this.alertCtrl.create({
            title: '품종추가',
            inputs: [
                {
                    name: 'spciesNm',
                    placeholder: '품종명'
                },
            ],
            buttons: [
                {
                    text: '취소',
                    handler: data => { }
                },
                {
                    text: '추가',
                    handler: data => {
                        console.log('data', data);
                        if (this.item.children == null) {
                            this.item.children = [];
                        }
                        var child: Item = Object.assign({}, this.item);
                        child.children = [];
                        child.procsList = [];
                        child.spciesNm = data.spciesNm;

                        this.item.children.push(child);

                        //저장
                        this.update();
                    }
                }
            ]
        });
        prompt.present();
    }

    //품종삭제
    removeItem(obj: Item): void {
        this.item.children = this.item.children.filter(child => child !== obj);

        //저장
        this.update();
    }

    //품종 사진 촬영
    takeItemPicture(item: Item): void {
        this.camera.getPicture(this.options).then((imageData) => {
            let base64Image = 'data:image/jpeg;base64,' + imageData;

            //파일 업로드
            this.fileService.upload(this.fileService.getBlobFromDataURL(base64Image), 'document.png')
                .subscribe((file: FileObject) => {
                    item.prdctnItemImageSn = file.fileSysSn;

                    //저장
                    this.update();
                });

        }, (err) => {
            console.error(err);
        });
    }

    //유통과정 이미지
    getProcsImageUrl(procs: ItemProcs): string {
        return this.fileService.getUrl(procs.imageSysSn, 'assets/img/blank.png');
    }

    //유통과정추가
    addProcs(): void {
        let prompt = this.alertCtrl.create({
            title: '유통과정추가',
            inputs: [
                {
                    name: 'procsSj',
                    placeholder: '제목'
                },
                {
                    name: 'procsDc',
                    placeholder: '설명'
                }
            ],
            buttons: [
                {
                    text: '취소',
                    handler: data => { }
                },
                {
                    text: '추가',
                    handler: data => {
                        console.log('data', data);
                        let procsSeq = 0;

                        if (this.item.procsList == null) {
                            this.item.procsList = [];
                        }
                        if(this.item.procsList.length > 0){
                            procsSeq = Math.max.apply(Math, this.item.procsList.map(function(o){return o.procsSeq;}));
                        }
                        let procs   = new ItemProcs();
                        procs.procsSj = data.procsSj;
                        procs.procsDc = data.procsDc;
                        procs.procsSeq  = ++procsSeq;

                        console.log('procs', procs);

                        this.item.procsList.push(procs);

                        //저장
                        this.update();
                    }
                }
            ]
        });
        prompt.present();
    }

    //유통과정삭제
    removeProcs(obj: ItemProcs): void {
        this.item.procsList = this.item.procsList.filter(procs => procs !== obj);

        //저장
        this.update();
    }

    //유통과정 사진 촬영
    takeProcsPicture(procs: ItemProcs): void {
        this.camera.getPicture(this.options).then((imageData) => {
            let base64Image = 'data:image/jpeg;base64,' + imageData;

            //파일 업로드
            this.fileService.upload(this.fileService.getBlobFromDataURL(base64Image), 'document.png')
                .subscribe((file: FileObject) => {
                    procs.imageSysSn = file.fileSysSn;

                    //저장
                    this.update();
                });

        }, (err) => {
            console.error(err);
        });
    }
}
