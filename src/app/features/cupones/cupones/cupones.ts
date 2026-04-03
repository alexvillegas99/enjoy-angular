import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CuponService } from '../../../services/cupones.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-cupones',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './cupones.html',
})
export class Cupones {
  private cuponService = inject(CuponService);

  cupones: any[] = [];
  page = 1;
  limit = 10;
  totalPages = 0;
  search = '';
  loading = false;

  private search$ = new Subject<string>();

  ngOnInit() {
    this.search$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value;
        this.page = 1;
        this.cargar();
      });

    this.cargar();
  }

  cargar() {
    this.loading = true;
    this.cuponService
      .getCupones(this.page, this.limit, this.search)
      .subscribe((res) => {
        this.cupones = res.data;
        this.totalPages = Math.ceil(res.total / this.limit);
        this.loading = false;
      });
  }

  onSearchInput(value: string) {
    this.search$.next(value);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.cargar();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.cargar();
    }
  }

  get paginas(): number[] {
    let start = Math.max(this.page - 2, 1);
    let end = Math.min(start + 4, this.totalPages);
    if (end - start < 4) start = Math.max(end - 4, 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  irPagina(p: number) {
    if (p !== this.page) {
      this.page = p;
      this.cargar();
    }
  }
}
