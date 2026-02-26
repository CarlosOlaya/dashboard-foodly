import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from '../../services/platform.service';
import { AlertService } from '../../services/alert.service';
import { Plato, Categoria } from '../../../shared/interfaces';

@Component({
  selector: 'app-carta',
  templateUrl: './carta.component.html',
  styleUrls: ['./carta.component.css']
})
export class CartaComponent implements OnInit {

  carta: Plato[] = [];
  categorias: Categoria[] = [];
  productosFiltrados: Plato[] = [];
  loading = true;
  categoriaActiva: Categoria | null = null;
  showMoreCats = false;

  private readonly MAX_VISIBLE_CHIPS = 4;

  get categoriasVisibles(): Categoria[] {
    return this.categorias.slice(0, this.MAX_VISIBLE_CHIPS);
  }

  get categoriasOverflow(): Categoria[] {
    return this.categorias.slice(this.MAX_VISIBLE_CHIPS);
  }

  constructor(
    private platformService: PlatformService,
    private alert: AlertService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.cargarCategoria();
    this.cargarCarta();
  }

  cargarCategoria(): void {
    this.platformService.getCategorias().subscribe({
      next: cats => this.categorias = cats,
      error: () => { }
    });
  }

  cargarCarta(): void {
    this.loading = true;
    this.platformService.getCarta().subscribe({
      next: carta => {
        this.carta = carta;
        this.productosFiltrados = [...this.carta];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  async disponibilidad(plato: Plato): Promise<void> {
    // Si controla stock y está agotado → no se puede activar desde Carta
    if (plato.controla_stock && !plato.disponibilidad) {
      const result = await this.alert.fire({
        icon: 'warning',
        title: 'Plato con control de inventario',
        html: `<p style="font-size:14px; color:var(--text-secondary); line-height:1.6;">
          <strong>${plato.nombre}</strong> está deshabilitado porque uno o más insumos están agotados.<br><br>
          Para reactivarlo, reponga stock desde el módulo de <strong>Inventario</strong>.
        </p>`,
        confirmButtonText: 'Ir a Inventario',
        showCancelButton: true,
        cancelButtonText: 'Entendido',
      });

      if (result.isConfirmed) {
        this.router.navigate(['/home/productos']);
      }
      return;
    }

    // Para platos sin control de stock o para desactivar (siempre se puede)
    const nuevoEstado = !plato.disponibilidad;
    plato.disponibilidad = nuevoEstado;

    this.platformService.toggleDisponibilidad(plato.id, nuevoEstado).subscribe({
      error: (err) => {
        // Revertir el cambio visual si el backend rechaza
        plato.disponibilidad = !nuevoEstado;
        this.alert.error(err?.error?.message || 'No se pudo cambiar disponibilidad');
      }
    });
  }

  filtrarPlatos(event: KeyboardEvent): void {
    const filtro = (event.target as HTMLInputElement).value.toLowerCase();
    this.productosFiltrados = this.carta.filter(p =>
      p.nombre.toLowerCase().includes(filtro)
    );
  }

  filtrarPorCategoria(categoria: Categoria): void {
    this.categoriaActiva = categoria;
    this.productosFiltrados = this.carta.filter(p =>
      p.categoria?.nombre === categoria.nombre
    );
  }

  mostrarTodos(): void {
    this.categoriaActiva = null;
    this.productosFiltrados = [...this.carta];
  }

  toggleMoreCats(event: Event): void {
    event.stopPropagation();
    this.showMoreCats = !this.showMoreCats;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showMoreCats = false;
  }
}