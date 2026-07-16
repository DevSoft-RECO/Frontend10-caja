<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="layoutStore.isSidebarOpen"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
      @click="layoutStore.closeSidebar"
    ></div>
  </Transition>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-none
           bg-gradient-to-b from-azul-cope to-[#0e2a45] dark:from-gray-900 dark:to-gray-950
           border-none"
    :class="[
      layoutStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      layoutStore.isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <div class="h-16 flex items-center justify-between px-6 shrink-0 bg-transparent border-none">

      <div v-if="!layoutStore.isCollapsed" class="flex items-center justify-center w-full fade-in">
        <img src="@/assets/logoyk1.svg" alt="YK" class="h-12 w-auto object-contain transition-all" />
      </div>

      <div v-else class="w-full flex justify-center fade-in">
        <img src="@/assets/yk.png" alt="YK" class="h-8 w-8 object-contain" />
      </div>

    </div>

    <nav
      class="flex-1 py-6 px-4 space-y-1.5 custom-scrollbar"
      :class="layoutStore.isCollapsed ? 'overflow-visible' : 'overflow-y-auto'"
    >
      <template v-for="item in menuItems" :key="item.id">

        <div v-if="!item.children" class="relative group">
            <RouterLink
            :to="item.route"
            @click="handleItemClick"
            class="flex items-center px-3.5 py-3 rounded-xl transition-all duration-250 group border-l-4"
            :class="[
                isActive(item.route)
                ? 'bg-white/10 dark:bg-gray-800/80 border-verde-cope text-white dark:text-verde-cope shadow-sm font-semibold'
                : 'border-transparent text-gray-300/90 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-850 hover:text-white dark:hover:text-gray-150',
                layoutStore.isCollapsed ? 'justify-center pl-0 border-l-0' : ''
            ]"
            >
                <span class="shrink-0 transition-colors duration-250"
                      :class="isActive(item.route) ? 'text-verde-cope' : 'group-hover:text-verde-cope'">
                    <svg v-html="item.iconSvg" class="w-5.5 h-5.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"></svg>
                </span>

                <span v-if="!layoutStore.isCollapsed" class="ml-3 text-xs tracking-wide">
                    {{ item.label }}
                </span>
            </RouterLink>

            <div
                v-if="layoutStore.isCollapsed"
                class="absolute left-full top-0 ml-2 px-3 py-2 bg-verde-cope text-white text-xs font-black rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none"
                style="width: max-content;"
            >
                {{ item.label }}
                <div class="absolute top-3 -left-1 w-2 h-2 bg-verde-cope transform rotate-45"></div>
            </div>
        </div>

        <div v-else class="relative group">
            <button
                @click="handleGroupClick(item.id)"
                class="w-full flex items-center px-3.5 py-3 rounded-xl transition-all duration-250 group border-l-4 border-transparent"
                :class="[
                    openGroups.includes(item.id) && !layoutStore.isCollapsed
                    ? 'bg-black/15 dark:bg-black/45 text-white dark:text-gray-100'
                    : 'text-gray-300/90 dark:text-gray-400 hover:bg-white/5 dark:hover:bg-gray-850 hover:text-white',
                    layoutStore.isCollapsed ? 'justify-center pl-0' : 'justify-between'
                ]"
            >
                <div class="flex items-center">
                    <span class="shrink-0 transition-colors" :class="openGroups.includes(item.id) ? 'text-verde-cope' : 'group-hover:text-verde-cope'">
                        <svg v-html="item.iconSvg" class="w-5.5 h-5.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"></svg>
                    </span>
                    <span v-if="!layoutStore.isCollapsed" class="ml-3 text-xs tracking-wide">{{ item.label }}</span>
                </div>

                <svg
                    v-if="!layoutStore.isCollapsed"
                    class="w-3.5 h-3.5 transition-transform duration-300"
                    :class="openGroups.includes(item.id) ? 'text-verde-cope rotate-180' : 'text-gray-450'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <!-- POP-OVER FLOTANTE (SOLO CUANDO COLAPSADO) -->
            <div
                v-if="layoutStore.isCollapsed"
                class="absolute left-full top-0 ml-4 w-64
                       bg-[#0d2740] dark:bg-gray-900
                       border-l-4 border-verde-cope
                       rounded-2xl shadow-2xl
                       opacity-0 invisible
                       group-hover:opacity-100 group-hover:visible
                       transition-all duration-300 ease-out
                       origin-top-left
                       group-hover:scale-100 scale-95
                       group-hover:translate-x-1
                       z-50"
            >
                 <div class="px-4 py-2.5 text-[10px] font-black text-verde-cope uppercase tracking-wider border-b border-white/10 dark:border-gray-800 mb-1">
                    {{ item.label }}
                 </div>

                 <RouterLink
                  v-for="child in item.children"
                  :key="child.route"
                  :to="child.route"
                  @click="handleItemClick"
                  class="block px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2.5"
                  :class="isActive(child.route)
                    ? 'bg-white/10 text-white font-bold shadow-xs'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="isActive(child.route) ? 'bg-verde-cope' : 'bg-gray-500'"></span>
                  {{ child.label }}
                </RouterLink>

                 <!-- Colita / Flecha apuntando al botón padre (Verde para efecto 'llave' { ) -->
                 <div
                   class="absolute left-0 top-5 -translate-x-1/2
                          w-2.5 h-2.5 bg-verde-cope
                          border-l border-b border-white/10
                          rotate-45"
                 ></div>
            </div>

            <!-- ACORDEÓN EXPANDIDO (SOLO CUANDO ESTÁ ABIERTO) -->
            <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
            >
                <div
                    v-if="openGroups.includes(item.id) && !layoutStore.isCollapsed"
                    class="mt-1.5 ml-3 space-y-1 relative border-l border-white/10 dark:border-gray-850"
                >


                    <RouterLink
                        v-for="child in item.children"
                        :key="child.route"
                        :to="child.route"
                        @click="handleItemClick"
                        class="relative group/child flex items-center gap-2.5 px-3.5 py-2 rounded-r-xl rounded-bl-xl ml-2.5 text-xs transition-all duration-200"
                        :class="isActive(child.route)
                            ? 'bg-verde-cope/10 text-verde-cope font-bold translate-x-1'
                            : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1'"
                    >
                         <!-- Indicador circular animado -->
                         <span
                            class="w-1 h-1 rounded-full transition-all duration-300 ring-2"
                            :class="isActive(child.route)
                                ? 'bg-verde-cope ring-verde-cope/30 scale-110'
                                : 'bg-gray-600 ring-transparent group-hover/child:bg-gray-400'"
                         ></span>

                         {{ child.label }}
                    </RouterLink>
                </div>
            </transition>
        </div>
      </template>
    </nav>

    <div class="p-4 mt-auto border-t border-white/5 dark:border-gray-850 shrink-0 bg-black/5 dark:bg-black/10">
        <div v-if="!layoutStore.isCollapsed" class="fade-in text-center">
            <p class="text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest mb-1">Desarrollado por</p>
            <p class="text-[10px] font-black text-white dark:text-gray-300 tracking-wider">
                Área de Informática <span class="text-verde-cope">2026</span>
            </p>
        </div>
        <div v-else class="flex justify-center fade-in">
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-verde-cope cursor-help transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
// import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const layoutStore = useLayoutStore()
// const authStore = useAuthStore()
const openGroups = ref<string[]>([])

// --- NUEVA FUNCIÓN PARA CERRAR EN MÓVIL ---
const handleItemClick = () => {
  if (window.innerWidth < 768) {
      layoutStore.closeSidebar()
  }
}



// Helper para verificar roles administrativos
// (Se usa dentro del computed para lógica dinámica)

const menuItems = computed(() => {

    /**
     * --- EJEMPLO DE GRUPO DINÁMICO (COMENTADO) ---
     * Este patrón asegura que el botón "Padre" del sidebar SOLO se muestre
     * si el usuario tiene permiso para ver al menos uno de sus hijos.
     */
    /*
    const ventasChildren = [
        // Hijo 1: Requiere permiso 'ver_reportes_ventas'
        ...(authStore.hasPermission('ver_reportes_ventas') ? [{
            label: 'Reportes de Ventas',
            route: '/admin/ventas/reportes'
        }] : []),

        // Hijo 2: Requiere Rol 'Gerente'
        ...(authStore.hasRole('Gerente') ? [{
            label: 'Configuración de Caja',
            route: '/admin/ventas/config'
        }] : [])
    ];
    */

    const items = [
        {
            id: 'home',
            label: 'Dashboard',
            route: '/admin/dashboard',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2v10a1 1 0 01-1 1h-3m-4 0h4" />',
            show: true
        },
        {
            id: 'mi-turno',
            label: 'Mi Turno',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
            show: true,
            children: [
                { label: 'Apertura de Caja', route: '/admin/movimientos/apertura' },
                { label: 'Movimientos', route: '/admin/movimientos/caja' },
                { label: 'Arqueo Parcial', route: '/admin/movimientos/arqueo' },
                { label: 'Reversiones de Caja', route: '/admin/movimientos/reversiones' },
                { label: 'Reporte de Descuadres', route: '/admin/movimientos/descuadres' }
            ]
        },
        {
            id: 'control-central',
            label: 'Control Central',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm6-10V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />',
            show: true,
            children: [
                { label: 'Dashboard General', route: '/admin/movimientos/dashboard-general' },
                { label: 'Dashboard General (Alt)', route: '/admin/movimientos/dashboard-general-alt' },
                { label: 'Autorizaciones de Apertura', route: '/admin/movimientos/autorizaciones' },
                { label: 'Autorizaciones de Movimientos', route: '/admin/movimientos/autorizaciones-movimientos' },
                { label: 'Autorizaciones de Reversiones', route: '/admin/movimientos/autorizaciones-reversiones' },
                { label: 'Cierre de Caja', route: '/admin/movimientos/cierre' },
                { label: 'Historial de Cierres', route: '/admin/movimientos/reporte-cierres' },
                { label: 'Historial de Movimientos', route: '/admin/movimientos' }
            ]
        },
        {
            id: 'operaciones-adicionales',
            label: 'Operaciones Adicionales',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />',
            show: true,
            children: [
                { label: 'Traslado entre Bóvedas', route: '/admin/movimientos/traslado-bovedas' },
                { label: 'Autorización de Traslados', route: '/admin/movimientos/autorizaciones-traslados' },
                { label: 'Operación Bancos Externos', route: '/admin/movimientos/bancos' }
            ]
        },
        {
            id: 'configuracion',
            label: 'Configuración',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />',
            show: true,
            children: [
                { label: 'Denominaciones', route: '/admin/ajustes/denominaciones' },
                { label: 'Cajas', route: '/admin/ajustes/cajas' },
                { label: 'Inicialización Día Cero', route: '/admin/ajustes/dia-cero' }
            ]
        },

        /*
        // --- CONTINUACIÓN EJEMPLO GRUPO DINÁMICO ---
        {
            id: 'modulo-ventas',
            label: 'Módulo de Ventas',
            iconSvg: '<path ... />', // Tu SVG aquí
            // MAGIA AQUÍ: show depende de si `ventasChildren` tiene elementos
            show: ventasChildren.length > 0,
            children: ventasChildren
        }
        */
    ]

    return items.filter(item => item.show)
})

const isActive = (path: string) => route.path === path

const handleGroupClick = (id: string) => {
    if (layoutStore.isCollapsed) return
    if (openGroups.value.includes(id)) {
        openGroups.value = []
    } else {
        openGroups.value = [id]
    }
}
</script>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); border-radius: 20px; }
</style>
