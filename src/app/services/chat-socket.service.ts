import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private socket?: Socket;

  readonly mensaje$ = new Subject<any>();
  readonly leido$ = new Subject<any>();
  readonly escribiendo$ = new Subject<any>();
  readonly conversacionActualizada$ = new Subject<any>();
  readonly conectado$ = new Subject<boolean>();

  connect() {
    if (this.socket?.connected) return;
    const token = localStorage.getItem('accessToken') || '';
    if (!token) return;
    const host = environment.api.replace(/\/api\/?$/, '');
    this.socket?.disconnect();
    this.socket = io(`${host}/ws/chat`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
    });
    this.socket.on('connect', () => this.conectado$.next(true));
    this.socket.on('disconnect', () => this.conectado$.next(false));
    this.socket.on('mensaje', (d: any) => this.mensaje$.next(d));
    this.socket.on('leido', (d: any) => this.leido$.next(d));
    this.socket.on('escribiendo', (d: any) => this.escribiendo$.next(d));
    this.socket.on('conversacion:actualizada', (d: any) =>
      this.conversacionActualizada$.next(d),
    );
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  join(conversacionId: string) {
    this.socket?.emit('join', { conversacionId });
  }

  leave(conversacionId: string) {
    this.socket?.emit('leave', { conversacionId });
  }

  emitirEscribiendo(conversacionId: string, escribiendo: boolean) {
    this.socket?.emit('escribiendo', { conversacionId, escribiendo });
  }
}
