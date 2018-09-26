import { ClienteService } from './../../services/domain/cliente.service';
import { CartService } from './../../services/domain/cart.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { PedidoDTO } from '../../models/pedido.dto';
import { CartItem } from '../../models/cart-Item';
import { ClienteDTO } from '../../models/cliente.dto';
import { EnderecoDTO } from '../../models/endereco.dto';
import { PedidoService } from '../../services/domain/pedido.service';



@IonicPage()
@Component({
  selector: 'page-order-confirmation',
  templateUrl: 'order-confirmation.html',
})
export class OrderConfirmationPage {

  pedido: PedidoDTO;
  cartItems: CartItem[];
  cliente : ClienteDTO;
  endereco : EnderecoDTO;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public cartService: CartService,
    public clienteService: ClienteService,
    public pedidoService: PedidoService,
    public alertCrtl : AlertController) {

      this.pedido = this.navParams.get('pedido');
  }

  ionViewDidLoad() {
    this.cartItems = this.cartService.getCart().items;
    this.clienteService.findById(this.pedido.cliente.id)
      .subscribe(response =>{
        this.cliente = response as ClienteDTO;
        this.endereco = this.findEndereco(this.pedido.enderecoDeEntrega.id, response['enderecos']);},
        erros =>{ this.navCtrl.setRoot('HomePage')} 
      );
  }

  private findEndereco(id: string, list:EnderecoDTO[]):EnderecoDTO{
    let position = list.findIndex(x=> x.id == id);
    return list[position];
  }

  total(){
    return this.cartService.total();
  }

  back(){
    this.navCtrl.setRoot('CartPage');
  }

  showInsertOk(){
    let alert = this.alertCrtl.create(
      {
        title: 'Sucesso!',
        message: 'Pedido efetuado com sucesso!',
        enableBackdropDismiss: false,
        buttons:[{
          text:'ok',
          handler: () => {
            this.navCtrl.setRoot('CategoriasPage');
          }
        }]

      }
    );
    alert.present();
    
  }

  checkout(){
    
    this.pedidoService.insert(this.pedido)
      .subscribe(response => {
          this.cartService.createOrClearCart();
          console.log(response.headers.get('location'));
          this.showInsertOk();          
        },
        error =>{
          if (error.status == 403){
            this.navCtrl.setRoot('HomePage');
          }
        }

      );
  }


}
