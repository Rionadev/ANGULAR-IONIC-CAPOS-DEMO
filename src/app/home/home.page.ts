import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ModalController } from '@ionic/angular';
import { PostsPage } from 'src/app/pages/author-posts/posts/posts.page';
import { EmployeesPage } from 'src/app/pages/employee-dept/employees/employees.page';
import { InitializeAppService } from 'src/app/services/initialize.app.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { App } from '@capacitor/app';
import { ModalPassphrasePage } from 'src/app/pages/modal-passphrase/modal-passphrase.page';
import { ModalEncryptionPage } from 'src/app/pages/modal-encryption/modal-encryption.page';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
  standalone: true
})
export class HomePage implements OnInit {
  isListDisplay: boolean = false;
  isAndroid: boolean = false;
  isNative: boolean = false;
  isElectron: boolean = false;
  isEncrypt: boolean = false;

  private apiUrl = 'http://localhost:3000/api'; // Replace with your API URL

  constructor(
    private initAppService: InitializeAppService,
    private sqliteService: SQLiteService,
    private modalCtrl: ModalController,
    private http: HttpClient,
  ) {
    this.isListDisplay = this.initAppService.isAppInit;
  }

  // Example method to get data
  async getData(): Promise<any> {
    try {
      const params = new HttpParams().set('private_web_address', 'onestore');
      const response = await this.http.get(`${this.apiUrl}/util/get_all_data`, { params }).toPromise();
      console.log('Data received:', response);
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

  async ngOnInit() {
    if (this.initAppService.platform === 'android') {
      this.isAndroid = true;
    }
    if (this.initAppService.platform === 'electron') {
      this.isElectron = true;
    }
    this.isNative = this.sqliteService.native;
    this.isEncrypt = (this.isNative || this.isElectron) &&
      (await this.sqliteService.isInConfigEncryption()).result
      ? true : false;

    await this.getData();
  }
  async authorpostsClick() {
    const modal = await this.modalCtrl.create({
      component: PostsPage,
      canDismiss: true
    });
    modal.present();
  }
  async employeesClick() {
    const modal = await this.modalCtrl.create({
      component: EmployeesPage,
      canDismiss: true
    });
    modal.present();
  }

  exitApp() {
    App.exitApp();
  }

  async setPassphrase() {
    const modalPassphrase = await this.modalCtrl.create({
      component: ModalPassphrasePage,
      breakpoints: [0.1, 0.55, 0.85],
      initialBreakpoint: 0.55,
      cssClass: 'custom-modal'
    });
    await modalPassphrase.present();
  }
  async dbEncryption() {
    const modalEncryption = await this.modalCtrl.create({
      component: ModalEncryptionPage,
      breakpoints: [0.1, 0.85, 1],
      initialBreakpoint: 0.85,
      cssClass: 'custom-modal'
    });
    await modalEncryption.present();
  }

}

