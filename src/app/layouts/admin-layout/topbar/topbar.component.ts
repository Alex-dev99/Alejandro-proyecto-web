import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private router: Router) {}

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}