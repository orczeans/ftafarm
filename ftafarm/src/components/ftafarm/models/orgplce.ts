import {OrgplceItem} from './orgplce-item';

export class Orgplce {
    issuNo : string;
    registNo : number;
    cmpnySysSn : number;
    mkerSysSn : number;
    issuDt : string;
    inclCnfirmAt : string;
    inclCnfirmBeginDt : string;
    inclCnfirmEndDt : string;
    cnfrmnTy : string;
    suplerCode : string;
    suplerNm : string;
    suplerBizrno : string;
    suplerRprsntvNm : string;
    suplerAdres : string;
    suplerTlphon : string;
    suplerFax : string;
    suplerEmail : string;
    suplerCrtfcexpterNo : string;
    suplyofficCode : string;
    suplyofficNm : string;
    suplyofficBizrno : string;
    suplyofficRprsntvNm : string;
    suplyofficAdres : string;
    suplyofficTlphon : string;
    suplyofficFax : string;
    suplyofficEmail : string;
    wrterNm : string;
    wrterOfcps : string;
    wrterCmpnyNm : string;
    wrterAdres : string;
    wrterSignSn : number;
    sttus : string;
    intrfcSn : number;
    rowNo : number;
    originalIssuNo : string;
    
    itemList : OrgplceItem[]; 
    
    constructor() {
    }
}
