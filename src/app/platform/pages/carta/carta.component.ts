import { Component, OnInit, HostListener } from '@angular/core';
import { PlatformService } from '../../services/platform.service';
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

  constructor(private platformService: PlatformService) { }

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

  disponibilidad(plato: Plato): void {
    plato.disponibilidad = !plato.disponibilidad;
    this.platformService.toggleDisponibilidad(plato.id, plato.disponibilidad).subscribe();
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