import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import Rx from "rxjs/Rx";
import 'rxjs/add/operator/map';

import {environment} from '../../../environments/environment';

declare var require: (moduleId: string) => any;
var join = require('join-path');

@Injectable()
export class CodeService {

  constructor(private http: HttpClient) {

  }

  getCodes(path: string): Rx.Observable<any> {
    let params = new HttpParams()
      .set('path', path.toUpperCase());

    return this.http.get(join(environment.dataUrl, '/common/code/path'), {params: params})  //코드 정보 얻기
      .take(1);
  }
}
