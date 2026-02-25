import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformService } from '../../services/platform.service';
import { AlertService } from '../../services/alert.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Categoria, Producto, RecetaInsumo } from '../../../shared/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { CategoriasDialogComponent } from '../categorias-dialog/categorias-dialog.component';

interface AreaOption {
  codigo: string;
  nombre: string;
  icono: string;
}

@Component({
  selector: 'app-agregar-plato',
  templateUrl: './agregar-plato.component.html',
  styleUrls: ['./agregar-plato.component.css']
})
export class AgregarPlatoComponent implements OnInit {

  platoFormulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    area: ['', [Validators.required]],
    categoria_id: ['', [Validators.required]],
    descripcion: [''],
    precio_venta: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    imagen_url: [''],
    controla_stock: [false],
  });

  id = '';
  urlImagen = '';
  subiendoImagen = false;
  areas: AreaOption[] = [];
  categorias: Categoria[] = [];
  isEditing = false;

  // ── Receta ──
  productosDisponibles: Producto[] = [];
  receta: RecetaInsumo[] = [];
  guardandoReceta = false;

  constructor(
    private fb: FormBuilder,
    private platformService: PlatformService,
    private alert: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.cargarCategoria();
    this.loadAreas();
    this.platformService.getProductos().subscribe(p => this.productosDisponibles = p);

    if (this.router.url.includes('editar-plato')) {
      this.isEditing = true;
      this.activatedRoute.params
        .pipe(
          switchMap(({ id }) => {
            this.id = id;
            return this.platformService.getPlato(id);
          })
        )
        .subscribe(plato => {
          this.platoFormulario.patchValue({
            nombre: plato.nombre,
            area: plato.area,
            categoria_id: plato.categoria_id,
            descripcion: plato.descripcion,
            precio_venta: plato.precio_venta,
            imagen_url: plato.imagen_url,
            controla_stock: plato.controla_stock ?? false,
          });
          this.urlImagen = plato.imagen_url || '';

          // Cargar receta si edita
          this.platformService.getReceta(this.id).subscribe(r => this.receta = r);
        });
    }

    this.urlImagen = this.platoFormulario.get('imagen_url')?.value || '';
    this.platoFormulario.get('imagen_url')?.valueChanges.subscribe(value => {
      this.urlImagen = value || '';
    });
  }

  private loadAreas(): void {
    this.http.get<AreaOption[]>(`${environment.baseUrl}/auth/areas`)
      .subscribe({
        next: (areas) => { this.areas = areas; },
        error: () => {
          this.areas = [
            { codigo: 'cocina', nombre: 'Cocina', icono: 'soup_kitchen' },
            { codigo: 'bar', nombre: 'Bar', icono: 'local_bar' },
          ];
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.subirArchivo(input.files[0]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!event.dataTransfer?.files?.length) return;
    this.subirArchivo(event.dataTransfer.files[0]);
  }

  private subirArchivo(file: File): void {
    const reader = new FileReader();
    reader.onload = () => this.urlImagen = reader.result as string;
    reader.readAsDataURL(file);

    this.subiendoImagen = true;
    this.platformService.subirImagen(file, 'platos').subscribe({
      next: (resp) => {
        this.platoFormulario.get('imagen_url')?.setValue(resp.url);
        this.urlImagen = resp.url;
        this.subiendoImagen = false;
      },
      error: () => {
        this.subiendoImagen = false;
        this.alert.error('Error al subir la imagen');
      }
    });
  }

  cargarCategoria(): void {
    this.platformService.getCategorias().subscribe(cats => this.categorias = cats);
  }

  nuevaCategoria(): void {
    const currentCatId = this.platoFormulario.get('categoria_id')?.value;
    const dialogRef = this.dialog.open(CategoriasDialogComponent, {
      width: '480px',
      panelClass: 'dialog-glass',
      data: { selectedId: currentCatId }
    });
    dialogRef.afterClosed().subscribe(selectedId => {
      if (selectedId) {
        this.cargarCategoria();
        this.platoFormulario.get('categoria_id')?.setValue(selectedId);
      }
    });
  }

  agregarPlato(): void {
    const data = this.platoFormulario.value;

    if (!this.isEditing) {
      this.platformService.crearPlato(data).subscribe(resp => {
        if (this.alert.handleResponse(resp)) this.router.navigateByUrl('/home/carta');
      });
    } else {
      this.platformService.actualizarPlato(this.id, data).subscribe(resp => {
        if (this.alert.handleResponse(resp)) this.router.navigateByUrl('/home/carta');
      });
    }
  }

  async eliminarPlato(): Promise<void> {
    if (!await this.alert.confirm('¿Estás seguro de eliminar este plato?', 'Sí, eliminar')) return;
    this.platformService.eliminarPlato(this.id).subscribe(resp => {
      this.alert.success(resp.mensaje);
      this.router.navigateByUrl('/home/carta');
    });
  }

  // ═══ RECETA ═══

  /** Productos no usados aún en la receta */
  get productosNoEnReceta(): Producto[] {
    const usedIds = new Set(this.receta.map(r => r.producto_id));
    return this.productosDisponibles.filter(p => !usedIds.has(p.id));
  }

  async agregarInsumo(): Promise<void> {
    if (!this.productosNoEnReceta.length) {
      this.alert.info('Todos los insumos ya están en la receta');
      return;
    }

    const options = this.productosNoEnReceta
      .reduce((acc, p) => { acc[p.id] = `${p.nombre} (${p.tipo_stock || 'und'})`; return acc; }, {} as Record<string, string>);

    const { value: formValues } = await this.alert.fire({
      title: 'Agregar insumo a la receta',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:12px; font-weight:600; color:#64748b;">Insumo *</label>
            <select id="swal-prod" class="swal2-input" style="margin:0; margin-top:4px;">
              ${Object.entries(options).map(([id, name]) => `<option value="${id}">${name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#64748b;">Cantidad por unidad del plato *</label>
            <input id="swal-cant" class="swal2-input" type="number" placeholder="Ej: 0.200" min="0.0001" step="0.0001" style="margin:0; margin-top:4px;">
            <p style="font-size:11px; color:#94a3b8; margin:4px 0 0 0;">Cuánto de este insumo se consume al vender 1 unidad del plato</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0891B2',
      preConfirm: () => {
        const cant = +(document.getElementById('swal-cant') as HTMLInputElement).value;
        if (!cant || cant <= 0) { this.alert.showValidationMessage('Cantidad inválida'); return; }
        return {
          producto_id: (document.getElementById('swal-prod') as HTMLSelectElement).value,
          cantidad: cant,
        };
      },
    });

    if (!formValues) return;

    // Agregar localmente y guardar
    const producto = this.productosDisponibles.find(p => p.id === formValues.producto_id);
    this.receta.push({
      id: 'temp-' + Date.now(),
      plato_id: this.id,
      producto_id: formValues.producto_id,
      producto,
      cantidad: formValues.cantidad,
      created_at: new Date().toISOString(),
    } as RecetaInsumo);

    this.guardarReceta();
  }

  eliminarInsumo(index: number): void {
    this.receta.splice(index, 1);
    this.guardarReceta();
  }

  guardarReceta(): void {
    if (!this.id) return;

    this.guardandoReceta = true;
    const insumos = this.receta.map(r => ({
      producto_id: r.producto_id,
      cantidad: r.cantidad,
    }));

    this.platformService.setReceta(this.id, insumos).subscribe({
      next: () => {
        this.guardandoReceta = false;
        // Actualizar controla_stock en el form si hay insumos
        if (insumos.length > 0) {
          this.platoFormulario.patchValue({ controla_stock: true });
        }
      },
      error: () => { this.guardandoReceta = false; }
    });
  }
}
