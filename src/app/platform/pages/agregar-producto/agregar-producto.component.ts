import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformService } from '../../services/platform.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Categoria } from '../../../shared/interfaces';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-agregar-producto',
  templateUrl: './agregar-producto.component.html',
  styleUrls: ['./agregar-producto.component.css']
})
export class AgregarProductoComponent implements OnInit {

  productoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    categoria_id: [''],
    stock: [0, [Validators.required, Validators.min(0)]],
    stock_minimo: [0, [Validators.min(0)]],
    tipo_stock: ['unidad', [Validators.required]],
    ubicacion_almacen: [''],
    perecedero: [false],
  });

  id = '';
  isEditing = false;
  categorias: Categoria[] = [];

  tiposStock = [
    { value: 'unidad', label: 'Unidad (und)', icon: 'inventory_2' },
    { value: 'kg', label: 'Kilogramo (kg)', icon: 'scale' },
    { value: 'gramo', label: 'Gramo (g)', icon: 'scale' },
    { value: 'litro', label: 'Litro (lt)', icon: 'water_drop' },
    { value: 'ml', label: 'Mililitro (ml)', icon: 'water_drop' },
    { value: 'libra', label: 'Libra (lb)', icon: 'scale' },
  ];

  constructor(
    private fb: FormBuilder,
    private platformService: PlatformService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.platformService.getCategorias().subscribe(cats => this.categorias = cats);

    if (this.router.url.includes('editar-producto')) {
      this.isEditing = true;
      this.activatedRoute.params
        .pipe(
          switchMap(({ id }) => {
            this.id = id;
            return this.platformService.getProductos();
          })
        )
        .subscribe(productos => {
          const p = productos.find(prod => prod.id === this.id);
          if (p) {
            this.productoForm.patchValue({
              nombre: p.nombre,
              categoria_id: p.categoria_id || '',
              stock: p.stock,
              stock_minimo: p.stock_minimo,
              tipo_stock: p.tipo_stock || 'unidad',
              ubicacion_almacen: p.ubicacion_almacen || '',
              perecedero: p.perecedero ?? false,
            });
          }
        });
    }
  }

  guardar(): void {
    if (this.productoForm.invalid) return;

    const data = { ...this.productoForm.value };
    if (!data.categoria_id) delete data.categoria_id;
    if (!data.ubicacion_almacen) delete data.ubicacion_almacen;

    if (!this.isEditing) {
      this.platformService.crearProducto(data).subscribe({
        next: (resp) => {
          this.alert.success(resp.mensaje);
          this.router.navigateByUrl('/home/productos');
        },
        error: (err) => this.alert.error(err?.error?.message || 'Error al crear'),
      });
    } else {
      // En edición no enviamos stock (se modifica por movimientos)
      delete data.stock;
      this.platformService.actualizarProducto(this.id, data).subscribe({
        next: (resp) => {
          this.alert.success(resp.mensaje);
          this.router.navigateByUrl('/home/productos');
        },
        error: (err) => this.alert.error(err?.error?.message || 'Error al actualizar'),
      });
    }
  }

  async eliminarProducto(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este insumo?', 'Sí, eliminar')) return;
    this.platformService.eliminarProducto(this.id).subscribe({
      next: (resp) => {
        this.alert.success(resp.mensaje);
        this.router.navigateByUrl('/home/productos');
      },
      error: (err) => this.alert.error(err?.error?.message || 'Error al eliminar'),
    });
  }
}
