import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, Subscription, debounceTime } from 'rxjs';

import { ChatService } from '../../../../services/chat.service';
import { ChatSocketService } from '../../../../services/chat-socket.service';
import { SecureStorageService } from '../../../../core/services/secure-storage.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './chat-page.html',
})
export class ChatPage implements OnInit, OnDestroy, AfterViewChecked {
  private svc = inject(ChatService);
  private socket = inject(ChatSocketService);
  private storage = inject(SecureStorageService);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('msgScroll') msgScrollRef?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  // ── Lista hilos
  hilos: any[] = [];
  loadingHilos = false;
  filtroEstado: 'ABIERTA' | 'CERRADA' | 'TODOS' = 'ABIERTA';
  soloMisAsignados = false;
  q = '';
  private qSubject = new Subject<string>();

  // ── Conversación
  hiloActivo: any = null;
  mensajes: any[] = [];
  cursor: string | null = null;
  hayMas = false;
  cargandoMensajes = false;
  enviando = false;
  texto = '';
  miUserId = '';
  peerEscribiendo = false;
  private peerTypingTimer: any = null;
  private miTypingTimer: any = null;
  private autoScrollPendiente = false;
  // Heartbeat de atención (cada 60s mientras la conv está abierta)
  private heartbeatTimer: any = null;

  // ── Permisos
  esSoporte = false;
  puedeResponder = false;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    const user = this.storage.getJson<any>('user');
    this.miUserId = (user?._id ?? user?.id ?? '').toString();
    const permisos: string[] = user?.permisos ?? [];
    this.esSoporte =
      permisos.includes('chat.ver') || permisos.includes('chat.responder');
    this.puedeResponder =
      permisos.includes('chat.responder') || permisos.includes('dashboard.ver');

    this.socket.connect();
    this.subs.push(
      this.socket.mensaje$.subscribe((m) => this.onMensajeRecibido(m)),
    );
    this.subs.push(
      this.socket.leido$.subscribe((info) => this.onLeidoRecibido(info)),
    );
    this.subs.push(
      this.socket.escribiendo$.subscribe((info) =>
        this.onEscribiendoRecibido(info),
      ),
    );
    this.subs.push(
      this.socket.conversacionActualizada$.subscribe((conv) =>
        this.mergeHilo(conv),
      ),
    );

    this.subs.push(
      this.qSubject.pipe(debounceTime(350)).subscribe(() => this.cargarHilos()),
    );

