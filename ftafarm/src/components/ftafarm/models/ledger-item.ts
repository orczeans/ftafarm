import {Item} from './item';

export class LedgerItem extends Item {

    wrhousngSysSn : number;
    qy : number;
    acptncQy : number;
    qyUnit : string;
    untpc : number;
    untpcUnit : string;
    amount : number;
    amountUnit : string;

    constructor() {
        super();
    }
}
