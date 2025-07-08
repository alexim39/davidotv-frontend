import {Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

/** @title Simple form field */
@Component({
  selector: 'async-about-async',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule,MatIconModule, MatSelectModule],
  template: `
      <div class="about-training">
        <div class="text-content">
          <h1>
              DavidoTV – The Ultimate Fan Destination for All Things Davido.
          </h1>

          <h5>
            The Beat of a Generation. The Voice of the Fans. The Future of Fan Connection.

          </h5>

          <p>
            DavidoTV is the non-official fan-powered digital home for everything related to Davido — Africa's biggest music superstar, international hitmaker, and the 30GB 001. 
            More than just an app, DavidoTV is a dedicated entertainment universe, a mini YouTube and social network, designed by fans, for fans to get connected to the world of Davido.
          </p>

          <p>
            This is where music meets community, exclusivity meets authenticity, and the culture comes alive.
          </p>
        </div>
      </div>

  `,
  styles: [`
    .about-training {
      padding: 4em;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #eee;
      .text-content {
        text-align: center;
        h1 {
          color: #8f0045;
          font-size: 2em;
        }
        h5 {
          color: #ffb1c5;
        }

        p {
          text-align: justify;
          font-family: system-ui;
          width: 70em;
        }
      }
    }


/* Extra small devices (phones, 750px and down) */
@media only screen and (max-width: 750px) {
.about-training {
    padding: 1em;
    .text-content {
      h1 {
        font-size: 1.5em;
      }
      p {
        width: 100%;
      }
    }
  }
}

@media only screen and (min-device-width: 601px) and (max-device-width: 1024px) {
  .about-training {
    padding: 1em;
    .text-content {
      h1 {
        font-size: 1.7em;
      }
      p {
        width: 100%;
      }
    }
  }
}

  `],
})
export class AboutAsyncComponent {}
