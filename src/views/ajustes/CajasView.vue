<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Gestión de Cajas y Bóvedas
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Administra las bóvedas, cajas generales y ventanillas transaccionales de cada agencia.
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center px-4 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-verde-cope/50 gap-2 text-sm cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Caja
      </button>
    </div>

    <!-- Filtros y Barra de Búsqueda -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <!-- Búsqueda por nombre -->
        <div class="relative w-full sm:w-64">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar caja por nombre..."
            class="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm transition-all"
          />
        </div>

        <!-- Filtro de Agencia -->
        <select
          v-model="filterAgencia"
          class="block w-full sm:w-56 px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
        >
          <option value="">Todas las Agencias</option>
          <option v-for="agencia in agencias" :key="agencia.id" :value="agencia.id">
            {{ agencia.nombre }}
          </option>
        </select>
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <!-- View Toggle -->
        <div class="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-900/60">
          <button
            @click="viewMode = 'grid'"
            class="px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-azul-cope dark:text-white shadow-sm' : 'text-gray-450 hover:text-gray-600 dark:hover:text-gray-350'"
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
            :class="viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-azul-cope dark:text-white shadow-sm' : 'text-gray-450 hover:text-gray-600 dark:hover:text-gray-350'"
            title="Vista Tabla"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Tabla
          </button>
        </div>

        <div class="text-xs text-gray-550 dark:text-gray-400">
          Mostrando <span class="font-bold text-gray-850 dark:text-white">{{ filteredCajas.length }}</span> cajas
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Cargando cajas...</p>
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
          @click="fetchData"
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
    <div v-else-if="filteredCajas.length === 0" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm max-w-lg mx-auto">
      <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-400 dark:text-gray-600">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800 dark:text-white">No se encontraron cajas</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Crea una nueva caja para esta agencia o modifica tus filtros actuales de búsqueda.
      </p>
      <button
        @click="openCreateModal"
        class="mt-6 inline-flex items-center justify-center px-4 py-2 bg-azul-cope hover:bg-azul-cope/90 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        Crear Caja
      </button>
    </div>

    <!-- GRID VIEW (Visual Cards) -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="caja in filteredCajas"
        :key="caja.id"
        class="group relative bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
        :class="caja.estado ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200/50 dark:border-gray-800/50 opacity-70'"
      >
        <div>
          <!-- Type Badge and Pulse Dot -->
          <div class="flex items-center justify-between mb-4">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border"
              :class="
                caja.tipo_caja === 'boveda'
                  ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/30'
                  : caja.tipo_caja === 'general'
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-250 dark:border-emerald-800/30'
              "
            >
              <!-- Icon representation -->
              <svg v-if="caja.tipo_caja === 'boveda'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <svg v-else-if="caja.tipo_caja === 'general'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatTipo(caja.tipo_caja) }}
            </span>

            <span
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="
                caja.estado
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
              "
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="caja.estado ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
              {{ caja.estado ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <!-- Caja Info -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-azul-cope dark:group-hover:text-white transition-colors duration-200">
              {{ caja.nombre }}
            </h3>
            
            <div class="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{{ caja.agencia?.nombre || 'Sin Agencia' }}</span>
              <span v-if="caja.agencia?.codigo" class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                Cód: {{ caja.agencia.codigo }}
              </span>
            </div>
            <div v-if="caja.poliza" class="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Póliza: {{ formatCurrency(caja.poliza) }}</span>
            </div>
          </div>

          <!-- Cajero en Turno Section -->
          <div class="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-750 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Cajero en Turno</span>
            
            <div v-if="caja.usuario_en_turno" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-azul-cope/10 dark:bg-azul-cope/20 text-azul-cope dark:text-blue-400 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {{ caja.usuario_en_turno.name.charAt(0).toUpperCase() }}
              </div>
              <div class="overflow-hidden">
                <div class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ caja.usuario_en_turno.name }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500 truncate">@{{ caja.usuario_en_turno.username }}</div>
              </div>
            </div>
            
            <div v-else class="flex flex-col items-center justify-center py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
              <span class="text-xs italic text-gray-450 dark:text-gray-500">Sin cajero asignado</span>
              <button
                @click="openAssignModal(caja)"
                class="mt-2 text-xs font-bold text-azul-cope dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Asignar ahora
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <button
            @click="openAssignModal(caja)"
            class="text-xs font-bold text-verde-cope dark:text-green-450 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Reasignar
          </button>

          <button
            @click="openEditModal(caja)"
            class="p-2 text-gray-500 hover:text-azul-cope dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Editar Caja"
          >
            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE VIEW (Compact) -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Caja</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agencia</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cajero en Turno</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Póliza</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 dark:divide-gray-700/60">
            <tr
              v-for="caja in filteredCajas"
              :key="caja.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors"
              :class="!caja.estado && 'opacity-65'"
            >
              <!-- Nombre -->
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 dark:text-white text-sm">
                  {{ caja.nombre }}
                </div>
              </td>
              
              <!-- Agencia -->
              <td class="px-6 py-4">
                <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {{ caja.agencia?.nombre || 'S/N' }}
                </div>
                <div v-if="caja.agencia?.codigo" class="text-xs text-gray-400 dark:text-gray-500">
                  Código: {{ caja.agencia.codigo }}
                </div>
              </td>

              <!-- Tipo -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                  :class="
                    caja.tipo_caja === 'boveda'
                      ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/30'
                      : caja.tipo_caja === 'general'
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'
                      : 'bg-green-50 dark:bg-green-950/20 text-green-750 dark:text-green-400 border-green-200 dark:border-green-800/30'
                  "
                >
                  {{ formatTipo(caja.tipo_caja) }}
                </span>
              </td>

              <!-- Usuario en Turno -->
              <td class="px-6 py-4">
                <div v-if="caja.usuario_en_turno" class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-azul-cope/10 text-azul-cope dark:bg-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-xs">
                    {{ caja.usuario_en_turno.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ caja.usuario_en_turno.name }}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">@{{ caja.usuario_en_turno.username }}</div>
                  </div>
                </div>
                <span v-else class="text-xs italic text-gray-450 dark:text-gray-500">
                  Sin asignar
                </span>
              </td>

              <!-- Estado -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  :class="
                    caja.estado
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                  "
                >
                  {{ caja.estado ? 'Activa' : 'Inactiva' }}
                </span>
              </td>

              <!-- Póliza -->
              <td class="px-6 py-4">
                <span v-if="caja.poliza" class="font-mono text-sm font-semibold text-gray-750 dark:text-gray-300">
                  {{ formatCurrency(caja.poliza) }}
                </span>
                <span v-else class="text-xs text-gray-450 italic">
                  Sin póliza
                </span>
              </td>

              <!-- Acciones -->
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- Asignar Usuario -->
                  <button
                    @click="openAssignModal(caja)"
                    class="p-2 text-gray-400 dark:text-gray-500 hover:text-verde-cope dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    title="Asignar Cajero"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </button>

                  <!-- Editar -->
                  <button
                    @click="openEditModal(caja)"
                    class="p-2 text-gray-400 dark:text-gray-500 hover:text-azul-cope dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE CREAR / EDITAR CAJA -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              {{ editingId ? 'Editar Caja' : 'Nueva Caja' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 dark:text-gray-505 hover:text-gray-650 dark:hover:text-white transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="saveCaja" class="p-6 space-y-4">
            <div v-if="submitError" class="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-xs text-red-700 dark:text-red-400">
              {{ submitError }}
            </div>

            <!-- Nombre -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Nombre de la Caja</label>
              <input
                v-model="form.nombre"
                type="text"
                required
                placeholder="Ej: Ventanilla 1, Bóveda Cobán"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              />
            </div>

            <!-- Agencia -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Agencia Asignada</label>
              <select
                v-model="form.agencia_id"
                required
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              >
                <option value="" disabled selected>Seleccione la agencia</option>
                <option v-for="agencia in agencias" :key="agencia.id" :value="agencia.id">
                  {{ agencia.nombre }}
                </option>
              </select>
            </div>

            <!-- Tipo Caja -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Tipo de Caja</label>
              <select
                v-model="form.tipo_caja"
                required
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              >
                <option value="boveda">Bóveda</option>
                <option value="general">Caja General</option>
                <option value="ventanilla">Ventanilla</option>
              </select>
            </div>

            <!-- Póliza -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Límite de Póliza (Q)</label>
              <input
                v-model.number="form.poliza"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 50000.00"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              />
            </div>

            <!-- Estado (Abierta/Cerrada) -->
            <div class="flex items-center gap-3 pt-2">
              <input
                id="modal-caja-estado"
                v-model="form.estado"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 dark:border-gray-650 text-azul-cope focus:ring-azul-cope bg-white dark:bg-gray-700 cursor-pointer"
              />
              <label for="modal-caja-estado" class="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                Habilitada / Activa
              </label>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 pt-5 border-t border-gray-150 dark:border-gray-700">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-650 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
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

    <!-- MODAL DE ASIGNACIÓN DE CAJERO -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isAssignModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              Asignar Cajero en Turno
            </h3>
            <button @click="closeAssignModal" class="text-gray-400 dark:text-gray-550 hover:text-gray-650 dark:hover:text-white transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="saveAssignUser" class="p-6 space-y-4">
            <div v-if="assignError" class="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-xs text-red-700 dark:text-red-400">
              {{ assignError }}
            </div>

            <div class="text-sm text-gray-600 dark:text-gray-300">
              Caja seleccionada: <span class="font-bold text-gray-905 dark:text-white">{{ activeCaja?.nombre }}</span>
            </div>

            <!-- Seleccionar Usuario -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Usuario Cajero</label>
              <select
                v-model="assignForm.usuario_id"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              >
                <option :value="null">Ninguno / Desasignar</option>
                <option v-for="user in usuarios" :key="user.id" :value="user.id">
                  {{ user.name }} (@{{ user.username }})
                </option>
              </select>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 pt-5 border-t border-gray-150 dark:border-gray-700">
              <button
                type="button"
                @click="closeAssignModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-650 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submittingAssign"
                class="px-4 py-2 bg-verde-cope hover:bg-verde-cope/90 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span v-if="submittingAssign" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ submittingAssign ? 'Asignando...' : 'Asignar' }}</span>
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

interface User {
  id: number
  name: string
  username: string
}

interface Agencia {
  id: number
  nombre: string
  codigo: number
}

interface Caja {
  id: number
  agencia_id: number
  nombre: string
  tipo_caja: 'boveda' | 'general' | 'ventanilla'
  usuario_id: number | null
  estado: boolean
  poliza: number | null
  agencia?: Agencia
  usuario_en_turno?: User
}

const cajas = ref<Caja[]>([])
const agencias = ref<Agencia[]>([])
const usuarios = ref<User[]>([])

const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const filterAgencia = ref('')
const viewMode = ref<'grid' | 'table'>('grid')

// Create/Edit modal states
const isModalOpen = ref(false)
const submitting = ref(false)
const submitError = ref('')
const editingId = ref<number | null>(null)
const form = ref({
  nombre: '',
  agencia_id: '' as number | string,
  tipo_caja: 'ventanilla' as 'boveda' | 'general' | 'ventanilla',
  estado: true,
  poliza: '' as number | string | null
})

// Assign modal states
const isAssignModalOpen = ref(false)
const submittingAssign = ref(false)
const assignError = ref('')
const activeCaja = ref<Caja | null>(null)
const assignForm = ref({
  usuario_id: null as number | null
})

const filteredCajas = computed(() => {
  return cajas.value.filter(c => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesAgencia = filterAgencia.value === '' || c.agencia_id === Number(filterAgencia.value)
    return matchesSearch && matchesAgencia
  })
})

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [cajasRes, agenciasRes, usuariosRes] = await Promise.all([
      api.get('/cajas'),
      api.get('/agencias'),
      api.get('/usuarios')
    ])
    // Mapeamos para asociar usuario_en_turno (el backend usa usuarioEnTurno o usuario_en_turno)
    cajas.value = cajasRes.data.map((c: any) => ({
      ...c,
      usuario_en_turno: c.usuario_en_turno
    }))
    agencias.value = agenciasRes.data
    usuarios.value = usuariosRes.data
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.message || 'Error al conectar con la API.'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const openCreateModal = () => {
  editingId.value = null
  submitError.value = ''
  form.value = {
    nombre: '',
    agencia_id: '',
    tipo_caja: 'ventanilla',
    estado: true,
    poliza: ''
  }
  isModalOpen.value = true
}

