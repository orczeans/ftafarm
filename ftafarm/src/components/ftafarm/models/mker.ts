import {Lot} from './lot';
import {Sign} from './sign';

export class Mker {

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
  mkerImageSn : number;
  mkerSignSn : number;
  lotAdres : string;
  lotAr : number;
  atmnentAt : string;
  oriconAt : string;
  prufAt : string;
  cmpnySysSn : number;
  intrfcSn : number;
  rowNo : number;

  lotList : Lot[];
  signList : Sign[];

  constructor() {
  }
}
