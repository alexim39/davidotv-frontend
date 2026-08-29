import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Premium midnight theme controller.
 * Persists preference, toggles `dark-mode` on <body> and exposes signal for UI bindings.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** true = midnight obsidian (#0B0B0C) luxury dark */
  readonly isDark = signal<boolean>(this.readInitial());

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const dark = this.isDark();
      document.body.classList.toggle('dark-mode', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
      localStorage.setItem('davidotv_theme', dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  setDark(v: boolean): void {
    this.isDark.set(v);
  }

  private readInitial(): boolean {
    if (!this.isBrowser) return true; // SSR default to dark luxury
    const stored = localStorage.getItem('davidotv_theme');
    if (stored) return stored === 'dark';
    // Default to dark luxury per rebrand
    return true;
  }
}
