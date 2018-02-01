import {LedgerItem} from './ledger-item';

declare var require: (moduleId: string) => any;
var moment = require('moment');

export class Ledger {

    wrhousngSysSn : number;
    wrhousngNo : string;
    wrhousngTy : string;
    wrhousngDt : string;
    wrhousngBeginDt : string;
    wrhousngEndDt : string;
    mkerSysSn : number;
    mkerCode : string;
    mkerNm : string;
    ihidnum : string;
    zip : string;
    adres : string;
    lnm : string;
    tlphonNo : string;
    moblphonNo : string;
    rprsntvNm : string;
    cmpnySysSn : number;
    cmpnyCode : string;
    cmpnyNm : string;
    cmpnyAdres : string;
    cmpnyBizrno : string;
    cmpnyRprsntvNm : string;
    cmpnyRprsntvTlphonNo : string;
    cmpnyRprsntvEmail : string;
    cmpnySignSn : number;
    sttus : string;

    cnfirmAt : string;
    
    cnfirmUserNm: string;
    cnfirmUserEmail: string;
    cnfirmUserTelno: string;
    cnfirmUserMbtlnum: string;
    cnfirmUserSignSn : number;
    
    cnfirmMkerCode : string;
    cnfirmMkerNm : string;
    cnfirmTlphonNo : string;
    cnfirmMoblphonNo : string;
    cnfirmRprsntvNm : string;
    cnfirmMkerSignSn: number;
    acptncAt : string;
    acptncUserNm : string;
    acptncUserEmail : string;
    acptncUserTelno : string;
    acptncUserMbtlnum : string;
    acptncUserSignSn : number;
    ctvtBeginDt : string;
    ctvtEndDt : string;
    shipmntDt : string;
    shipmntMkerCode : string;
    shipmntMkerNm : string;
    shipmntTlphonNo : string;
    shipmntMoblphonNo : string;
    shipmntRprsntvNm : string;
    shipmntMkerSignSn : number;

    itemList : LedgerItem[];

    constructor() {
        this.wrhousngDt = moment().format('YYYYMMDD');
        this.sttus   = '10';
    }
}
