import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../core/services/room.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Room, Booking } from '../../core/models';

interface CalendarSlot {
  time: string;           // "08:00"
  displayTime: string;    // "8:00 AM"
  bookings: { [roomId: number]: Booking | null };
}

@Component({
  selector: 'app-calendar',
  standalone: false,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  rooms: Room[] = [];
  bookings: Booking[] = [];
  selectedDate: string = '';
  slots: CalendarSlot[] = [];
  companyId: number | null = null;

  // Booking form
  showBookingForm = false;
  selectedRoom: Room | null = null;
  selectedSlotTime = '';
  bookingForm = { booked_by_name: '', booked_by_email: '', end_time: '', purpose: '' };
  bookingError = '';
  bookingSaving = false;

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.companyId = this.auth.getCompanyId();
    this.roomService.getAll().subscribe(rooms => {
      this.rooms = rooms;
      this.loadBookings();
    });
  }

  loadBookings() {
    this.bookingService.getAll({ date: this.selectedDate }).subscribe(bookings => {
      this.bookings = bookings;
      this.buildSlots();
    });
  }

  onDateChange() {
    this.loadBookings();
  }

  buildSlots() {
    // Generate 30-min slots from 07:00 to 21:00
    const slots: CalendarSlot[] = [];
    for (let h = 7; h < 21; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        const time = `${hh}:${mm}`;
        const ampm = h < 12 ? 'AM' : 'PM';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        const displayTime = m === 0 ? `${displayHour} ${ampm}` : '';

        const bookingMap: { [roomId: number]: Booking | null } = {};
        this.rooms.forEach(room => {
          const booking = this.bookings.find(b =>
            b.room === room.id &&
            b.start_time <= time &&
            b.end_time > time
          ) || null;
          bookingMap[room.id] = booking;
        });

        slots.push({ time, displayTime, bookings: bookingMap });
      }
    }
    this.slots = slots;
  }

  isRoomAvailableAtTime(room: Room, time: string): boolean {
    return time >= room.open_time && time < room.close_time;
  }

  isSlotStart(roomId: number, slot: CalendarSlot, idx: number): boolean {
    if (!slot.bookings[roomId]) return false;
    if (idx === 0) return true;
    const prevSlot = this.slots[idx - 1];
    return prevSlot.bookings[roomId]?.id !== slot.bookings[roomId]?.id;
  }

  getSlotSpan(_roomId: number, booking: Booking): number {
    const start = this.timeToMinutes(booking.start_time);
    const end = this.timeToMinutes(booking.end_time);
    return Math.max(1, (end - start) / 30);
  }

  isOwnBooking(booking: Booking): boolean {
    return booking.company === this.companyId;
  }

  openBookingForm(room: Room, slot: CalendarSlot) {
    if (!this.isRoomAvailableAtTime(room, slot.time)) return;
    if (slot.bookings[room.id]) return; // already booked

    this.selectedRoom = room;
    this.selectedSlotTime = slot.time;

    // Default end time = start + min_duration
    const endMins = this.timeToMinutes(slot.time) + room.min_duration_mins;
    this.bookingForm = {
      booked_by_name: '',
      booked_by_email: '',
      end_time: this.minutesToTime(endMins),
      purpose: ''
    };
    this.bookingError = '';
    this.showBookingForm = true;
  }

  closeBookingForm() {
    this.showBookingForm = false;
  }

  confirmBooking() {
    if (!this.bookingForm.booked_by_name || !this.bookingForm.booked_by_email || !this.bookingForm.end_time) {
      this.bookingError = 'All fields are required.';
      return;
    }
    this.bookingSaving = true;
    this.bookingService.create({
      room: this.selectedRoom!.id,
      booked_by_name: this.bookingForm.booked_by_name,
      booked_by_email: this.bookingForm.booked_by_email,
      date: this.selectedDate,
      start_time: this.selectedSlotTime,
      end_time: this.bookingForm.end_time,
      purpose: this.bookingForm.purpose
    }).subscribe({
      next: () => {
        this.bookingSaving = false;
        this.closeBookingForm();
        this.loadBookings();
      },
      error: (err) => {
        this.bookingSaving = false;
        this.bookingError = err?.error?.non_field_errors?.[0] || 'Failed to book. Try again.';
      }
    });
  }

  getEndTimeOptions(room: Room): string[] {
    const options: string[] = [];
    const startMins = this.timeToMinutes(this.selectedSlotTime);
    const closeMins = this.timeToMinutes(room.close_time);
    for (let m = startMins + room.min_duration_mins; m <= Math.min(startMins + room.max_duration_mins, closeMins); m += 30) {
      options.push(this.minutesToTime(m));
    }
    return options;
  }

  getCellTitle(room: Room, slot: CalendarSlot): string {
    if (!this.isRoomAvailableAtTime(room, slot.time)) return 'Outside operating hours';
    const booking = slot.bookings[room.id];
    if (booking) return `Booked by ${booking.company_name} (${booking.booked_by_name})`;
    return `Click to book from ${slot.time}`;
  }

  prevDay(date: string): string {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  nextDay(date: string): string {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