    if (this.esSoporte) {
      this.cargarHilos();
    } else {
      this.svc.miHilo().subscribe({
        next: (hilo) => {
          this.hilos = [hilo];
          this.abrirHilo(hilo);
        },
        // Silencioso: la UI muestra "Sin conversaciones" si no hay hilo.
        error: () => {},
      });
    }
  }

  ngOnDestroy(): void {
    if (this.hiloActivo) {
      this.socket.leave(this.hiloActivo._id);
      if (this.esSoporte) {
        this.svc.liberar(this.hiloActivo._id).subscribe({
          next: () => {},
          error: () => {},
        });
      }
    }
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.subs.forEach((s) => s.unsubscribe());
    clearTimeout(this.peerTypingTimer);
    clearTimeout(this.miTypingTimer);
  }

  ngAfterViewChecked(): void {
    if (this.autoScrollPendiente && this.msgScrollRef) {
      const el = this.msgScrollRef.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.autoScrollPendiente = false;
    }
  }

  // ── Hilos ──────────────────────────────────────────────────────────
  onSearch() {
    this.qSubject.next(this.q);
  }

  cargarHilos() {
    if (!this.esSoporte) return;
    this.loadingHilos = true;
    this.svc
      .listarHilos({
        q: this.q || undefined,
        estado:
          this.filtroEstado === 'TODOS' ? undefined : (this.filtroEstado as any),
        asignadoMi: this.soloMisAsignados,
        limit: 50,
      })
      .subscribe({
        next: (r) => {
          this.hilos = r.items ?? [];
          this.loadingHilos = false;
        },
        // Silencioso: la UI ya muestra "No hay conversaciones".
        error: () => {
          this.hilos = [];
          this.loadingHilos = false;
        },
      });
  }

  mergeHilo(conv: any) {
    if (!conv?._id) return;
    const i = this.hilos.findIndex(
      (h) => h._id?.toString() === conv._id.toString(),
    );
    if (i >= 0) {
      this.hilos[i] = { ...this.hilos[i], ...conv };
    } else if (this.esSoporte) {
      this.hilos.unshift(conv);
    }
    this.hilos.sort((a, b) => {
      const fa = a.updatedAt?.toString() ?? '';
      const fb = b.updatedAt?.toString() ?? '';
      return fb.localeCompare(fa);
    });
    if (this.hiloActivo && this.hiloActivo._id === conv._id) {
      this.hiloActivo = { ...this.hiloActivo, ...conv };
    }
  }

  abrirHilo(hilo: any) {
    if (this.hiloActivo) {
      this.socket.leave(this.hiloActivo._id);
      // Liberar el hilo anterior si soporte estaba atendiéndolo.
      if (this.esSoporte && this.atendidoPorMi(this.hiloActivo)) {
        this.svc.liberar(this.hiloActivo._id).subscribe({
          next: () => {},
          error: () => {},
        });
      }
    }
    this.hiloActivo = hilo;
    this.mensajes = [];
    this.cursor = null;
    this.hayMas = false;
    this.peerEscribiendo = false;
    this.cargarMensajes(true);
    this.socket.join(hilo._id);

    // Reclamo / refresco atención (soft-lock multi-agente).
    if (this.esSoporte) {
      this.svc.atender(hilo._id).subscribe({
        next: (upd) => {
          this.hiloActivo = upd;
          this.mergeHilo(upd);
        },
        error: () => {},
      });
      // Heartbeat cada 60s
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (this.hiloActivo && this.atendidoPorMi(this.hiloActivo)) {
          this.svc.heartbeat(this.hiloActivo._id).subscribe({
            next: () => {},
            error: () => {},
          });
        }
      }, 60_000);
    }

    this.svc.marcarLeidos(hilo._id).subscribe({
      next: () => {
        const t = this.esSoporte ? 'noLeidosSoporte' : 'noLeidosLocal';
        hilo[t] = 0;
      },
      error: () => {},
    });
  }

  // ── Presencia helpers ────────────────────────────────────────────
  atendidoPorMi(h: any): boolean {
    return (
      h?.atendiendoAhora &&
      h.atendiendoAhora.userId?.toString() === this.miUserId
    );
  }

  atendidoPorOtro(h: any): boolean {
    return (
      h?.atendiendoAhora &&
      h.atendiendoAhora.userId?.toString() !== this.miUserId
    );
  }

  nombreAtiende(h: any): string {
    return h?.atendiendoAhora?.nombre || '';
  }

  cargarMensajes(inicial: boolean) {
    if (!this.hiloActivo) return;
    this.cargandoMensajes = true;
    const prevHeight =
      this.msgScrollRef?.nativeElement?.scrollHeight ?? 0;
    this.svc.mensajes(this.hiloActivo._id, inicial ? null : this.cursor).subscribe({
      next: (r) => {
        const nuevos = r.items ?? [];
        if (inicial) {
          this.mensajes = nuevos;
          this.autoScrollPendiente = true;
        } else {
          this.mensajes = [...nuevos, ...this.mensajes];
          // Mantener posición visual.
          setTimeout(() => {
            if (this.msgScrollRef) {
              const el = this.msgScrollRef.nativeElement;
              el.scrollTop = el.scrollHeight - prevHeight;
            }
          }, 0);
        }
        this.cursor = r.nextCursor;
        this.hayMas = !!r.nextCursor;
        this.cargandoMensajes = false;
      },
      error: () => {
        this.cargandoMensajes = false;
        if (inicial) this.mensajes = [];
      },
    });
  }

  onScrollMensajes() {
    if (!this.msgScrollRef) return;
    const el = this.msgScrollRef.nativeElement;
    if (el.scrollTop < 80 && this.hayMas && !this.cargandoMensajes) {
      this.cargarMensajes(false);
    }
  }

  // ── Eventos WS ────────────────────────────────────────────────────
  onMensajeRecibido(m: any) {
    if (m.conversacionId?.toString() !== this.hiloActivo?._id?.toString()) {
      // refrescamos lista para reordenar
      this.mergeHilo({
        _id: m.conversacionId,
        ultimoMensaje: {
          texto: m.texto,
          fecha: m.createdAt,
          autorTipo: m.autorTipo,
        },
        updatedAt: m.createdAt,
      });
      // Sonido + notificación nativa si el agente no está mirando este hilo.
      if (this.esSoporte && m.autorTipo === 'LOCAL') {
        this.notificarNuevoMensaje(m);
      }
      return;
    }
    this.mensajes = [...this.mensajes, m];
    this.autoScrollPendiente = true;
    if (m.autorId?.toString() !== this.miUserId) {
      this.svc.marcarLeidos(this.hiloActivo._id).subscribe();
    }
  }

  private notificarNuevoMensaje(m: any) {
    // Sonido corto
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {}

    // Notificación nativa
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Nuevo mensaje de soporte', {
          body: m.texto || (m.adjuntoUrl ? '📷 Imagen' : ''),
          icon: '/favicon.ico',
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }

  onLeidoRecibido(info: any) {
    if (info.conversacionId?.toString() !== this.hiloActivo?._id?.toString())
      return;
    const lectorTipo = info.lectorTipo;
    const fecha = info.fecha || new Date().toISOString();
    this.mensajes = this.mensajes.map((m) =>
      m.autorId?.toString() === this.miUserId &&
      !m.leidoEn &&
      m.autorTipo !== lectorTipo
        ? { ...m, leidoEn: fecha }
        : m,
    );
  }

  onEscribiendoRecibido(info: any) {
    if (info.conversacionId?.toString() !== this.hiloActivo?._id?.toString())
      return;
    if (info.userId === this.miUserId) return;
    this.peerEscribiendo = !!info.escribiendo;
    clearTimeout(this.peerTypingTimer);
    if (this.peerEscribiendo) {
      this.peerTypingTimer = setTimeout(
        () => (this.peerEscribiendo = false),
        3000,
      );
    }
    this.cdr.markForCheck();
  }

  // ── Composer ──────────────────────────────────────────────────────
  onTextoChange() {
    if (!this.hiloActivo) return;
    this.socket.emitirEscribiendo(this.hiloActivo._id, true);
    clearTimeout(this.miTypingTimer);
    this.miTypingTimer = setTimeout(() => {
      this.socket.emitirEscribiendo(this.hiloActivo._id, false);
    }, 2000);
  }

  enviar(imagenBase64?: string) {
    if (!this.hiloActivo) return;
    const texto = this.texto.trim();
    if (!texto && !imagenBase64) return;
    this.enviando = true;
    this.svc
      .enviar(this.hiloActivo._id, {
        texto: texto || undefined,
        imagenBase64,
      })
      .subscribe({
        next: (m) => {
          this.texto = '';
          this.enviando = false;
          this.socket.emitirEscribiendo(this.hiloActivo._id, false);
          if (
            !this.mensajes.some(
              (x) => x._id?.toString() === m._id?.toString(),
            )
          ) {
            this.mensajes = [...this.mensajes, m];
            this.autoScrollPendiente = true;
          }
        },
        error: (e) => {
          this.enviando = false;
          this.alert.error(
            'No se pudo enviar',
            e?.error?.message || 'Intenta de nuevo.',
          );
        },
      });
  }

  abrirSelector() {
    this.fileInput?.nativeElement?.click();
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.alert.error('Archivo inválido', 'Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.alert.error('Demasiado grande', 'La imagen supera los 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.enviar(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  // ── Acciones soporte ──────────────────────────────────────────────
  asignarme() {
    if (!this.hiloActivo) return;
    this.svc.asignar(this.hiloActivo._id).subscribe({
      next: (upd) => {
        this.hiloActivo = upd;
        this.mergeHilo(upd);
        this.alert.success('Asignado', 'El hilo te fue asignado.');
      },
      error: () => this.alert.error('Error', 'No se pudo asignar.'),
    });
  }

  // ── Transferencia ────────────────────────────────────────────────
  mostrarTransferir = false;
  agentesDisponibles: any[] = [];
  paraUserId = '';
  observacionTransferir = '';

  abrirTransferir() {
    this.paraUserId = '';
    this.observacionTransferir = '';
    if (!this.agentesDisponibles.length) {
      this.svc.listarAgentes().subscribe({
        next: (a) => {
          this.agentesDisponibles = (a || []).filter(
            (x: any) => x._id !== this.miUserId,
          );
          this.mostrarTransferir = true;
        },
        error: () => {
          this.alert.error('Error', 'No se pudo cargar la lista de agentes.');
        },
      });
    } else {
      this.mostrarTransferir = true;
    }
  }

  cerrarTransferir() {
    this.mostrarTransferir = false;
  }

  confirmarTransferir() {
    if (!this.paraUserId) {
      this.alert.error('Falta destino', 'Selecciona el agente al que transferir.');
      return;
    }
    if (!this.observacionTransferir.trim()) {
      this.alert.error(
        'Falta observación',
        'Escribe el motivo de la transferencia.',
      );
      return;
    }
    this.svc
      .transferir(
        this.hiloActivo._id,
        this.paraUserId,
        this.observacionTransferir.trim(),
      )
      .subscribe({
        next: (upd) => {
          this.hiloActivo = upd;
          this.mergeHilo(upd);
          this.mostrarTransferir = false;
          this.alert.success('Transferido', 'Conversación transferida.');
        },
        error: (e) => {
          this.alert.error(
            'Error',
            e?.error?.message || 'No se pudo transferir.',
          );
        },
      });
  }

  asignadoNombre(h: any): string {
    return h?.asignadoANombre || '';
  }

  toggleEstado() {
    if (!this.hiloActivo) return;
    const cerrada = this.hiloActivo.estado === 'CERRADA';
    const obs = cerrada
      ? this.svc.reabrir(this.hiloActivo._id)
      : this.svc.cerrar(this.hiloActivo._id);
    obs.subscribe({
      next: (upd) => {
        this.hiloActivo = upd;
        this.mergeHilo(upd);
      },
      error: () => this.alert.error('Error', 'No se pudo actualizar el hilo.'),
    });
  }

  // ── Helpers UI ────────────────────────────────────────────────────
  abrirImagen(url: string) {
    if (url) window.open(url, '_blank');
  }

  esMio(m: any) {
    return m.autorId?.toString() === this.miUserId;
  }

  noLeidos(h: any) {
    return this.esSoporte ? (h.noLeidosSoporte ?? 0) : (h.noLeidosLocal ?? 0);
  }

  formatHora(iso?: string) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }

  formatTiempo(iso?: string) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diff < 60) return 'ahora';
      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
      if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
      return d.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  }
}
