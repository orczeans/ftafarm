import { Pipe, PipeTransform } from '@angular/core';

import {OrgplceItem} from '../../../components/ftafarm/models/orgplce-item';

@Pipe({ name: 'orgplceDetailFilter' })
export class OrgplceDetailFilter implements PipeTransform {

    transform(items: OrgplceItem[], ftaCode: string) {

        if (items == null) {
            return [];
        }

        return items.filter(item => item.ftaCode == ftaCode);
    }
}