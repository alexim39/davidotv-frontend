import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
selector: 'app-category-nav',
standalone: true,
imports: [CommonModule, RouterModule],
template: `
<nav class="category-nav">
  <ul>
    <li *ngFor="let category of categories">
      <a [routerLink]="['/shop/category', category.id]" 
         routerLinkActive="active">
        {{ category.name }}
      </a>
    </li>
  </ul>
</nav>
`,
styles: [`

.category-nav {
  background: white;
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 90;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  
  ul {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-x: auto;
    scrollbar-width: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  li {
    flex-shrink: 0;
  }
  
  a {
    text-decoration: none;
    color: #666;
    font-weight: 600;
    font-size: 14px;
    padding: 8px 0;
    position: relative;
    transition: color 0.2s ease;
    
    &:hover {
      color: #333;
    }
    
    &.active {
      color: #E91E63;
      
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: #E91E63;
      }
    }
  }
  
  @media (max-width: 768px) {
    ul {
      padding: 0 15px;
    }
  }
}
    `]
})
export class CategoryNavComponent {
  categories = [
    { id: 'all', name: 'All Products' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'music', name: 'Music' },
    { id: 'merch', name: 'Merchandise' },
    { id: 'limited', name: 'Limited Edition' }
  ];
}