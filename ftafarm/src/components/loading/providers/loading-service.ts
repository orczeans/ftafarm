import {Injectable} from '@angular/core';
import {LoadingController} from 'ionic-angular';

@Injectable()
export class LoadingService {

    loader : any;
    
    constructor(private laoadingCtrl: LoadingController) {
    }

    present(): void {
        this.loader = this.laoadingCtrl.create({
            duration: 3000,
            cssClass: 'transparent'
        });
        this.loader.present();
    }
    
    dismiss() : void{
        this.loader.dismiss();
    }
}
