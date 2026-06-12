import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ChatService } from '../../../../services/chat.service';
import { AlertService } from '../../../../core/services/alert.service';

interface Agente {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
}

@Component({
  selector: 'app-config-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './config-soporte.html',
})
export class ConfigSoporte implements OnInit {
  private svc = inject(ChatService);
  private alert = inject(AlertService);

  loading = true;
  saving = false;
  agentes: Agente[] = [];
  pool: { userId: string; nombre: string }[] = [];
  habilitado = true;
  escalacionMin = 30;
  agenteAAgregar = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading = true;
    Promise.all([
      this.svc.getRoutingConfig().toPromise(),
      this.svc.listarAgentes().toPromise(),
    ])
      .then(([cfg, ags]) => {
        this.habilitado = cfg?.habilitado ?? true;
        this.escalacionMin = cfg?.escalacionMin ?? 30;
        this.pool = (cfg?.pool ?? []).map((m: any) => ({
          userId: typeof m.userId === 'string' ? m.userId : m.userId?.toString(),
          nombre: m.nombre,
        }));
        this.agentes = (ags || []) as Agente[];
        this.loading = false;
      })
      .catch(() => {
        this.alert.error('Error', 'No se pudo cargar la configuración.');
        this.loading = false;
      });
  }

  agentesNoEnPool(): Agente[] {
    const ids = new Set(this.pool.map((p) => p.userId));
    return this.agentes.filter((a) => !ids.has(a._id));
  }

  agregar() {
    if (!this.agenteAAgregar) return;
    const a = this.agentes.find((x) => x._id === this.agenteAAgregar);
    if (!a) return;
    if (this.pool.some((p) => p.userId === a._id)) return;
    this.pool.push({ userId: a._id, nombre: a.nombre });
    this.agenteAAgregar = '';
  }

  quitar(i: number) {
    this.pool.splice(i, 1);
  }

  subir(i: number) {
    if (i <= 0) return;
    [this.pool[i - 1], this.pool[i]] = [this.pool[i], this.pool[i - 1]];
  }

  bajar(i: number) {
    if (i >= this.pool.length - 1) return;
    [this.pool[i + 1], this.pool[i]] = [this.pool[i], this.pool[i + 1]];
  }

  guardar() {
    this.saving = true;
    this.svc
      .updateRoutingConfig({
        habilitado: this.habilitado,
        escalacionMin: this.escalacionMin,
        pool: this.pool,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.alert.success(
            'Guardado',
            'Configuración de routing actualizada.',
          );
        },
        error: () => {
          this.saving = false;
          this.alert.error('Error', 'No se pudo guardar.');
        },
      });
  }
}
