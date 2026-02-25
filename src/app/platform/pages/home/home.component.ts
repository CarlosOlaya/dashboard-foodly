import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService, StockNotification } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import { ArqueoComponent } from '../arqueo/arqueo.component';
import { EmpresaComponent } from '../empresa/empresa.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  currentRoute = '';
  showNotifPanel = false;
  showMoreMenu = false;
  showProfileMenu = false;
  notifications: StockNotification[] = [];
  unreadCount = 0;
  toasts: StockNotification[] = [];
  private subs: Subscription[] = [];
  activeChild: ArqueoComponent | EmpresaComponent | null = null;

  get isArqueo(): boolean {
    return this.currentRoute.includes('/arqueo');
  }

  get arqueoComponent(): ArqueoComponent | null {
    return this.activeChild instanceof ArqueoComponent ? this.activeChild : null;
  }

  get usuario() { return this.authService.usuario; }

  get isEmpresa(): boolean {
    return this.currentRoute.includes('/empresa');
  }

  get empresaComponent(): EmpresaComponent | null {
    return this.activeChild instanceof EmpresaComponent ? this.activeChild : null;
  }

  // ── Hero item (admin only) ──
  navDashboard: NavItem = { label: 'Dashboard', icon: 'analytics', route: './finanzas' };

  // ── Operaciones — mesero, bartender, cocinero, cajero, admin ──
  navOperaciones: NavItem[] = [
    { label: 'Mesas', icon: 'table_bar', route: './mesas' },
    { label: 'Comandas', icon: 'restaurant', route: './comandas' },
    { label: 'Carta', icon: 'menu_book', route: './carta' },
  ];

  // ── Finanzas — cajero, admin ──
  navFinanzas: NavItem[] = [
    { label: 'Facturación', icon: 'receipt_long', route: './facturacion' },
    { label: 'Arqueo', icon: 'point_of_sale', route: './arqueo' },
  ];

  // ── Gestión — admin only ──
  navGestion: NavItem[] = [
    { label: 'Clientes', icon: 'groups', route: './clientes' },
    { label: 'Proveedores', icon: 'local_shipping', route: './proveedores' },
    { label: 'Empleados', icon: 'badge', route: './empleados' },
    { label: 'Inventario', icon: 'inventory_2', route: './productos' },
  ];

  // ── Configuración — admin only ──
  navConfig: NavItem[] = [
    { label: 'Empresa', icon: 'business', route: './empresa' },
  ];

  // ── Role helpers ──
  get isAdmin(): boolean { return this.authService.isAdmin; }

  get isCajero(): boolean {
    return this._rol === 'cajero';
  }

  get canSeeFinanzas(): boolean {
    return this.isAdmin || this.isCajero;
  }

  private get _rol(): string {
    return this.authService.usuario?.rol || '';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    public notifService: NotificationService,
    private alert: AlertService,
  ) { }

  bgAnimatedUrl = '';

  ngOnInit(): void {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentRoute = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
      // Close mobile menus on navigation
      this.showMoreMenu = false;
      this.showProfileMenu = false;
    });
    this.currentRoute = this.router.url;

    // Start WebSocket notifications for admins
    if (this.isAdmin) {
      this.notifService.start(this.usuario.tenant_id);

      // Sync sidebar badge with unread count
      this.subs.push(
        this.notifService.unreadCount$.subscribe(count => {
          this.unreadCount = count;
          const inv = this.navGestion.find(n => n.label === 'Inventario');
          if (inv) inv.badge = count || undefined;
        }),
        this.notifService.notifications$.subscribe(notifs => {
          this.notifications = notifs;
        }),
        // Toast for brand-new alerts
        this.notifService.newAlert$.subscribe(notif => {
          this.toasts.push(notif);
          // Auto-dismiss after 6s
          setTimeout(() => {
            this.toasts = this.toasts.filter(t => t.id !== notif.id);
          }, 6000);
        }),
      );
    }
  }

  isActive(route: string): boolean {
    const clean = route.replace('./', '/home/');
    return this.currentRoute.includes(clean);
  }

  get isServicio(): boolean {
    return this.currentRoute.includes('/servicio_mesa/');
  }

  get currentPageTitle(): string {
    const routeMap: Record<string, string> = {
      '/mesas': 'Mesas',
      '/comandas': 'Comandas',
      '/carta': 'Carta',
      '/facturacion': 'Cobros',
      '/arqueo': 'Arqueo',
      '/finanzas': 'Dashboard',
      '/clientes': 'Clientes',
      '/proveedores': 'Proveedores',
      '/empleados': 'Empleados',
      '/productos': 'Inventario',
      '/empresa': 'Empresa',
      '/cliente/': 'Cliente',
      '/empleado/': 'Empleado',
      '/factura/': 'Factura',
    };
    for (const [key, title] of Object.entries(routeMap)) {
      if (this.currentRoute.includes(key)) return title;
    }
    return 'Foodly';
  }

  /** Action button config for the mobile header, based on current route */
  get currentPageAction(): { icon: string; label: string; route?: string } | null {
    if (!this.isAdmin) return null;
    const actionMap: Record<string, { icon: string; label: string; route?: string }> = {
      '/carta': { icon: 'add', label: 'Nuevo', route: '/home/agregar-plato' },
      '/empleados': { icon: 'add', label: 'Nuevo', route: '/home/agregar-empleado' },
      '/proveedores': { icon: 'add', label: 'Nuevo', route: '/home/agregar-proveedor' },
      '/clientes': { icon: 'add', label: 'Nuevo', route: '/home/agregar-cliente' },
      '/productos': { icon: 'add', label: 'Nuevo', route: '/home/agregar-producto' },
    };
    for (const [key, action] of Object.entries(actionMap)) {
      if (this.currentRoute.includes(key)) return action;
    }
    return null;
  }

  // ── Notification panel ──
  toggleNotifPanel(): void {
    this.showNotifPanel = !this.showNotifPanel;
    if (this.showNotifPanel) {
      this.notifService.markAllAsRead();
    }
  }

  dismissToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  // ── Mobile bottom sheet menus ──
  toggleMoreMenu(): void {
    this.showMoreMenu = !this.showMoreMenu;
    this.showProfileMenu = false;
    this.showNotifPanel = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showMoreMenu = false;
    this.showNotifPanel = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper') && !target.closest('.mobile-notif-btn')) {
      this.showNotifPanel = false;
    }
  }

  async logout(): Promise<void> {
    const confirmed = await this.alert.confirm(
      'Se cerrará tu sesión actual en este dispositivo.',
      'Sí, salir',
    );
    if (confirmed) {
      this.authService.logout();
      this.router.navigateByUrl('/auth');
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.notifService.stop();
  }
}

