import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  companyName = '';
  buildingName = '';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.companyName = this.auth.getCompanyName();
    this.buildingName = this.auth.getBuildingName();
  }

  sidebarOpen = false;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar()  { this.sidebarOpen = false; }
  logout()        { this.auth.logout(); }
}
