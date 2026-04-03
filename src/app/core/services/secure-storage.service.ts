import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly secret = 'k3y';

  /* ================= PUBLIC ================= */

  setString(key: string, value: string): void {
    localStorage.setItem(key, this.encrypt(value));
  }

  getString(key: string): string | null {
    const data = localStorage.getItem(key);
    return data ? this.decrypt(data) : null;
  }

  setJson<T>(key: string, value: T): void {
    this.setString(key, JSON.stringify(value));
  }

  getJson<T>(key: string): T | null {
    const data = this.getString(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  delete(key: string): void {
    localStorage.removeItem(key);
  }

  /* ================= CORE ================= */

  private encrypt(text: string): string {
    const utf8 = encodeURIComponent(text);
    const xored = this.xor(utf8);
    return btoa(xored);
  }

  private decrypt(encoded: string): string {
    const decoded = atob(encoded);
    const xored = this.xor(decoded);
    return decodeURIComponent(xored);
  }

  private xor(text: string): string {
    return text
      .split('')
      .map((c, i) =>
        String.fromCharCode(
          c.charCodeAt(0) ^ this.secret.charCodeAt(i % this.secret.length)
        )
      )
      .join('');
  }
}
