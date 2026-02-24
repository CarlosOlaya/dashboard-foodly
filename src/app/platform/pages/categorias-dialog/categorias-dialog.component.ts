import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlatformService } from '../../services/platform.service';
import { Categoria } from '../../../auth/interfaces/interfaces';
import { AlertService } from '../../services/alert.service';

@Component({
    selector: 'app-categorias-dialog',
    templateUrl: './categorias-dialog.component.html',
    styleUrls: ['./categorias-dialog.component.css']
})
export class CategoriasDialogComponent implements OnInit {

    categorias: Categoria[] = [];
    nuevaCat = '';
    loading = false;
    selectedId: string | null = null;
    editingId: string | null = null;
    editingNombre = '';

    constructor(
        private platformService: PlatformService,
        public dialogRef: MatDialogRef<CategoriasDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private alert: AlertService,
    ) {
        this.selectedId = data?.selectedId || null;
    }

    ngOnInit(): void {
        this.cargarCategorias();
    }

    cargarCategorias(): void {
        this.platformService.getCategorias().subscribe({
            next: cats => { this.categorias = cats; }
        });
    }

    agregar(): void {
        const nombre = this.nuevaCat.trim();
        if (!nombre) return;

        this.loading = true;
        this.platformService.crearCategoria(nombre).subscribe({
            next: (resp: any) => {
                this.loading = false;
                this.nuevaCat = '';
                this.cargarCategorias();

                const newCat = resp.data || resp;
                if (newCat?.id) {
                    this.selectedId = newCat.id;
                }

                this.alert.success('Categoría creada', 1200);
            },
            error: () => {
                this.loading = false;
                this.alert.error('Error al crear la categoría');
            }
        });
    }

    // ── Edit ──
    startEdit(cat: Categoria, event: Event): void {
        event.stopPropagation();
        this.editingId = cat.id;
        this.editingNombre = cat.nombre;
    }

    cancelEdit(): void {
        this.editingId = null;
        this.editingNombre = '';
    }

    saveEdit(cat: Categoria): void {
        const nombre = this.editingNombre.trim();
        if (!nombre || nombre === cat.nombre) {
            this.cancelEdit();
            return;
        }

        this.platformService.actualizarCategoria(cat.id, nombre).subscribe({
            next: () => {
                this.editingId = null;
                this.editingNombre = '';
                this.cargarCategorias();
                this.alert.success('Categoría actualizada', 1000);
            },
            error: () => {
                this.alert.error('Error al actualizar');
            }
        });
    }

    // ── Delete ──
    async deleteCat(cat: Categoria, event: Event): Promise<void> {
        event.stopPropagation();
        if (!await this.alert.confirm(`¿Eliminar la categoría "${cat.nombre}"?`, 'Sí, eliminar')) return;

        this.platformService.eliminarCategoria(cat.id).subscribe({
            next: (resp: any) => {
                if (resp.ok) {
                    if (this.selectedId === cat.id) this.selectedId = null;
                    this.cargarCategorias();
                    this.alert.success(resp.mensaje, 1200);
                } else {
                    this.alert.fire({ icon: 'info', title: 'No se puede eliminar', text: resp.mensaje, confirmButtonText: 'Entendido' });
                }
            },
            error: () => {
                this.alert.error('Error al eliminar');
            }
        });
    }

    seleccionar(cat: Categoria): void {
        if (this.editingId) return;
        this.selectedId = cat.id;
    }

    confirmar(): void {
        this.dialogRef.close(this.selectedId);
    }

    cerrar(): void {
        this.dialogRef.close(null);
    }
}
