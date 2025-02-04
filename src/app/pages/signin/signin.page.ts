import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  alertButtons = ['Action'];
  users: any;
  newUser = { name: '', email: '' }; // Model for new user input

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.authService.openDatabase();
    await this.loadUsers();
  }

  // Add a new user
  async addUser() {
    if (this.newUser.name.trim() && this.newUser.email.trim()) {
      await this.authService.createUser(
        {
          id: '',
          firstname: this.newUser.name, 
          lastname: this.newUser.name,
          birthday: '',
          pwa: '',
          email: this.newUser.email,
          company: '',
        });
      this.newUser = { name: '', email: '' }; // Reset input fields
      await this.loadUsers(); // Refresh user list
    } else {
      alert('Please enter both Name and Email.');
    }
  }

  // Load all users
  async loadUsers() {
    this.users = await this.authService.getAllUsers();
  }

  // Delete a user
  async deleteUser(id: string) {
    await this.authService.deleteUser(id);
    await this.loadUsers();
  }

}
