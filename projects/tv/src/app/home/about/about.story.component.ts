import {Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

/** @title Simple form field */
@Component({
  selector: 'async-about-story',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule,MatIconModule, MatSelectModule,],
  template: `



      <div class="our-story">

        <div class="img-content">
            <img src="img/logo3.png" alt="About DavidoTV">
        </div>

        <div class="text-content">

            <h3>
            What Makes DavidoTV Different?
            </h3>
            <p>
              Unlike Instagram or TikTok, where only 5–10% of followers see posts, DavidoTV ensures 100% of fans get the message. 
              It’s not about going viral. It’s about building real connection.
            </p>

            <p>
              Unlike YouTube, where content is buried by algorithms, DavidoTV ensures every moment matters. 
              Fans can explore Davido’s career, his values, and his voice without distraction.
            </p>


            <p>
              Unlike other fan sites, DavidoTV gives fans a seat at the table. 
              You don’t just watch. You create, vote, like, share, remix, and grow with Davido.
            </p>

        </div>


      </div>



  `,
  styles: [`

      .our-story {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-grow: 1;
        padding: 4em;

        .img-content {
            width: 50%;
            margin-bottom: -0.5em;
            img {
              width: 100%;
              border-radius: 10px;
            }
        }
      .text-content {
        width: 45%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding: 2em;
        h3 {
          color: #ffb1c5;
        }
        p {
          text-align: left;
          font-family: system-ui;
        }
      }
    }


/* Extra small devices (phones, 750px and down) */
@media only screen and (max-width: 750px) {
  .our-story {
    display: flex;
    flex-direction: row;
    padding: 1em;


    .img-content {
      display: none;
    }
    .text-content {
      width: 100%;
      text-align: justify;
    }
  }
}
  `],
})
export class AboutStoryComponent {}
