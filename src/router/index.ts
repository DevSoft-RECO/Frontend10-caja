import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'

// Vistas
import CallbackView from '@/views/CallbackView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'

const routes: RouteRecordRaw[] = [
    // 1. RUTAS PÚBLICAS
    {
        path: '/',
        redirect: '/admin/dashboard'
    },
    {
        path: '/callback',
        name: 'callback',
        component: CallbackView
    },
    {
        path: '/unauthorized',
        name: 'unauthorized',
        component: UnauthorizedView
    },

    // 2. RUTAS PROTEGIDAS
    {
        path: '/admin',
        component: AdminLayout,
        meta: {
            requiresAuth: true,
            permission: 'app_tesoreria'
        },
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: DashboardView,
                meta: {
                    title: 'Dashboard'
                }
            },
            {
                path: 'ajustes/denominaciones',
                name: 'denominaciones',
                component: () => import('@/views/ajustes/DenominacionesView.vue'),
                meta: {
                    title: 'Denominaciones',
                    role: 'Super Admin'
                }
            },
            {
                path: 'ajustes/cajas',
                name: 'cajas',
                component: () => import('@/views/ajustes/CajasView.vue'),
                meta: {
                    title: 'Cajas'
                }
            },
            {
                path: 'ajustes/dia-cero',
                name: 'dia-cero',
                component: () => import('@/views/ajustes/DiaCeroView.vue'),
                meta: {
                    title: 'Inicialización Día Cero'
                }
            },
            {
                path: 'movimientos',
                name: 'movimientos',
                component: () => import('@/views/movimientos/MovimientosView.vue'),
                meta: {
                    title: 'Movimientos de Efectivo'
                }
            },
            {
                path: 'movimientos/arqueo',
                name: 'arqueo',
                component: () => import('@/views/movimientos/ArqueoParcialView.vue'),
                meta: {
                    title: 'Arqueo Parcial de Caja'
                }
            },
            {
                path: 'movimientos/cierre',
                name: 'cierre',
                component: () => import('@/views/movimientos/CierreJornadaView.vue'),
                meta: {
                    title: 'Cierre de Jornada'
                }
            },
            {
                path: 'movimientos/apertura',
                name: 'apertura',
                component: () => import('@/views/movimientos/AperturaCajaView.vue'),
                meta: {
                    title: 'Apertura de Caja'
                }
            },
            {
                path: 'movimientos/caja',
                name: 'movimientos-caja',
                component: () => import('@/views/movimientos/MovimientosCajaView.vue'),
                meta: {
                    title: 'Movimientos de Caja'
                }
            },
            {
                path: 'movimientos/reporte-cierres',
                name: 'reporte-cierres',
                component: () => import('@/views/movimientos/ReporteCierresView.vue'),
                meta: {
                    title: 'Reporte de Cierres'
                }
            },
            {
                path: 'movimientos/autorizaciones',
                name: 'autorizaciones-apertura',
                component: () => import('@/views/movimientos/AutorizacionesAperturaView.vue'),
                meta: {
                    title: 'Autorizaciones de Apertura'
                }
            },
            {
                path: 'movimientos/autorizaciones-movimientos',
                name: 'autorizaciones-movimientos',
                component: () => import('@/views/movimientos/AutorizacionesMovimientosView.vue'),
                meta: {
                    title: 'Autorizaciones de Movimientos'
                }
            },

            {
                path: 'movimientos/dashboard-general-alt',
                name: 'dashboard-general-alt',
                component: () => import('@/views/movimientos/DashboardGeneralAlternateView.vue'),
                meta: {
                    title: 'Dashboard Consolidado (Alternativo)'
                }
            },
            {
                path: 'dashboard',
                name: 'dashboard',
                component: DashboardView,
                meta: {
                    title: 'Dashboard',
                    permission: 'dashboard_general_caja'
                }
            },
            {
                path: 'ajustes/denominaciones',
                name: 'denominaciones',
                component: () => import('@/views/ajustes/DenominacionesView.vue'),
                meta: {
                    title: 'Denominaciones',
                    role: 'Super Admin'
                }
            },
            {
                path: 'ajustes/cajas',
                name: 'cajas',
                component: () => import('@/views/ajustes/CajasView.vue'),
                meta: {
                    title: 'Cajas',
                    permission: 'configuracion_caja'
                }
            },
            {
                path: 'ajustes/dia-cero',
                name: 'dia-cero',
                component: () => import('@/views/ajustes/DiaCeroView.vue'),
                meta: {
                    title: 'Inicialización Día Cero',
                    permission: 'configuracion_caja'
                }
            },
            {
                path: 'movimientos',
                name: 'movimientos',
                component: () => import('@/views/movimientos/MovimientosView.vue'),
                meta: {
                    title: 'Movimientos de Efectivo',
                    permission: 'monitoreo_caja'
                }
            },
            {
                path: 'movimientos/arqueo',
                name: 'arqueo',
                component: () => import('@/views/movimientos/ArqueoParcialView.vue'),
                meta: {
                    title: 'Arqueo Parcial de Caja',
                    permission: 'cajeros'
                }
            },
            {
                path: 'movimientos/cierre',
                name: 'cierre',
                component: () => import('@/views/movimientos/CierreJornadaView.vue'),
                meta: {
                    title: 'Cierre de Jornada',
                    permission: 'monitoreo_caja'
                }
            },
            {
                path: 'movimientos/apertura',
                name: 'apertura',
                component: () => import('@/views/movimientos/AperturaCajaView.vue'),
                meta: {
                    title: 'Apertura de Caja',
                    permission: 'cajeros'
                }
            },
            {
                path: 'movimientos/caja',
                name: 'movimientos-caja',
                component: () => import('@/views/movimientos/MovimientosCajaView.vue'),
                meta: {
                    title: 'Movimientos de Caja',
                    permission: 'cajeros'
                }
            },
            {
                path: 'movimientos/reporte-cierres',
                name: 'reporte-cierres',
                component: () => import('@/views/movimientos/ReporteCierresView.vue'),
                meta: {
                    title: 'Reporte de Cierres',
                    permission: 'monitoreo_caja'
                }
            },
            {
                path: 'movimientos/autorizaciones',
                name: 'autorizaciones-apertura',
                component: () => import('@/views/movimientos/AutorizacionesAperturaView.vue'),
                meta: {
                    title: 'Autorizaciones de Apertura',
                    permission: 'monitoreo_caja'
                }
            },
            {
                path: 'movimientos/autorizaciones-movimientos',
                name: 'autorizaciones-movimientos',
                component: () => import('@/views/movimientos/AutorizacionesMovimientosView.vue'),
                meta: {
                    title: 'Autorizaciones de Movimientos',
                    permission: 'monitoreo_caja'
                }
            },

            {
                path: 'movimientos/dashboard-general-alt',
                name: 'dashboard-general-alt',
                component: () => import('@/views/movimientos/DashboardGeneralAlternateView.vue'),
                meta: {
                    title: 'Dashboard Consolidado (Alternativo)',
                    permission: 'monitoreo_caja'
                }
            },
            {
                path: 'movimientos/traslado-bovedas',
                name: 'traslado-bovedas',
                component: () => import('@/views/movimientos/TrasladoBovedasView.vue'),
                meta: {
                    title: 'Traslado entre Bóvedas',
                    permission: 'operaciones_adicionales'
                }
            },
            {
                path: 'movimientos/autorizaciones-traslados',
                name: 'autorizaciones-traslados',
                component: () => import('@/views/movimientos/AutorizacionesTrasladosView.vue'),
                meta: {
                    title: 'Bandeja de Traslados Entrantes',
                    permission: 'autorizaciones'
                }
            },
            {
                path: 'movimientos/bancos',
                name: 'bancos-operaciones',
                component: () => import('@/views/movimientos/BancosOperacionesView.vue'),
                meta: {
                    title: 'Operación Bancos Externos',
                    permission: 'operaciones_adicionales'
                }
            },
            {
                path: 'movimientos/reversiones',
                name: 'reversiones-caja',
                component: () => import('@/views/movimientos/ReversionesCreadorView.vue'),
                meta: {
                    title: 'Reversiones de Caja',
                    permission: 'reversion_caja'
                }
            },
            {
                path: 'movimientos/autorizaciones-reversiones',
                name: 'autorizaciones-reversiones',
                component: () => import('@/views/movimientos/ReversionesAutorizacionView.vue'),
                meta: {
                    title: 'Autorizaciones de Reversiones',
                    permission: 'autorizaciones'
                }
            },
            {
                path: 'movimientos/descuadres',
                name: 'descuadres-agencia',
                component: () => import('@/views/movimientos/DescuadresAgenciaView.vue'),
                meta: {
                    title: 'Reporte de Descuadres de Agencia',
                    permission: 'reporte_descuadres'
                }
            }
        ]
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const orderedRoutes = [
    { path: '/admin/dashboard', permission: 'dashboard_general_caja' },
    { path: '/admin/movimientos/apertura', permission: 'cajeros' },
    { path: '/admin/movimientos/caja', permission: 'cajeros' },
    { path: '/admin/movimientos/arqueo', permission: 'cajeros' },
    { path: '/admin/movimientos/reversiones', permission: 'reversion_caja' },
    { path: '/admin/movimientos/descuadres', permission: 'reporte_descuadres' },

    { path: '/admin/movimientos/dashboard-general-alt', permission: 'monitoreo_caja' },
    { path: '/admin/movimientos/autorizaciones', permission: 'monitoreo_caja' },
    { path: '/admin/movimientos/autorizaciones-movimientos', permission: 'monitoreo_caja' },
    { path: '/admin/movimientos/cierre', permission: 'monitoreo_caja' },
    { path: '/admin/movimientos/reporte-cierres', permission: 'monitoreo_caja' },
    { path: '/admin/movimientos', permission: 'monitoreo_caja' },
    { path: '/admin/movimientos/autorizaciones-reversiones', permission: 'autorizaciones' },
    { path: '/admin/movimientos/autorizaciones-traslados', permission: 'autorizaciones' },
    { path: '/admin/movimientos/traslado-bovedas', permission: 'operaciones_adicionales' },
    { path: '/admin/movimientos/bancos', permission: 'operaciones_adicionales' },
    { path: '/admin/ajustes/denominaciones', role: 'Super Admin' },
    { path: '/admin/ajustes/cajas', permission: 'configuracion_caja' },
    { path: '/admin/ajustes/dia-cero', permission: 'configuracion_caja' }
]

