import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { StorageService } from '../services/storage.service';
import { AlertController } from 'ionic-angular';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

	constructor(public storage : StorageService, public alertCtrl: AlertController ) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		
		return next.handle(req)
		.catch((error, caught) => {

			let errorObj = error;
			if(errorObj.error){
				errorObj = errorObj.error;
			}
			if (!errorObj.status){
				errorObj = JSON.parse(errorObj);
			}

			console.log("Erro detectado pelo interceptor: ");
			console.log(errorObj);

			switch(errorObj.status){
				case 401:
				this.handle401();
				break;
				case 403:
				this.handle403();
				break;

				default:
				this.handleDefaultError(errorObj);
			}
			
			return Observable.throw(errorObj);
		}) as any;
	}
	handle401(){
		const alert = this.alertCtrl.create(
			{
				title: 'Erro 401: Falha de autenticação',
				message: 'E-mail ou senha inválido!',
				buttons: [{text:'OK'}]

			}			
		);
		alert.present();
	}

	handle403(){
		this.storage.setLocalUser(null);
	}

	handleDefaultError(errorObj){
		const alert = this.alertCtrl.create(
			{
				title: 'Erro:'+errorObj.status+' : '+errorObj.error,
				message: errorObj.message,
				buttons: [{text:'OK'}]

			}			
		);
		alert.present();
	}
	

}

export const ErrorInterceptorProvider = {
	provide: HTTP_INTERCEPTORS,
	useClass: ErrorInterceptor,
	multi: true,
};