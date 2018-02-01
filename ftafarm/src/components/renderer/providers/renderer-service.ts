import {Injectable} from '@angular/core';

declare var require: (moduleId: string) => any;
var moment = require('moment');
var numeral = require('numeral');

import {Code} from '../../code/models/code';

@Injectable()
export class RendererService {

    constructor() {

    }


    //AG Code 변환
    getAgCode(src: string): string {
        if (src != null) {
            return src.replace(/^(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/g, '$1.$2.$3.$4.$5');
        }
        return null;
    }

    //HS Code 변환
    getHsCode(src: string): string {
        if (src && src.length == 4) {
            return String(src);
        }
        if (src && src.length == 6) {
            return String(src).replace(/^(\d{4})(\d{2})$/g, '$1.$2');
        }
        if (src && src.length == 10) {
            return String(src).replace(/^(\d{4})(\d{2})(\d{4})$/g, '$1.$2.$3');
        }
    }

    //날짜 문자열 변환
    getDate(src: string, format : string): string  {
        if (src === undefined || src === null) return '';
        if (typeof src === 'string') {
            var dateString = src.match(/\d+/g) ? src.replace(/(\d{4})(\d{2})(\d{2}).*/g, '$1-$2-$3') : src;
            return moment(dateString).format('YYYY-MM-DD');
        } else {
            return moment(src).format('YYYY-MM-DD');
        }
    };

    // 숫자 렌더러
    getNumber(src: string, format : string): string {
        if (src === undefined || src === null) return '';
        if (typeof src === 'number') {
            return numeral(src || '0').format(format);
        } else if (typeof src === 'string') {
            return numeral(src || '0').format(format);
        }
        return '';
    };

    // 코드 렌더러
    getCodeName(src: string, codes: Code[]): string {
        if (src === undefined || src === null) return '';
        if (codes == null || codes.length == 0) return '';

        var index = codes.findIndex(
            function (e) {
                return e.code == src;
            }
        );
        return index >= 0 ? codes[index].name : '';
    };
}
