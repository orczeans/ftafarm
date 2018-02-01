import {Item} from './item';

export class Lot {

  mkerSysSn : number;
  lotSeq : number;
  mkerCode : string;
  lotAdres : string;
  lotAr : number;
  intrfcSn : number;
  rowNo : number;
  itemList : Item[];

  constructor() {
  }
}