const openEditModal = (caja: Caja) => {
  editingId.value = caja.id
  submitError.value = ''
  form.value = {
    nombre: caja.nombre,
    agencia_id: caja.agencia_id,
    tipo_caja: caja.tipo_caja,
    estado: caja.estado,
    poliza: caja.poliza !== null ? caja.poliza : ''
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveCaja = async () => {
  submitting.value = true
  submitError.value = ''
  try {
    if (editingId.value) {
      const response = await api.put(`/cajas/${editingId.value}`, form.value)
      const index = cajas.value.findIndex(c => c.id === editingId.value)
      if (index !== -1) {
        cajas.value[index] = {
          ...response.data,
          agencia: agencias.value.find(a => a.id === response.data.agencia_id),
          usuario_en_turno: cajas.value[index].usuario_en_turno
        }
      }
    } else {
      const response = await api.post('/cajas', form.value)
      const newCaja = {
        ...response.data,
        agencia: agencias.value.find(a => a.id === response.data.agencia_id),
        usuario_en_turno: null
      }
      cajas.value.push(newCaja)
    }
    closeModal()
  } catch (err: any) {
    console.error(err)
    submitError.value = err.response?.data?.message || 'Error al guardar la caja.'
  } finally {
    submitting.value = false
  }
}

const openAssignModal = (caja: Caja) => {
  activeCaja.value = caja
  assignError.value = ''
  assignForm.value = {
    usuario_id: caja.usuario_id
  }
  isAssignModalOpen.value = true
}

const closeAssignModal = () => {
  isAssignModalOpen.value = false
}

const saveAssignUser = async () => {
  if (!activeCaja.value) return
  submittingAssign.value = true
  assignError.value = ''
  try {
    const response = await api.post(`/cajas/${activeCaja.value.id}/asignar-usuario`, assignForm.value)
    const index = cajas.value.findIndex(c => c.id === activeCaja.value!.id)
    if (index !== -1) {
      cajas.value[index] = {
        ...cajas.value[index],
        usuario_id: response.data.caja.usuario_id,
        usuario_en_turno: response.data.caja.usuario_en_turno
      }
    }
    closeAssignModal()
  } catch (err: any) {
    console.error(err)
    assignError.value = err.response?.data?.message || 'Error al asignar usuario.'
  } finally {
    submittingAssign.value = false
  }
}

const formatTipo = (tipo: string) => {
  if (tipo === 'boveda') return 'Bóveda'
  if (tipo === 'general') return 'Caja General'
  return 'Ventanilla'
}

onMounted(() => {
  fetchData()
})
</script>
