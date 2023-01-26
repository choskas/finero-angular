import { Component } from '@angular/core';
import axios from 'axios';
import { DataSource, MovementsSource, User } from './typest';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-finerio';
  public loginValid = true;
  public username = '';
  public password = '';
  public displayedColumns: string[] = [
    'dateCreated',
    'amount',
    'customDescription',
  ];
  public dataSource: DataSource[] = [];
  public isError: boolean = false;
  public isAuthenticated = sessionStorage.getItem('isAuth')
    ? sessionStorage.getItem('isAuth')
    : false;
  public user: User = sessionStorage.getItem('user')
    ? JSON.parse(sessionStorage.getItem('user') as string)
    : { name: '', email: '', id: '' };
  private BASE_URL = 'https://api.finerio.mx/api';
  private counterBottom = 10;
  convertDate(movements: MovementsSource) {
    return movements.data.data.map((item: DataSource) => {
      let newItems = { ...item };
      if (newItems.dateCreated) {
        newItems.dateCreated = new Date(item.dateCreated).toLocaleDateString();
      }
      return newItems;
    });
  }
  async getMovements(id: string, token: string) {
    const movements = await axios.get(
      `${this.BASE_URL}/users/${id}/movements?deep=true&offset=0&max=${this.counterBottom}&includeCharges=true&includeDeposits=true&includeDuplicates=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return movements;
  }
  async onSubmit() {
    try {
      const response = await axios.post(`${this.BASE_URL}/login`, {
        username: this.username,
        password: this.password,
      });
      sessionStorage.setItem('TOKEN', response.data.access_token);
      sessionStorage.setItem('isAuth', 'true');
      const userData = await axios.get(`${this.BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });
      sessionStorage.setItem('user', JSON.stringify(userData.data));
      this.user = userData.data;
      this.isAuthenticated = true;
      const movements = await this.getMovements(
        userData.data.id,
        response.data.access_token
      );
      this.dataSource = this.convertDate(movements);
      const isInBottom = async () => {
        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight + 16
        ) {
          this.counterBottom = this.counterBottom + 10;
          const movements = await this.getMovements(
            this.user.id,
            sessionStorage.getItem('TOKEN') as string
          );
          this.dataSource = this.convertDate(movements);
        }
      };
      window.addEventListener('scroll', isInBottom);
    } catch (error) {
      this.isError = true;
    }
  }
  onLogout() {
    this.isAuthenticated = false;
    sessionStorage.clear();
  }
  async ngOnInit() {
    if (this.isAuthenticated) {
      const movements = await this.getMovements(
        this.user.id,
        sessionStorage.getItem('TOKEN') as string
      );
      this.dataSource = this.convertDate(movements);
      const isInBottom = async () => {
        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight + 16
        ) {
          this.counterBottom = this.counterBottom + 10;
          const movements = await this.getMovements(
            this.user.id,
            sessionStorage.getItem('TOKEN') as string
          );
          this.dataSource = this.convertDate(movements);
        }
      };
      window.addEventListener('scroll', isInBottom);
    }
  }
}
