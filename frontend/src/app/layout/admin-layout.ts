import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Toast } from '../components/toast/toast';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Toast],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {}
