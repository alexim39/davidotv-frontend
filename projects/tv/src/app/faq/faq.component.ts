import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FAQS } from './faq-data';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from './filter.pipe';

/**
 * @title Page for FAQ component
 */
@Component({
selector: 'async-faqs',
standalone: true,
imports: [MatButtonModule, RouterModule, MatDividerModule, FormsModule, FilterPipe, CommonModule, RouterModule, MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule],
styles: [`
    
.head {
  background: #8f0045;
  padding: 2em;
  font-family: Garamond, serif;

  article {
    color: white;
    h2 {
      font-size: 2em;
      text-align: center;

    }
    h3 {
      font-family: Georgia, serif;
      font-size: 1em;
    }
    div {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      p {
        text-align: justify;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5em;
        width: 40%;
      }
      ul {
        li {
          line-height: 2em;
        }
      }
    }

    a {
      color: white;
      text-decoration: underline;
      font-weight: bold;
    }
  }
}

.body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
    .writeup {
      padding: 2em 5em;

      p {
        text-align: justify;
        /* font-family: 'Courier New', monospace; */
        font-size: 14px;
        line-height: 1.5em;
      }
      .form{
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        mat-form-field {
          flex: 1;
         }
      }
      mat-form-field {
        width: 100%;
      }
      button {
        width: 15%;
      }
    }
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
.head {
  padding: 1em;
    article {
      h2 {
        font-size: 1em;
      }
      h3 {
        font-size: 1em;
      }
    div {
      p {
        width: 100%;
      }
    }
  }
}

.body {
  .writeup {
    h3 {
      padding-left: 1em;
    }
    width: 100%;
    padding: 1em;
    .form {
      display: flex;
      flex-direction: column;
    }
    button {
      width: 100%;
    }
  }
}
}
`],
template: `
    
<section class="head">
    <article>
        <h2>Frequently Asked Questions (FAQs)</h2>
        <div>
          <p>
            Got questions? We’ve got answers! Here are some of the most common inquiries about DavidoTV.
          </p>
        </div>
      </article>
  </section>
  
  <section class="breadcrumb-wrapper">
    <div class="breadcrumb">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Home</a> &gt;
        <a routerLink="/faq" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Support</a> &gt;
        <span>faq</span>
    </div>
  </section>
  
  
<section class="body">
  <article class="writeup">
    <h3>FAQs</h3>

    <div class="form">
      <mat-form-field appearance="outline">
        <mat-label>Search for question</mat-label>
        <input matInput [(ngModel)]="searchTerm">
      </mat-form-field>
    </div>

    <mat-accordion>
      <ng-container *ngFor="let faq of faqs | filter:searchTerm">
        <mat-expansion-panel class="accordion">
          <mat-expansion-panel-header>
            <mat-panel-title>{{ faq.question }}</mat-panel-title>
          </mat-expansion-panel-header>
          <p [innerHTML]="faq.answer"></p>
        </mat-expansion-panel>
        
      </ng-container>
      
    </mat-accordion>
    
  </article>
</section>
    `,
})
export class faqsComponent implements OnInit {
  faqs = FAQS;
  searchTerm: string = '';

  constructor() { }

  ngOnInit(): void {}

    // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get filteredFaqs() {
    return this.faqs.filter(faq => faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

 }