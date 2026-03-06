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
export class ClientLayout {}
