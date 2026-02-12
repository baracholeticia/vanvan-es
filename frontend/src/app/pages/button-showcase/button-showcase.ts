import { Component } from '@angular/core';
import { Buttons } from '../../components/buttons/buttons';
import { Toggle } from '../../components/toggle/toggle';

@Component({
  selector: 'app-button-showcase',
  standalone: true,
  imports: [Buttons, Toggle],
  templateUrl: './button-showcase.html',
  styleUrl: './button-showcase.css'
})
export class ButtonShowcase {
  toggleState1 = false;
  toggleState2 = true;
  toggleState3 = false;
}