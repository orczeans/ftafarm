import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { environment } from '../../../environments/environment';

declare var require:(moduleId:string) => any;
var join = require('join-path');

@Injectable()
export class DataService {

  constructor(public http: Http) {

  }

  get(url : string): Promise<any> {
    console.log(join(environment.dataUrl, url));
    return this.http.get(join(environment.dataUrl, url))
              .toPromise()
              .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
