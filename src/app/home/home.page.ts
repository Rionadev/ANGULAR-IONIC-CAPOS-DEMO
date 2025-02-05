import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ModalController } from '@ionic/angular';
import { PostsPage } from 'src/app/pages/author-posts/posts/posts.page';
import { EmployeesPage } from 'src/app/pages/employee-dept/employees/employees.page';
import { InitializeAppService } from 'src/app/services/initialize.app.service';
import { SQLiteService } from 'src/app/services/sqlite.service';
import { App } from '@capacitor/app';
import { ModalPassphrasePage } from 'src/app/pages/modal-passphrase/modal-passphrase.page';
import { ModalEncryptionPage } from 'src/app/pages/modal-encryption/modal-encryption.page';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { IonCol, IonGrid, IonRow, IonButton } from '@ionic/angular/standalone';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule,
    IonCol, IonGrid, IonRow, IonButton],
  standalone: true
})
export class HomePage implements OnInit {
  isListDisplay: boolean = false;
  isAndroid: boolean = false;
  isNative: boolean = false;
  isElectron: boolean = false;
  isEncrypt: boolean = false;
  str_pass: string = '';

  test_result: any;

  private apiUrl = 'http://192.168.149.211:3000/api'; // Replace with your API URL


  constructor(
    private initAppService: InitializeAppService,
    private sqliteService: SQLiteService,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private router: Router,
  ) {
    this.isListDisplay = this.initAppService.isAppInit;
  }

  // Example method to get data
  async getData(): Promise<any> {
    try {
      this.isListDisplay = this.initAppService.isAppInit;

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

  signIn() {
    this.router.navigate(['/signin']); // Navigate to the Sign In page
  }

  signUp() {
    this.router.navigate(['/signup']); // Navigate to the Sign Up page (if needed)
  }

  typePass(str: string) {
    this.str_pass += str;
    console.log(this.str_pass);
  }
  erase() {
    // Remove the last character from this.str_pass
    this.str_pass = this.str_pass.slice(0, -1);
  }
  async enterPass() {
    let response: any;
    try {
      response = await this.http.post(`${this.apiUrl}/auth/login`, {
        password: this.str_pass,
        status: "Admin",
      }).toPromise();
      console.log(response);
      this.test_result = response;
      if (response) {
        if (response.error !== 0) {
          // Handle error case
          console.error('Login failed with error:', response.error);
          this.showErrorMessage(response.error);
        } else {
          // Handle successful login
          console.log('Login successful');
          await this.saveSession(response);
          this.handleSuccessfulLogin();
        }
      } else {
        // Handle null or undefined response
        console.error('No response from the server');
        this.showServerErrorMessage();
      }
    } catch (error) {
      // Handle any network or other errors
      console.error('Error during login:', error);
      this.showNetworkErrorMessage();
    }
  }

  private async saveSession(response: any) {
    // Save token and user information

  }

  private async getSession() {
    // Retrieve token and user information

  }

  private async clearSession() {
    // Clear token and user information

  }

  private showErrorMessage(error: any) {
    // Implement your error message display logic here
    console.error('Error message:', error);
  }

  private handleSuccessfulLogin() {
    // Implement your successful login logic here
    console.log('Login successful, navigating to the next page or performing other actions');
    // Example: Navigate to a new page
    // this.router.navigate(['/dashboard']);
  }

  private showServerErrorMessage() {
    // Implement your server error message display logic here
    console.error('Server error: No response from the server');
  }

  private showNetworkErrorMessage() {
    // Implement your network error message display logic here
    console.error('Network error: Check your internet connection');
  }
}

