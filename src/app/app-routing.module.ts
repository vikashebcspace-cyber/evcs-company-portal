import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },
      { path: 'calendar', component: CalendarComponent },
      { path: 'my-bookings', component: MyBookingsComponent },
    ]
  },
  { path: '**', redirectTo: 'calendar' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
