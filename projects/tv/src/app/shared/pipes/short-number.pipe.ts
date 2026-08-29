import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats 1200 -> 1.2K, 1_200_000 -> 1.2M, etc.
 * Pure pipe - zoneless safe.
 */
@Pipe({ name: 'shortNumber', standalone: true, pure: true })
export class ShortNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '0';
    const n = Number(value);
    if (isNaN(n)) return '0';
    if (n < 1000) return `${n}`;
    const units = ['K', 'M', 'B'];
    let unitIndex = -1;
    let reduced = n;
    while (reduced >= 1000 && unitIndex < units.length - 1) {
      reduced /= 1000;
      unitIndex++;
    }
    return `${reduced.toFixed(reduced < 10 ? 1 : 0)}${units[unitIndex]}`;
  }
}
