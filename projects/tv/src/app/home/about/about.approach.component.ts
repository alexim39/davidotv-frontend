import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

/** @title Async training approach page */
@Component({
  selector: 'async-about-approach',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule],

template: `
  <div class="training-approach">
    <h3 class="approach-heading">What You’ll Find on DavidoTV</h3>

    <div class="approach-card">
      <div class="title">
        <mat-icon>payments</mat-icon>
        <h1>Exclusive Content You Won’t Find Anywhere Else</h1>
      </div>
      <div class="content">
        <ul>
          <li>
            <p>Behind-the-scenes footage of tours, studio sessions, and more</p>
          </li>
          <li>
            <p>First-listens of unreleased songs and acoustic versions</p>
          </li>
          <li>
            <p>VIP livestreams, vlogs, and fan shoutouts</p>
          </li>
          <li>
            <p>Documentaries, interviews, and short films chronicling his legacy</p>
          </li>
        </ul>
      </div>
    </div>

    <div class="approach-card">
      <div class="title">
        <mat-icon fontIcon="lightbulb"></mat-icon>
        <h1>Direct Access to Davido</h1>
      </div>
      <div class="content">
        <ul>
          <li>
            <p>No social media algorithms. No filters.</p>
          </li>
          <li>
            <p>Receive real-time updates, personal announcements, and concert drops</p>
          </li>
          <li>
            <p>Participate in Q&As, voice messages, fan polls, and creative feedback sessions</p>
          </li>
          <li>
            <p>Celebrate milestones and get birthday shoutouts, “Fan of the Week” features, and more</p>
          </li>
        </ul>
      </div>
    </div>

    <div class="approach-card">
      <div class="title">
        <mat-icon fontIcon="approval_delegation"></mat-icon>
        <h1>Global Fan Community</h1>
      </div>
      <div class="content">
        <ul>
          <li>
            <p>Connect and chat with fellow fans from Nigeria, Ghana, South Africa, the UK, US, and beyond</p>
          </li>
          <li>
            <p>Join country-specific hubs and regional fan groups</p>
          </li>
          <li>
            <p>Take part in global fan projects, challenges, listening parties, and countdowns</p>
          </li>
        </ul>
      </div>
    </div>

    <div class="approach-card">
      <div class="title">
        <mat-icon fontIcon="approval_delegation"></mat-icon>
        <h1>Merch & Music</h1>
      </div>
      <div class="content">
        <ul>
          <li>
            <p>Access limited edition drops before anyone else</p>
          </li>
          <li>
            <p>Buy what you see Davido wear directly</p>
          </li>
          <li>
            <p>Premium subscribers enjoy discounts, free gifts, and early ticket access</p>
          </li>
        </ul>
      </div>
    </div>

    <div class="approach-card">
      <div class="title">
        <mat-icon fontIcon="approval_delegation"></mat-icon>
        <h1>Premium Membership Options</h1>
      </div>
      <div class="content">
        <ul>
          <li>
            <p>Basic: Ad-free content, early drops, and forum perks</p>
          </li>
          <li>
            <p>VIP: Monthly meet-and-greets, behind-the-scenes tours, and surprise gifts</p>
          </li>
          <li>
            <p>Ultimate Fan: Custom videos, exclusive merchandise, and access to Davido-curated events</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
`,
styles: [`
  .training-approach {
    background-color: rgb(5, 1, 17);
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    padding: 3em;
    align-items: flex-start;
    flex-wrap: wrap;
    position: relative;
  }

  .approach-heading {
    width: 100%;
    text-align: center;
    color: #ffb1c5;
    margin-bottom: 2em;
    font-size: 2em;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .approach-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #1a082a;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(140,0,69,0.07);
    margin: 1em;
    min-width: 320px;
    max-width: 370px;
    flex: 1 1 340px;
    padding: 2em 1.5em;
  }

  .approach-card .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #ffb1c5;
    margin-bottom: 1em;
    h1 {
      font-family: system-ui;
      font-size: 1.1em;
      margin: 0;
      font-weight: 600;
    }
    mat-icon {
      border-radius: 50%;
      font-size: 1.5em;
      margin-right: 1em;
      background: #fff0fa;
      color: #8f0045;
      padding: 0.2em;
    }
  }

  .approach-card .content {
    color: #fff;
    font-size: 0.98em;
    padding-left: 0.5em;
    ul {
      padding-left: 1.2em;
    }
    p {
      line-height: 2em;
      text-align: justify;
      margin: 0;
    }
  }

  @media only screen and (max-width: 1500px) {
    .training-approach {
      flex-direction: column;
      padding: 1em;
      align-items: center;
    }
    .approach-card {
      margin-top: 2em;
      //width: 100%;
      max-width: 98vw;
      /* .content {
        ul {
          padding-left: 1em;
        }
        p {
          line-height: -1.6em;
        }
      } */
    }
    .approach-heading {
      font-size: 1.3em;
      margin-bottom: 1em;
    }
  }
`],
})
export class AboutApproachComponent { }
