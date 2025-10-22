import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Class {
  subject: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  teacher: string;
  room: string;
  time: string;
}

interface Message {
  id: number;
  sender: string;
  subject: string;
  title: string;
  description: string;
  date: string;
  type: 'absence' | 'general';
  unread: boolean;
}

@Component({
  selector: 'app-student-outside',
  templateUrl: './student-outside.html',
  styleUrls: ['./student-outside.scss'],
  imports: [CommonModule,FormsModule],
})
export class Studentoutside implements OnInit {
  attendancePercentage: number = 75;
  classesAttended: number = 75;
  totalClasses: number = 100;
  classesMissed: number = 25;
  unreadCount: number = 3;
  selectedMessage: Message | null = null;

  todayClasses: Class[] = [
    {
      subject: 'Mathematics',
      status: 'completed',
      teacher: 'Dr. Smith',
      room: 'Room 101',
      time: '09:00 - 10:00'
    },
    {
      subject: 'Physics',
      status: 'ongoing',
      teacher: 'Prof. Johnson',
      room: 'Lab 201',
      time: '10:15 - 11:15'
    },
    {
      subject: 'Chemistry',
      status: 'upcoming',
      teacher: 'Dr. Brown',
      room: 'Lab 301',
      time: '11:30 - 12:30'
    },
    {
      subject: 'English Literature',
      status: 'upcoming',
      teacher: 'Ms. Davis',
      room: 'Room 205',
      time: '14:00 - 15:00'
    },
    {
      subject: 'Computer Science',
      status: 'upcoming',
      teacher: 'Mr. Wilson',
      room: 'Computer Lab',
      time: '15:15 - 16:15'
    }
  ];

  messages: Message[] = [
    {
      id: 1,
      sender: 'Dr. Smith (Mathematics)',
      subject: 'Mathematics',
      title: 'Absence Notice - Mathematics Class',
      description: 'Please provide documentation for your absence.',
      date: '2024 10 15',
      type: 'absence',
      unread: true
    },
    {
      id: 2,
      sender: 'Prof. Johnson (Physics)',
      subject: 'Physics',
      title: 'Absence Notice - Physics Lab',
      description: 'Your attendance is required for the next lab session.',
      date: '2024 10 14',
      type: 'absence',
      unread: true
    },
    {
      id: 3,
      sender: 'Academic Office',
      subject: 'General',
      title: 'Attendance Warning',
      description: 'Your attendance has fallen below the required threshold.',
      date: '2024 10 13',
      type: 'general',
      unread: true
    },
    {
      id: 4,
      sender: 'Dr. Brown (Chemistry)',
      subject: 'Chemistry',
      title: 'Absence Notice - Organic Chemistry',
      description: 'Please catch up on the missed material.',
      date: '2024 10 12',
      type: 'absence',
      unread: false
    },
    {
      id: 5,
      sender: 'Ms. Davis (English)',
      subject: 'English',
      title: 'Absence Notice - Literature Class',
      description: 'Essay submission deadline reminder.',
      date: '2024 10 11',
      type: 'absence',
      unread: false
    },
    {
      id: 6,
      sender: 'Mr. Wilson (Computer Science)',
      subject: 'Computer Science',
      title: 'Absence Notice - Programming Lab',
      description: 'Lab assignment needs to be completed.',
      date: '2024 10 10',
      type: 'absence',
      unread: false
    }
  ];

  ngOnInit(): void {
    // Animation trigger
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return '✓';
      case 'ongoing':
        return '▶';
      case 'upcoming':
        return '⏱';
      default:
        return '';
    }
  }

  selectMessage(message: Message): void {
    this.selectedMessage = message;
  }

  getAttendanceColor(): string {
    if (this.attendancePercentage >= 85) return '#4caf50';
    if (this.attendancePercentage >= 75) return '#ff9800';
    return '#f44336';
  }
}