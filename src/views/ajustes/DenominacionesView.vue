<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Denominaciones de Efectivo
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Administra los billetes y monedas legales disponibles para las operaciones de cajas de la agencia.
        </p>
      </div>
      
      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center px-4 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-verde-cope/50 gap-2 text-sm cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Denominación
      </button>
    </div>

    <!-- Filtros y Estado -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2">Filtrar:</span>
        <button
          @click="filterTipo = 'todos'"
          class="px-4 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          :class="filterTipo === 'todos' ? 'bg-azul-cope text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/55 text-gray-600 dark:text-gray-300 hover:bg-gray-205 dark:hover:bg-gray-700'"
        >
          Todos
        </button>
        <button
          @click="filterTipo = 'billete'"
          class="px-4 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          :class="filterTipo === 'billete' ? 'bg-azul-cope text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/55 text-gray-600 dark:text-gray-300 hover:bg-gray-205 dark:hover:bg-gray-700'"
        >
          Billetes
        </button>
        <button
          @click="filterTipo = 'moneda'"
          class="px-4 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer"
          :class="filterTipo === 'moneda' ? 'bg-azul-cope text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700/55 text-gray-600 dark:text-gray-300 hover:bg-gray-205 dark:hover:bg-gray-700'"
        >
          Monedas
        </button>
      </div>

      <div class="flex items-center gap-4 justify-between sm:justify-end">
        <!-- View Toggle -->
        <div class="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-900/60">
          <button
            @click="viewMode = 'grid'"
            class="px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-azul-cope dark:text-white shadow-sm' : 'text-gray-450 hover:text-gray-600 dark:hover:text-gray-305'"
            title="Vista Cuadrícula"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Visual
          </button>
          <button
            @click="viewMode = 'table'"
            class="px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            :class="viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-azul-cope dark:text-white shadow-sm' : 'text-gray-450 hover:text-gray-600 dark:hover:text-gray-305'"
            title="Vista Tabla"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Tabla
          </button>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400">
          Total: <span class="font-bold text-gray-800 dark:text-white">{{ filteredDenominaciones.length }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Cargando denominaciones...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5 flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
      <div class="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-red-800 dark:text-red-300">Error al cargar datos</h3>
        <p class="text-xs text-red-700 dark:text-red-400 mt-1">{{ error }}</p>
        <button
          @click="fetchDenominaciones"
          class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-800 dark:text-red-300 hover:underline cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
          </svg>
          Reintentar
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredDenominaciones.length === 0" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm max-w-lg mx-auto">
      <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-400 dark:text-gray-600">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800 dark:text-white">No hay denominaciones registradas</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Crea las denominaciones (billetes y monedas) para comenzar a utilizar el sistema de flujo de efectivo.
      </p>
      <button
        @click="openCreateModal"
        class="mt-6 inline-flex items-center justify-center px-4 py-2 bg-azul-cope hover:bg-azul-cope/90 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        Agregar Denominación
      </button>
    </div>

    <!-- GRID VIEW (Visual Cards) -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="denominacion in filteredDenominaciones"
        :key="denominacion.id"
        class="group relative bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        :class="denominacion.activo ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200/60 dark:border-gray-800/60 opacity-70'"
      >
        <!-- Background Cash Watermark/Gradient -->
        <div 
          v-if="denominacion.tipo === 'billete'"
          class="absolute -right-6 -bottom-6 w-32 h-32 rounded-full pointer-events-none opacity-5 dark:opacity-10 transition-transform duration-500 group-hover:scale-110"
          :style="{ background: 'radial-gradient(circle, var(--color-verde-cope) 0%, transparent 70%)' }"
        ></div>
        <div 
          v-else
          class="absolute -right-6 -bottom-6 w-32 h-32 rounded-full pointer-events-none opacity-5 dark:opacity-10 transition-transform duration-500 group-hover:scale-110"
          :style="{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }"
        ></div>

        <!-- Upper Row: Type indicator and active toggle badge -->
        <div class="flex items-center justify-between mb-4 z-10">
          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border"
            :class="
              denominacion.tipo === 'billete'
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-250/50 dark:border-emerald-800/30'
                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-250/50 dark:border-amber-800/30'
            "
          >
            <!-- Custom mini icons -->
            <svg v-if="denominacion.tipo === 'billete'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ capitalize(denominacion.tipo) }}
          </span>

          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            :class="
              denominacion.activo
                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            "
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="denominacion.activo ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"></span>
            {{ denominacion.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <!-- Middle Row: Realistic Cash representation -->
        <div class="my-3 flex justify-center py-4 z-10">
          <!-- Billete Premium Card View -->
          <div
            v-if="denominacion.tipo === 'billete'"
            class="relative w-52 h-28 rounded-xl shadow-md border flex flex-col justify-between p-3 overflow-hidden select-none bg-gradient-to-br transition-all duration-300 group-hover:shadow-lg"
            :class="
              denominacion.activo
                ? 'from-emerald-500/10 via-emerald-600/5 to-teal-500/20 border-emerald-300/40 dark:from-emerald-950/40 dark:to-teal-900/30 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                : 'from-gray-100 to-gray-200 border-gray-300 dark:from-gray-800 dark:to-gray-900 dark:border-gray-800 text-gray-400 dark:text-gray-600'
            "
          >
            <!-- Guilloche decorative pattern -->
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-current via-transparent to-transparent"></div>
            
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold tracking-widest font-serif opacity-75">BANCO</span>
              <span class="text-xs font-bold font-mono opacity-80">Q</span>
            </div>
            
            <div class="text-center font-mono text-3xl font-extrabold tracking-tight">
              {{ formatNumber(denominacion.valor).split('.')[0] }}
              <span class="text-xs font-semibold opacity-85">.{{ formatNumber(denominacion.valor).split('.')[1] }}</span>
            </div>

            <div class="flex justify-between items-end text-[10px] opacity-75 font-mono">
              <span>GUATEMALA</span>
              <span class="font-serif">BILLETE</span>
            </div>
          </div>

          <!-- Moneda Premium Card View -->
          <div
            v-else
            class="relative w-32 h-32 rounded-full shadow-md border flex flex-col items-center justify-center p-3 select-none transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
            :class="
              denominacion.activo
                ? 'bg-gradient-to-br from-amber-100 via-yellow-55 to-amber-200 border-amber-300 dark:from-amber-900/30 dark:via-yellow-950/20 dark:to-amber-950/40 dark:border-amber-800 text-amber-800 dark:text-amber-400'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 dark:from-gray-800 dark:to-gray-900 dark:border-gray-800 text-gray-400 dark:text-gray-600'
            "
          >
            <!-- Circular coin ridges -->
            <div class="absolute inset-1.5 rounded-full border border-dashed opacity-50 border-current"></div>
            <div class="absolute inset-3 rounded-full border border-double opacity-30 border-current"></div>
            
            <div class="text-[10px] font-bold tracking-widest opacity-75">Q</div>
            <div class="font-mono text-2xl font-extrabold my-0.5">
              {{ formatNumber(denominacion.valor) }}
            </div>
            <div class="text-[8px] font-bold opacity-60 tracking-wider">MONEDA</div>
          </div>
        </div>

        <!-- Lower Row: Actions -->
        <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-end gap-2 z-10">
          <button
            @click="openEditModal(denominacion)"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-azul-cope dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
            title="Editar"
          >
            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            @click="toggleEstado(denominacion)"
            class="p-2 rounded-xl transition-all duration-200 cursor-pointer"
            :class="
              denominacion.activo
                ? 'text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20'
                : 'text-green-500 hover:text-green-650 hover:bg-green-50 dark:hover:bg-green-950/20'
            "
            :title="denominacion.activo ? 'Desactivar' : 'Activar'"
          >
            <svg v-if="denominacion.activo" class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <svg v-else class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE VIEW (Traditional Compact) -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 dark:divide-gray-700/60">
            <tr
              v-for="denominacion in filteredDenominaciones"
              :key="denominacion.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors"
              :class="!denominacion.activo && 'opacity-65'"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 font-mono text-base font-bold text-gray-900 dark:text-white">
                  <span class="text-xs text-gray-400 font-sans">Q</span>
                  <span>{{ formatNumber(denominacion.valor) }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                  :class="
                    denominacion.tipo === 'billete'
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200/40 dark:border-blue-900/30'
                      : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/40 dark:border-amber-900/30'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="denominacion.tipo === 'billete' ? 'bg-blue-500' : 'bg-amber-500'"
                  ></span>
                  {{ capitalize(denominacion.tipo) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="
                    denominacion.activo
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
                      : 'bg-gray-150 dark:bg-gray-700 text-gray-650 dark:text-gray-400'
                  "
                >
                  {{ denominacion.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(denominacion)"
                    class="p-2 text-gray-400 dark:text-gray-500 hover:text-azul-cope dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-all cursor-pointer"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    @click="toggleEstado(denominacion)"
                    class="p-2 rounded-lg transition-all cursor-pointer"
                    :class="
                      denominacion.activo
                        ? 'text-red-400 dark:text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20'
                        : 'text-green-400 dark:text-green-500 hover:text-green-650 hover:bg-green-50 dark:hover:bg-green-950/20'
                    "
                    :title="denominacion.activo ? 'Desactivar' : 'Activar'"
                  >
                    <svg v-if="denominacion.activo" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE CREAR / EDITAR -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              {{ editingId ? 'Editar Denominación' : 'Nueva Denominación' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 dark:text-gray-500 hover:text-gray-650 dark:hover:text-white transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="saveDenominacion" class="p-6 space-y-4">
            <div v-if="submitError" class="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-xs text-red-700 dark:text-red-400">
              {{ submitError }}
            </div>

            <!-- Valor -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-1.5">Valor (Q)</label>
              <div class="relative rounded-xl shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-450 dark:text-gray-500 sm:text-sm font-semibold">Q</span>
                </div>
                <input
                  v-model.number="form.valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  class="block w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
                />
              </div>
            </div>

            <!-- Tipo -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-1.5">Tipo de Efectivo</label>
              <select
                v-model="form.tipo"
                required
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              >
                <option value="billete">Billete</option>
                <option value="moneda">Moneda</option>
              </select>
            </div>

            <!-- Activo -->
            <div class="flex items-center gap-3 pt-2">
              <input
                id="modal-activo"
                v-model="form.activo"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 dark:border-gray-650 text-azul-cope focus:ring-azul-cope bg-white dark:bg-gray-700 cursor-pointer"
              />
              <label for="modal-activo" class="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                Habilitado para su uso (Activo)
              </label>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 pt-5 border-t border-gray-150 dark:border-gray-700">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-azul-cope hover:bg-azul-cope/90 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ submitting ? 'Guardando...' : 'Guardar' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

interface Denominacion {
  id: number
  valor: number
  tipo: 'billete' | 'moneda'
  activo: boolean
}

const denominaciones = ref<Denominacion[]>([])
const loading = ref(true)
const error = ref('')
const filterTipo = ref('todos')
const viewMode = ref<'grid' | 'table'>('grid')

// Modal state
const isModalOpen = ref(false)
const submitting = ref(false)
const submitError = ref('')
const editingId = ref<number | null>(null)
const form = ref({
  valor: null as number | null,
  tipo: 'billete' as 'billete' | 'moneda',
  activo: true
})

const filteredDenominaciones = computed(() => {
  if (filterTipo.value === 'todos') {
    return denominaciones.value
  }
  return denominaciones.value.filter(d => d.tipo === filterTipo.value)
})

const fetchDenominaciones = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/denominaciones')
    denominaciones.value = response.data
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.message || 'Error al conectar con la API.'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingId.value = null
  submitError.value = ''
  form.value = {
    valor: null,
    tipo: 'billete',
    activo: true
  }
  isModalOpen.value = true
}

const openEditModal = (denominacion: Denominacion) => {
  editingId.value = denominacion.id
  submitError.value = ''
  form.value = {
    valor: Number(denominacion.valor),
    tipo: denominacion.tipo,
    activo: denominacion.activo
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveDenominacion = async () => {
  submitting.value = true
  submitError.value = ''
  try {
    if (editingId.value) {
      const response = await api.put(`/denominaciones/${editingId.value}`, form.value)
      const index = denominaciones.value.findIndex(d => d.id === editingId.value)
      if (index !== -1) {
        denominaciones.value[index] = {
          ...denominaciones.value[index],
          ...response.data
        }
      }
    } else {
      const response = await api.post('/denominaciones', form.value)
      denominaciones.value.push(response.data)
      // Ordenar por valor desc
      denominaciones.value.sort((a, b) => b.valor - a.valor)
    }
    closeModal()
  } catch (err: any) {
    console.error(err)
    submitError.value = err.response?.data?.message || 'Error al guardar la denominación.'
  } finally {
    submitting.value = false
  }
}

const toggleEstado = async (denominacion: Denominacion) => {
  try {
    if (denominacion.activo) {
      // Endpoint destroy hace soft delete lógico desactivando el activo
      await api.delete(`/denominaciones/${denominacion.id}`)
      denominacion.activo = false
    } else {
      // Activar mediante update
      const response = await api.put(`/denominaciones/${denominacion.id}`, { activo: true })
      denominacion.activo = response.data.activo
    }
  } catch (err) {
    console.error('Error al cambiar el estado de la denominación:', err)
  }
}

const formatNumber = (value: number) => {
  return Number(value).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const capitalize = (text: string | undefined | null) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

onMounted(() => {
  fetchDenominaciones()
})
</script>
