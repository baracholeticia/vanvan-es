import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientSidebar } from '../sidebar/client-sidebar/client-sidebar';
import { Toast } from '../components/toast/toast';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, ClientSidebar, Toast],
  templateUrl: './client-layout.html',
})
export class ClientLayout {
  isScrolled = false;

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    // Set to true when scrolled down more than 10px
    this.isScrolled = target.scrollTop > 10;
  }
}
