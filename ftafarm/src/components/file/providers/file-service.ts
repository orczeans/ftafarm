import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import Rx from "rxjs/Rx";
import 'rxjs/add/operator/map';

import {environment} from '../../../environments/environment';

import {FileObject} from '../models/file-object';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Injectable()
export class FileService {

    constructor(private http: HttpClient) {

    }

    //파일 URL 정보 얻기
    getUrl(fileSn: number, defaultUrl: string): string {
        if (fileSn != null) {
            return join(environment.dataUrl, 'common/file', fileSn);
        } else {
            return defaultUrl;
        }
    }

    //파일 업로드
    upload(file: Blob, name: string): Rx.Observable<FileObject> {
        let headers: HttpHeaders = new HttpHeaders();
        //headers = headers.delete('Content-Type');
        let options = { headers: headers };

        let body = new FormData();
        body.append('data', file, name);

        return this.http.post(join(environment.dataUrl, 'common/file'), body, options)
            .map(file => file[0])
            .take(1);
    }

    getBlobFromDataURL(dataURL: any): Blob {
        let arr = dataURL.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    getBase64Image(img: HTMLImageElement) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL();
    }

    getDataURL(fileSn: number) {
        return Rx.Observable.create((observer: Rx.Observer<string>) => {
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.src = this.getUrl(fileSn, '');
            if (!img.complete) {
                img.onload = () => {
                    console.log('width', img.width);
                    observer.next(this.getBase64Image(img));
                    observer.complete();
                };
                img.onerror = (err) => {
                    observer.error(err);
                };
            } else {
                observer.next(this.getBase64Image(img));
                observer.complete();
            }
        });
    }

//    getDataURL(fileSn: number, callback : any) {
//        const xhr = new XMLHttpRequest();
//        xhr.onload = function() {
//            const reader = new FileReader();
//            reader.onloadend = function() {
//                callback(reader.result);
//            }
//            reader.readAsDataURL(xhr.response);
//        };
//        xhr.open('GET', this.getUrl(fileSn, ''));
//        xhr.responseType = 'blob';
//        xhr.send();
//    }
}
