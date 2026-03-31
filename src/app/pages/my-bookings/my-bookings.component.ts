import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Booking } from '../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: false,
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  companyId: number | null = null;

  constructor(private bookingService: BookingService, private auth: AuthService) {}

  ngOnInit() {
    this.companyId = this.auth.getCompanyId();
    this.load();
  }

  load() {
    this.bookingService.getAll().subscribe(all => {
      // Filter to only this company's bookings
      this.bookings = all.filter(b => b.company === this.companyId);
    });
  }

  cancel(booking: Booking) {
    if (!confirm(`Cancel booking for "${booking.room_name}" on ${booking.date}?`)) return;
    this.bookingService.cancel(booking.id).subscribe(() => this.load());
  }

  isPast(booking: Booking): boolean {
    const bookingEnd = new Date(`${booking.date}T${booking.end_time}`);
    return bookingEnd < new Date();
  }
}