function findFirstAllowedRoute(authStore: any): string | null {
    for (const item of orderedRoutes) {
        if (item.role && authStore.hasRole(item.role)) {
            return item.path
        }
        if (item.permission && authStore.hasPermission(item.permission)) {
            return item.path
        }
    }
    return null
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// --- GUARDIA DE NAVEGACIÓN ---
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // 0. Callback o Unauthorized → siempre pasar
    if (to.name === 'callback' || to.name === 'unauthorized') {
        return next()
    }

    const isAuthenticated = !!authStore.token

    // Caso 1: Ruta requiere Auth y no tenemos token
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            console.log('🔒 Acceso Hija: Usuario sin sesión. Iniciando flujo SSO...')
            authStore.login(to.fullPath); // Guardar URL original
            return next(false);
        }
    }

    // Caso 2: Estamos autenticados, verificar identidad
    if (isAuthenticated) {
        if (!authStore.isReady || !authStore.user) {
            try {
                await authStore.fetchUser();
            } catch {
                // RE-AUTENTICACIÓN FLUIDA: 
                // Si el token falló, intentamos PKCE de nuevo
                authStore.login(to.fullPath);
                return next(false);
            }
        }

        // Redirección si se entra al dashboard pero no se tiene permiso para él
        if (to.path === '/admin/dashboard' || to.path === '/admin') {
            if (!authStore.hasPermission('dashboard_general_caja')) {
                // Buscar la primera ruta a la que sí se tiene permiso
                const firstAllowed = findFirstAllowedRoute(authStore)
                if (firstAllowed) {
                    console.log(`🔀 Redireccionando a la primera vista permitida: ${firstAllowed}`)
                    return next(firstAllowed)
                } else {
                    // Si no tiene permisos para absolutamente nada
                    console.warn('⛔ Acceso denegado: El usuario no tiene ningún permiso configurado.')
                    const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
                    window.location.href = `${motherAppUrl}/apps`
                    return next(false)
                }
            }
        }

        // Verificar rol
        if (to.meta.role && !authStore.hasRole(to.meta.role as string)) {
            const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
            console.warn(`⛔ Acceso denegado: Falta rol '${to.meta.role}'.`)
            window.location.href = `${motherAppUrl}/apps`
            return next(false)
        }

        // Verificar permiso
        if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
            const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
            console.warn(`⛔ Acceso denegado: Falta permiso '${to.meta.permission}'.`)
            window.location.href = `${motherAppUrl}/apps`
            return next(false)
        }
    }

    next()
})


export default router
