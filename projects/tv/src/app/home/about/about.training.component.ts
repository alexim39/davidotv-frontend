import {Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

/** @title Simple form field */
@Component({
  selector: 'async-about-training',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule,MatIconModule, MatSelectModule],
  template: `

      <div class="about-async">

        <div class="text-content">
         
          <h3>
          Who Is Davido?
          </h3>

            <p>
            David Adedeji Adeleke, globally known as Davido, is a Nigerian-American singer, songwriter, and record producer who has changed the global music landscape. 
            With over a decade of dominance, countless awards, and international chart-topping hits, Davido has brought Afrobeats into the mainstream and empowered a generation of fans with his sound, story, and spirit.
            </p>

            <p>
              Davido isn’t just an artist. He’s a movement. 
              His music, philanthropy, charisma, and energy have created a fanbase like no other — loyal, global, and emotionally connected.
            </p>

          <h3>
          Why DavidoTV Exists
          </h3>

            <p>
              Social media gave fans a glimpse into Davido’s world — but DavidoTV opens the door. 
              This platform is built to bridge the gap between Davido and his fans, offering unfiltered access, exclusive content, fan-powered challenges, and direct community interaction in one vibrant, curated space.
          </p>

          <p>
            On DavidoTV, you're not just a follower — you’re family.
          </p>

          <p>
            DavidoTV is Davido’s gift to his fans, but it’s also a platform that will define the future of artist-fan relationships. This isn’t just about content. 
            It’s about building something that outlives the trends — a legacy platform, a cultural landmark, and a home for the people who made it all possible: the fans.
          </p>

        </div>

        <div class="img-content">
          <img src="img/about.jpg" alt="About DavidoTV">
        </div>
      </div>


  `,
  styles: [`


    .about-async {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      flex-grow: 1;
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
        justify-content: center;
        align-items: flex-left;
        padding: 2em;
        h3 {
          color: #ffb1c5;
          text-align: center;
        }
        p {
          text-align: justify;
          font-family: system-ui;
        }
      }
    }





/* Extra small devices (phones, 750px and down) */
@media only screen and (max-width: 750px) {
  .about-async {
    display: flex;
    flex-direction: row;
    .img-content {
      display: none;
    }
    .text-content {
      width: 100%;
      h1 {
        font-size: 1.5em;
      }
      p {
        padding: 0.5em;
      }

    }
  }
}
  `],
})
export class AboutTrainingComponent {}
