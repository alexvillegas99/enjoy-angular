import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OtpService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.api}otps`;

  /**
   * Genera OTP y lo envía al correo
   */
  generate(email: string): Observable<{ message: string; otp: string }> {
    return this.http.post<{ message: string; otp: string }>(
      `${this.baseUrl}/generate`,
      { email }
    );
  }

  /**
   * Verifica OTP ingresado por el usuario
   */
  verify(email: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/verify`,
      { email, code }
    );
  }
}
