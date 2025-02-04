import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';

import { SQLiteService } from './sqlite.service';
import { DbnameVersionService } from './dbname-version.service';

import { environment } from 'src/environments/environment';
import { usersVersionUpgrades } from 'src/app/upgrades/user/upgrade-statements';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public databaseName: string;
  private mDb!: SQLiteDBConnection;
  private loadToVersion = usersVersionUpgrades[usersVersionUpgrades.length-1].toVersion;
  private versionUpgrades = usersVersionUpgrades;
  public userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor(  private sqliteService: SQLiteService,
                private dbVerService: DbnameVersionService,
  ) {
    this.databaseName = environment.databaseNames.filter(x => x.name.includes('users'))[0].name;
  }

  async initializeDatabase() {
    // create upgrade statements
    await this.sqliteService
      .addUpgradeStatement({ database: this.databaseName,
                              upgrade: this.versionUpgrades});
    // create and/or open the database
    await this.openDatabase();
    this.dbVerService.set(this.databaseName,this.loadToVersion);
    const isData = await this.mDb.query("select * from sqlite_sequence");

    if( this.sqliteService.platform === 'web') {
      await this.sqliteService.sqliteConnection.saveToStore(this.databaseName);
    }
    await this.getAllUsers();
  }

  async openDatabase() {
    if((this.sqliteService.native || this.sqliteService.platform === "electron")
      && (await this.sqliteService.isInConfigEncryption()).result
      && (await this.sqliteService.isDatabaseEncrypted(this.databaseName)).result) {
      this.mDb = await this.sqliteService
        .openDatabase(this.databaseName, true, "secret",
                        this.loadToVersion,false);

    } else {
      this.mDb = await this.sqliteService
        .openDatabase(this.databaseName, false, "no-encryption",
                      this.loadToVersion,false);
    }
  }

  // Get all users
  async getAllUsers(): Promise<void> {
    // Query the employee table
    const stmt = `SELECT * FROM users ORDER BY firstname, userid ASC`;

    const users = (await this.mDb.query(stmt)).values;

    const usersData: User[] = [];
    for (const user of users!) {
      const userData = new User();
      userData.id = user.userid;
      userData.firstname = user.firstname;
      userData.lastname = user.lastname;
      userData.email = user.email;
      userData.pwa = user.pwa;
      userData.birthday = user.birthday;
      usersData.push(userData);
    }
    this.userList.next(usersData);
  }

  async deleteUser(id: string): Promise<void>  {
    let post = await this.sqliteService.findOneBy(this.mDb, "user", {id: id});
    if( post) {
      await this.sqliteService.remove(this.mDb, "user", {id: id});;
    }
  }

  /**
   * Create Post
   * @returns
   */
  async createUser(jsonUser:User): Promise<User> {
    const user = new User();
    user.id = jsonUser.id;
    user.firstname = jsonUser.firstname;
    user.lastname = jsonUser.lastname;
    user.email = jsonUser.email;
    user.pwa = jsonUser.pwa;
    user.birthday = jsonUser.birthday;
    await this.sqliteService.save(this.mDb, "user", user);
    return user;
  }
}
