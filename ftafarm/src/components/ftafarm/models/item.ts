import {ItemProcs} from './item-procs';

export class Item {

    mkerSysSn: number;
    lotSeq: number;
    itemSeq: number;
    mkerCode: string;
    cmpnySysSn: number;
    itemSysSn: number;
    registSeq: number;
    itemCode: string;
    itemNm: string;
    itemNmEng: string;
    spciesNm: string;
    stndrd: string;
    prdctnItemImageSn: number;
    cmpnyItemAt: string;
    mkerItemAt: string;
    intrfcSn: number;
    rowNo: number;
    hsCode: string;

    checked: boolean;

    children: Item[];
    procsList: ItemProcs[];

    constructor() {
    }
}
