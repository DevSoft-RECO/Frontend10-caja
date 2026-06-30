<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Monitoreo Consolidado (Dashboard)
        </h1>
        <p class="mt-1 text-sm text-gray-550 dark:text-gray-400">
          Matriz de doble entrada del flujo físico de efectivo en bóveda, caja general y ventanillas transaccionales hoy.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="fetchData"
          class="inline-flex items-center justify-center p-2.5 bg-azul-cope text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all gap-1.5 text-xs cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
          </svg>
          Actualizar Datos
        </button>

        <button
          v-if="bovedas.length > 0 && !bovedaCerradaHoy"
          @click="openCierreBovedaModal"
          class="inline-flex items-center justify-center p-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all gap-1.5 text-xs cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Cerrar Bóveda
        </button>

        <span
          v-else-if="bovedas.length > 0 && bovedaCerradaHoy"
          class="inline-flex items-center justify-center p-2.5 bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-bold rounded-xl gap-1.5 text-xs select-none border border-green-200 dark:border-green-900/30"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Bóveda Cerrada
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-550 dark:text-gray-400 animate-pulse">Cargando matriz consolidada...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5 flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
      <div class="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-red-800 dark:text-red-300">Error al cargar matriz</h3>
        <p class="text-xs text-red-700 dark:text-red-400 mt-1">{{ error }}</p>
      </div>
    </div>    <!-- Consolidated matrix view -->
    <div v-else class="space-y-6">
      <!-- Matrix Card -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div class="p-5 border-b border-gray-150 dark:border-gray-750 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 dark:from-gray-900/50 dark:via-gray-800 dark:to-gray-900/50">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-azul-cope/10 text-azul-cope rounded-xl">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Matriz Operativa del Día</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Flujos de efectivo conciliados en tiempo real</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-verde-cope bg-verde-cope/10 px-3 py-1.5 rounded-full border border-verde-cope/20">
            <span class="w-1.5 h-1.5 rounded-full bg-verde-cope animate-pulse"></span>
            Fecha Operativa: {{ fechaHoy }}
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1000px] border border-gray-200 dark:border-gray-700 rounded-2xl">
            <thead>
              <!-- Top Header (Box Names) -->
              <tr class="bg-gray-100 dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 select-none">
                <th class="p-4 border-r border-gray-200 dark:border-gray-700 font-extrabold text-sm text-gray-800 dark:text-gray-200" rowspan="2">Denominación</th>
                
                <!-- Bóveda Column Group -->
                <th class="p-3 border-r-2 border-slate-300 dark:border-slate-600 text-center bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px]" colspan="4" v-if="bovedas.length > 0">
                  <div class="flex items-center justify-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-slate-500"></span>
                    Bóveda (Principal)
                  </div>
                </th>
                
                <!-- Caja General Column Group -->
                <th class="p-3 border-r-2 border-emerald-300 dark:border-emerald-700 text-center bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-250 font-bold uppercase tracking-wider text-[11px]" colspan="2" v-if="cajasGenerales.length > 0">
                  <div class="flex items-center justify-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Caja General
                  </div>
                </th>

                <!-- Ventanillas Column Group (Only selected one) -->
                <th class="p-2 text-center bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-bold" colspan="2" v-if="selectedVentanilla">
                  <div class="flex items-center justify-center gap-3">
                    <div class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span class="text-[11px] uppercase tracking-wider">Ventanilla</span>
                    </div>
                    <select 
                      v-model="selectedVentanillaId" 
                      class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-sm transition-all"
                    >
                      <option v-for="vent in ventanillas" :key="vent.id" :value="vent.id">
                        {{ vent.nombre }}
                      </option>
                    </select>
                  </div>
                </th>
              </tr>

              <!-- Sub Header (In/Out) -->
              <tr class="bg-gray-50/80 dark:bg-gray-950 text-[10px] font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 uppercase tracking-wider select-none">
                <!-- Bóveda Columns -->
                <template v-if="bovedas.length > 0">
                  <th class="p-2.5 text-center border-r border-gray-150 dark:border-gray-800 font-semibold bg-slate-50/30 dark:bg-slate-900/30">S. Inicial</th>
                  <th class="p-2.5 text-center text-green-600 dark:text-green-455 border-r border-gray-150 dark:border-gray-800 font-semibold bg-slate-50/30 dark:bg-slate-900/30">Recibido</th>
                  <th class="p-2.5 text-center text-red-500 border-r border-gray-150 dark:border-gray-800 font-semibold bg-slate-50/30 dark:bg-slate-900/30">Enviado</th>
                  <th class="p-2.5 text-center text-azul-cope border-r-2 border-slate-300 dark:border-slate-600 font-bold bg-slate-100/50 dark:bg-slate-900/80">Disponible</th>
                </template>

                <!-- General In/Out -->
                <template v-if="cajasGenerales.length > 0">
                  <th class="p-2.5 text-center text-green-600 dark:text-green-455 border-r border-gray-150 dark:border-gray-800 font-semibold bg-emerald-50/10 dark:bg-emerald-950/5">Recibido</th>
                  <th class="p-2.5 text-center text-red-500 border-r-2 border-emerald-300 dark:border-emerald-755 font-bold bg-emerald-50/10 dark:bg-emerald-950/5">Enviado</th>
                </template>

                <!-- Only active ventanilla columns -->
                <template v-if="selectedVentanilla">
                  <th class="p-2.5 text-center text-green-600 dark:text-green-455 border-r border-gray-150 dark:border-gray-800 font-semibold bg-indigo-50/10 dark:bg-indigo-950/5">Recibido</th>
                  <th class="p-2.5 text-center text-red-500 font-bold bg-indigo-50/10 dark:bg-indigo-950/5">Enviado</th>
                </template>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium">
              <!-- Billetes Section Header -->
              <tr class="bg-slate-100/80 dark:bg-slate-900 text-xs font-extrabold text-slate-700 dark:text-slate-300 border-y border-gray-200 dark:border-gray-700 select-none">
                <td :colspan="columnCount" class="p-3 uppercase tracking-widest pl-4">
                  <span class="inline-flex items-center gap-1">
                    💵 Billetes
                  </span>
                </td>
              </tr>
              
              <!-- Loop Billetes -->
              <tr
                v-for="denom in billetes"
                :key="denom.id"
                class="hover:bg-slate-50/40 dark:hover:bg-gray-750/30 transition-colors"
              >
                <!-- Label Column -->
                <td class="p-3.5 border-r border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white pl-4">
                  <div class="flex items-center justify-between">
                    <span>{{ denom.nombre }}</span>
                    <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {{ formatCurrency(denom.valor) }}
                    </span>
                  </div>
                </td>

                <!-- Bóveda data -->
                <template v-if="bovedas.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ getSaldoInicialCantidad(bovedas[0].id, denom.id) }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ getCantidadMatriz(bovedas[0].id, denom.id, 'ingresos') }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ getCantidadMatriz(bovedas[0].id, denom.id, 'egresos') }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-900/20">
                    {{ getSaldoDisponibleCantidad(bovedas[0].id, denom.id) }}
                  </td>
                </template>

                <!-- Caja General data -->
                <template v-if="cajasGenerales.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ getCantidadMatriz(cajasGenerales[0].id, denom.id, 'ingresos') }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-emerald-300 dark:border-emerald-700 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ getCantidadMatriz(cajasGenerales[0].id, denom.id, 'egresos') }}
                  </td>
                </template>

                <!-- Ventanilla data (Selected) -->
                <template v-if="selectedVentanilla">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-850 font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ getCantidadMatriz(selectedVentanilla.id, denom.id, 'ingresos') }}
                  </td>
                  <td class="p-2 text-center font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ getCantidadMatriz(selectedVentanilla.id, denom.id, 'egresos') }}
                  </td>
                </template>
              </tr>

              <!-- TOTAL BILLETES ROW -->
              <tr class="bg-gray-100/40 dark:bg-slate-900/30 font-bold text-gray-950 dark:text-white border-t border-gray-300 dark:border-gray-700 text-xs">
                <td class="p-3.5 border-r border-gray-200 dark:border-gray-700 uppercase tracking-wider pl-4 text-gray-700 dark:text-gray-300">TOTAL BILLETES</td>
                
                <!-- Bóveda Billetes -->
                <template v-if="bovedas.length > 0">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-gray-700 dark:text-gray-300 pr-3 bg-slate-50/20 dark:bg-slate-900/10">
                    {{ formatCurrency(getBilletesSaldoInicialMonto(bovedas[0].id)) }}
                  </td>
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-slate-50/20 dark:bg-slate-900/10">
                    {{ formatCurrency(getBilletesMontoCaja(bovedas[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-red-500 pr-3 bg-slate-50/20 dark:bg-slate-900/10">
                    {{ formatCurrency(getBilletesMontoCaja(bovedas[0].id, 'egresos')) }}
                  </td>
                  <td class="p-2 text-right border-r-2 border-slate-300 dark:border-slate-600 font-mono text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-900/40 pr-3">
                    {{ formatCurrency(getBilletesSaldoDisponibleMonto(bovedas[0].id)) }}
                  </td>
                </template>

                <!-- Caja General Billetes -->
                <template v-if="cajasGenerales.length > 0">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-emerald-50/10 dark:bg-emerald-950/5">
                    {{ formatCurrency(getBilletesMontoCaja(cajasGenerales[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right border-r-2 border-emerald-300 dark:border-emerald-700 font-mono text-red-500 pr-3 bg-emerald-50/10 dark:bg-emerald-950/5">
                    {{ formatCurrency(getBilletesMontoCaja(cajasGenerales[0].id, 'egresos')) }}
                  </td>
                </template>

                <!-- Ventanilla Billetes (Selected) -->
                <template v-if="selectedVentanilla">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-indigo-50/10 dark:bg-indigo-950/5">
                    {{ formatCurrency(getBilletesMontoCaja(selectedVentanilla.id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right font-mono text-red-500 pr-3 bg-indigo-50/10 dark:bg-indigo-950/5">
                    {{ formatCurrency(getBilletesMontoCaja(selectedVentanilla.id, 'egresos')) }}
                  </td>
                </template>
              </tr>

              <!-- Monedas Section Header -->
              <tr class="bg-slate-100/80 dark:bg-slate-900 text-xs font-extrabold text-slate-700 dark:text-slate-300 border-y border-gray-200 dark:border-gray-700 select-none">
                <td :colspan="columnCount" class="p-3 uppercase tracking-widest pl-4">
                  <span class="inline-flex items-center gap-1">
                    🪙 Monedas
                  </span>
                </td>
              </tr>

              <!-- Loop Monedas -->
              <tr
                v-for="denom in monedas"
                :key="denom.id"
                class="hover:bg-slate-50/40 dark:hover:bg-gray-750/30 transition-colors"
              >
                <!-- Label Column -->
                <td class="p-3.5 border-r border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white pl-4">
                  <div class="flex items-center justify-between">
                    <span>{{ denom.nombre }}</span>
                    <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-550 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {{ formatCurrency(denom.valor) }}
                    </span>
                  </div>
                </td>

                <!-- Bóveda data -->
                <template v-if="bovedas.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ getSaldoInicialCantidad(bovedas[0].id, denom.id) }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ getCantidadMatriz(bovedas[0].id, denom.id, 'ingresos') }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ getCantidadMatriz(bovedas[0].id, denom.id, 'egresos') }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-900/20">
                    {{ getSaldoDisponibleCantidad(bovedas[0].id, denom.id) }}
                  </td>
                </template>

                <!-- Caja General data -->
                <template v-if="cajasGenerales.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ getCantidadMatriz(cajasGenerales[0].id, denom.id, 'ingresos') }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-emerald-300 dark:border-emerald-700 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ getCantidadMatriz(cajasGenerales[0].id, denom.id, 'egresos') }}
                  </td>
                </template>

                <!-- Ventanilla data (Selected) -->
                <template v-if="selectedVentanilla">
                  <td class="p-2 text-center border-r border-gray-155 dark:border-gray-850 font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ getCantidadMatriz(selectedVentanilla.id, denom.id, 'ingresos') }}
                  </td>
                  <td class="p-2 text-center font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ getCantidadMatriz(selectedVentanilla.id, denom.id, 'egresos') }}
                  </td>
                </template>
              </tr>

              <!-- TOTAL MONEDAS ROW -->
              <tr class="bg-gray-100/40 dark:bg-slate-900/30 font-bold text-gray-955 dark:text-white border-t border-gray-300 dark:border-gray-700 text-xs">
                <td class="p-3.5 border-r border-gray-200 dark:border-gray-700 uppercase tracking-wider pl-4 text-gray-700 dark:text-gray-300">TOTAL MONEDAS</td>

                <!-- Bóveda Monedas -->
                <template v-if="bovedas.length > 0">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-gray-700 dark:text-gray-300 pr-3 bg-slate-50/20 dark:bg-slate-900/10">
                    {{ formatCurrency(getMonedasSaldoInicialMonto(bovedas[0].id)) }}
                  </td>
                  <td class="p-2 text-right border-r border-gray-155 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-slate-50/20 dark:bg-slate-900/10">
                    {{ formatCurrency(getMonedasMontoCaja(bovedas[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right border-r border-gray-155 dark:border-gray-800 font-mono text-red-500 pr-3 bg-slate-50/20 dark:bg-slate-900/10">
                    {{ formatCurrency(getMonedasMontoCaja(bovedas[0].id, 'egresos')) }}
                  </td>
                  <td class="p-2 text-right border-r-2 border-slate-300 dark:border-slate-600 font-mono text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-900/40 pr-3">
                    {{ formatCurrency(getMonedasSaldoDisponibleMonto(bovedas[0].id)) }}
                  </td>
                </template>

                <!-- Caja General Monedas -->
                <template v-if="cajasGenerales.length > 0">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-emerald-50/10 dark:bg-emerald-950/5">
                    {{ formatCurrency(getMonedasMontoCaja(cajasGenerales[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right border-r-2 border-emerald-300 dark:border-emerald-700 font-mono text-red-500 pr-3 bg-emerald-50/10 dark:bg-emerald-950/5">
                    {{ formatCurrency(getMonedasMontoCaja(cajasGenerales[0].id, 'egresos')) }}
                  </td>
                </template>

                <!-- Ventanilla Monedas (Selected) -->
                <template v-if="selectedVentanilla">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-indigo-50/10 dark:bg-indigo-950/5">
                    {{ formatCurrency(getMonedasMontoCaja(selectedVentanilla.id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right font-mono text-red-500 pr-3 bg-indigo-50/10 dark:bg-indigo-950/5">
                    {{ formatCurrency(getMonedasMontoCaja(selectedVentanilla.id, 'egresos')) }}
                  </td>
                </template>
              </tr>

              <!-- Special Flows Section Header -->
              <tr class="bg-slate-100/80 dark:bg-slate-900 text-xs font-extrabold text-slate-700 dark:text-slate-300 border-y border-gray-200 dark:border-gray-700 select-none">
                <td :colspan="columnCount" class="p-3 uppercase tracking-widest pl-4">
                  <span class="inline-flex items-center gap-1">
                    🔄 Flujos Especiales y Monitoreo
                  </span>
                </td>
              </tr>

              <!-- Fila Cajillas -->
              <tr class="hover:bg-slate-50/40 dark:hover:bg-gray-750/30 transition-colors">
                <td class="p-3.5 border-r border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white pl-4">
                  Cajillas (Aperturas / Cierres)
                </td>
                
                <!-- Bóveda data -->
                <template v-if="bovedas.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ formatCurrency(getCajillasSaldoInicial(bovedas[0].id)) }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ formatCurrency(getCajillasMonto(bovedas[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ formatCurrency(getCajillasMonto(bovedas[0].id, 'egresos')) }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-900/20">
                    {{ formatCurrency(getCajillasDisponible(bovedas[0].id)) }}
                  </td>
                </template>

                <!-- Caja General data -->
                <template v-if="cajasGenerales.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ formatCurrency(getCajillasMonto(cajasGenerales[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-emerald-300 dark:border-emerald-700 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ formatCurrency(getCajillasMonto(cajasGenerales[0].id, 'egresos')) }}
                  </td>
                </template>

                <!-- Ventanilla data (Selected) -->
                <template v-if="selectedVentanilla">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ formatCurrency(getCajillasMonto(selectedVentanilla.id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-center font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ formatCurrency(getCajillasMonto(selectedVentanilla.id, 'egresos')) }}
                  </td>
                </template>
              </tr>


              <!-- Fila Deteriorado -->
              <tr class="hover:bg-slate-50/40 dark:hover:bg-gray-750/30 transition-colors">
                <td class="p-3.5 border-r border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white pl-4 flex items-center justify-between gap-2">
                  <span>Efectivo Deteriorado</span>
                  <button
                    v-if="bovedas.length > 0"
                    @click="openInventarioDeteriorado(bovedas[0].id)"
                    class="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1"
                    title="Ver desglose físico"
                  >
                    🔍 Detalle
                  </button>
                </td>
                
                <!-- Bóveda data -->
                <template v-if="bovedas.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ formatCurrency(getDeterioradosSaldoInicial(bovedas[0].id)) }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ formatCurrency(getDeterioradosMonto(bovedas[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-slate-50/10 dark:bg-slate-900/5">
                    {{ formatCurrency(getDeterioradosMonto(bovedas[0].id, 'egresos')) }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-900/20">
                    {{ formatCurrency(getDeterioradosDisponible(bovedas[0].id)) }}
                  </td>
                </template>

                <!-- Caja General data -->
                <template v-if="cajasGenerales.length > 0">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ formatCurrency(getDeterioradosMonto(cajasGenerales[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-center border-r-2 border-emerald-300 dark:border-emerald-700 font-mono text-gray-500 dark:text-gray-400 bg-emerald-50/5 dark:bg-emerald-950/2">
                    {{ formatCurrency(getDeterioradosMonto(cajasGenerales[0].id, 'egresos')) }}
                  </td>
                </template>

                <!-- Ventanilla data (Selected) -->
                <template v-if="selectedVentanilla">
                  <td class="p-2 text-center border-r border-gray-150 dark:border-gray-800 font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ formatCurrency(getDeterioradosMonto(selectedVentanilla.id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-center font-mono text-gray-500 dark:text-gray-400 bg-indigo-50/5 dark:bg-indigo-950/2">
                    {{ formatCurrency(getDeterioradosMonto(selectedVentanilla.id, 'egresos')) }}
                  </td>
                </template>
              </tr>

              <!-- TOTAL MONEY ROW (Suma de Subtotales) -->
              <tr class="bg-gray-100 dark:bg-gray-900 font-extrabold border-t-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs select-none">
                <td class="p-4 border-r border-gray-200 dark:border-gray-700 uppercase tracking-wider pl-4 text-sm text-gray-800 dark:text-gray-200">Total General</td>
                
                <!-- Bóveda total subtotal -->
                <template v-if="bovedas.length > 0">
                  <td class="p-2 text-right border-r border-gray-155 dark:border-gray-800 font-mono text-gray-900 dark:text-white pr-3 bg-slate-100/50 dark:bg-slate-900/60">
                    {{ formatCurrency(getTotalSaldoInicialMonto(bovedas[0].id)) }}
                  </td>
                  <td class="p-2 text-right border-r border-gray-155 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-slate-100/50 dark:bg-slate-900/60">
                    {{ formatCurrency(getTotalMontoCaja(bovedas[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right border-r border-gray-155 dark:border-gray-800 font-mono text-red-500 pr-3 bg-slate-100/50 dark:bg-slate-900/60">
                    {{ formatCurrency(getTotalMontoCaja(bovedas[0].id, 'egresos')) }}
                  </td>
                  <td class="p-2 text-right border-r-2 border-slate-300 dark:border-slate-600 font-mono text-slate-950 dark:text-white bg-slate-200/80 dark:bg-slate-900 pr-3">
                    {{ formatCurrency(getTotalSaldoDisponibleMonto(bovedas[0].id)) }}
                  </td>
                </template>

                <!-- Caja General total subtotal -->
                <template v-if="cajasGenerales.length > 0">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-emerald-100/30 dark:bg-emerald-950/20">
                    {{ formatCurrency(getTotalMontoCaja(cajasGenerales[0].id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right border-r-2 border-emerald-300 dark:border-emerald-700 font-mono text-red-500 pr-3 bg-emerald-100/30 dark:bg-emerald-950/20">
                    {{ formatCurrency(getTotalMontoCaja(cajasGenerales[0].id, 'egresos')) }}
                  </td>
                </template>

                <!-- Ventanilla total general (Selected) -->
                <template v-if="selectedVentanilla">
                  <td class="p-2 text-right border-r border-gray-150 dark:border-gray-800 font-mono text-green-600 dark:text-green-455 pr-3 bg-indigo-100/30 dark:bg-indigo-950/20">
                    {{ formatCurrency(getTotalMontoCaja(selectedVentanilla.id, 'ingresos')) }}
                  </td>
                  <td class="p-2 text-right font-mono text-red-500 pr-3 bg-indigo-100/30 dark:bg-indigo-950/20">
                    {{ formatCurrency(getTotalMontoCaja(selectedVentanilla.id, 'egresos')) }}
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- MODAL DE CIERRE DE BÓVEDA -->
    <div v-if="cierreModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-700 max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-white to-red-500/10 dark:from-red-950/20 dark:via-gray-800 dark:to-red-950/20">
          <div class="flex items-center gap-3 text-red-600 dark:text-red-400">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 class="text-xl font-black">Cierre de Jornada - Bóveda Principal</h2>
          </div>
          <button @click="cierreModalOpen = false" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          <div v-if="cierreError" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-800 dark:text-red-300">
            {{ cierreError }}
          </div>

          <div v-if="cierreSuccess" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-bold text-green-800 dark:text-green-300">
            {{ cierreSuccess }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Billetes -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Billetes</h3>
              <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider select-none">
                      <th class="p-3">Denominación</th>
                      <th class="p-3 text-center">Cant. Buena</th>
                      <th class="p-3 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in localBilletesList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white text-sm"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white text-sm"
                        />
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-24">
                        {{ formatCurrency(calculaSubtotal(denom)) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Monedas -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Monedas</h3>
              <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider select-none">
                      <th class="p-3">Denominación</th>
                      <th class="p-3 text-center">Cant. Buena</th>
                      <th class="p-3 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in localMonedasList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white text-sm"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white text-sm"
                        />
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-24">
                        {{ formatCurrency(calculaSubtotal(denom)) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Compartment Consolidation Grid -->
          <div class="mt-6 p-4 bg-slate-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-700/60 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Billetes y Monedas (Físico)</span>
              <span class="text-base font-extrabold text-gray-800 dark:text-gray-200 mt-1 font-mono">
                {{ formatCurrency(totalFisicoBilletesMonedas) }}
              </span>
            </div>
            <div class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cajillas (En Tránsito)</span>
              <span class="text-base font-extrabold text-gray-850 dark:text-gray-200 mt-1 font-mono">
                {{ formatCurrency(bovedas.length > 0 ? getCajillasDisponible(bovedas[0].id) : 0) }}
              </span>
            </div>
            <div class="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Efectivo Deteriorado (Acumulado)</span>
              <span class="text-base font-extrabold text-gray-850 dark:text-gray-200 mt-1 font-mono">
                {{ formatCurrency(bovedas.length > 0 ? getDeterioradosDisponible(bovedas[0].id) : 0) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer / Resumen -->
        <div class="p-6 border-t border-gray-150 dark:border-gray-750 bg-gray-50 dark:bg-gray-850 flex flex-col space-y-4">
          
          <!-- Fila de Entrada de Saldo del Core y Diferencia -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700/60 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Saldo Oficial Core Bancario <span class="text-red-500">*</span></label>
                <input
                  v-model.number="saldoCoreManual"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  class="block w-48 px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-azul-cope text-sm"
                />
              </div>
              
              <!-- Indicador de Diferencia -->
              <div v-if="saldoCoreManual !== null && saldoCoreManual !== ''">
                <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Diferencia (Conciliación)</span>
                <span 
                  class="text-sm font-extrabold px-3 py-1.5 rounded-xl inline-block font-mono"
                  :class="{
                    'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30': diferenciaConciliacion === 0,
                    'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30': diferenciaConciliacion > 0,
                    'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30': diferenciaConciliacion < 0
                  }"
                >
                  <span v-if="diferenciaConciliacion === 0">✓ Saldos Conciliados</span>
                  <span v-else-if="diferenciaConciliacion > 0">Sobrante: + {{ formatCurrency(diferenciaConciliacion) }}</span>
                  <span v-else>Faltante: {{ formatCurrency(diferenciaConciliacion) }}</span>
                </span>
              </div>
            </div>

            <div class="text-right sm:text-left">
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Gran Total Declarado (Bóveda)</span>
              <span class="text-2xl font-black text-azul-cope dark:text-blue-450 font-mono">{{ formatCurrency(granTotalCierre) }}</span>
            </div>
          </div>

          <!-- Acciones de Cierre -->
          <div class="flex justify-end gap-3 pt-2">
            <button @click="cierreModalOpen = false" class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-250 font-bold rounded-xl text-sm transition-all cursor-pointer">
              Cancelar
            </button>
            <button
              :disabled="loadingCierre"
              @click="submitCierreBoveda"
              class="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span v-if="loadingCierre" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Confirmar Cierre de Bóveda
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Inventario Deteriorado -->
  <div v-if="showDeterioradoModal" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
    <div class="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full border border-gray-150 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden max-h-[85vh] transform transition-all duration-300 scale-100">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between bg-amber-500 text-white">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚠️</span>
          <div>
            <h2 class="text-base font-extrabold tracking-wide uppercase">Inventario de Efectivo Deteriorado</h2>
            <p class="text-[10px] text-amber-100 font-semibold uppercase tracking-wider">Desglose físico por denominación</p>
          </div>
        </div>
        <button @click="showDeterioradoModal = false" class="text-white hover:text-amber-150 text-2xl font-bold cursor-pointer focus:outline-none">&times;</button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-4">
        
        <!-- Total informativo -->
        <div class="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex justify-between items-center">
          <span class="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Total Acumulado Deteriorado</span>
          <span class="text-xl font-mono font-black text-amber-700 dark:text-amber-300">{{ formatCurrency(totalMontoDeteriorado) }}</span>
        </div>

        <div v-if="loadingDeterioradoInventario" class="flex flex-col items-center justify-center py-12 gap-3">
          <div class="w-8 h-8 border-3 border-amber-550 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Cargando inventario...</span>
        </div>

        <div v-else-if="deterioradoInventario.length === 0" class="text-center py-12 text-gray-450 dark:text-gray-500 italic text-sm">
          No hay piezas físicas de efectivo deteriorado registradas en el inventario.
        </div>

        <!-- Tabla de Desglose -->
        <div v-else class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
                <th class="p-3 w-1/2">Denominación</th>
                <th class="p-3 text-center">Cantidad (Piezas)</th>
                <th class="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
              <tr v-for="item in deterioradoInventario" :key="item.id" class="hover:bg-slate-50/50 dark:hover:bg-gray-750/30 transition-colors">
                <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                  {{ item.nombre }} ({{ formatCurrency(item.valor) }})
                </td>
                <td class="p-3 text-center font-bold font-mono text-gray-900 dark:text-white">
                  {{ item.cantidad }}
                </td>
                <td class="p-3 text-right font-bold font-mono text-gray-950 dark:text-amber-300">
                  {{ formatCurrency(item.subtotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-150 dark:border-gray-750 bg-gray-55 dark:bg-gray-850 flex justify-end">
        <button @click="showDeterioradoModal = false" class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-250 font-bold rounded-xl text-sm transition-all cursor-pointer">
          Cerrar Vista
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'

interface Caja {
  id: number
  nombre: string
  tipo_caja: 'boveda' | 'general' | 'ventanilla'
  estado: boolean
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
}

interface FilaMatriz {
  saldo_inicial_cantidad: number
  ingresos_cantidad: number
  ingresos_monto: number
  egresos_cantidad: number
  egresos_monto: number
  deteriorado_ingreso_cantidad: number
  deteriorado_egreso_cantidad: number
}

interface FlujoEspecial {
  saldo_inicial: number
  ingresos: number
  egresos: number
}

// State
const loading = ref(true)
const error = ref('')
const fechaHoy = ref('')
const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const matriz = ref<Record<number, Record<number, FilaMatriz>>>({})
const totalesCajillas = ref<Record<number, FlujoEspecial>>({})
const totalesDeteriorados = ref<Record<number, FlujoEspecial>>({})
const selectedVentanillaId = ref<number | null>(null)

// Cierre Bóveda States
const bovedaCerradaHoy = ref(false)
const cierreModalOpen = ref(false)
const loadingCierre = ref(false)
const cierreError = ref('')
const cierreSuccess = ref('')
const localBilletesList = ref<any[]>([])
const localMonedasList = ref<any[]>([])
const saldoCoreManual = ref<number | ''>('')

// Inventario Deteriorado States
const showDeterioradoModal = ref(false)
const loadingDeterioradoInventario = ref(false)
const deterioradoInventario = ref<any[]>([])

const totalMontoDeteriorado = computed(() => {
  return deterioradoInventario.value.reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const diferenciaConciliacion = computed(() => {
  if (saldoCoreManual.value === '' || saldoCoreManual.value === null) return 0
  return Number(granTotalCierre.value) - Number(saldoCoreManual.value)
})

// Computeds por tipo
const bovedas = computed(() => cajas.value.filter(c => c.tipo_caja === 'boveda'))
const cajasGenerales = computed(() => cajas.value.filter(c => c.tipo_caja === 'general'))
const ventanillas = computed(() => cajas.value.filter(c => c.tipo_caja === 'ventanilla'))

// Selected ventanilla object
const selectedVentanilla = computed(() => {
  return ventanillas.value.find(v => v.id === selectedVentanillaId.value) || null
})

// Listas filtradas
const billetes = computed(() => denominaciones.value.filter(d => d.tipo === 'billete'))
const monedas = computed(() => denominaciones.value.filter(d => d.tipo === 'moneda'))

// Cantidad de columnas dinámicas para los headers separadores
const columnCount = computed(() => {
  let count = 1 // Label column
  if (bovedas.value.length > 0) count += 4
  if (cajasGenerales.value.length > 0) count += 2
  if (selectedVentanilla.value) count += 2
  return count
})

// Helpers de lookup
const getCantidadMatriz = (cajaId: number, denomId: number, tipo: 'ingresos' | 'egresos'): number => {
  const row = matriz.value[cajaId]?.[denomId]
  if (!row) return 0
  return tipo === 'ingresos' ? row.ingresos_cantidad : row.egresos_cantidad
}

const getSaldoInicialCantidad = (cajaId: number, denomId: number): number => {
  const row = matriz.value[cajaId]?.[denomId]
  return row ? row.saldo_inicial_cantidad : 0
}

const getSaldoDisponibleCantidad = (cajaId: number, denomId: number): number => {
  const row = matriz.value[cajaId]?.[denomId]
  if (!row) return 0
  return row.saldo_inicial_cantidad + row.ingresos_cantidad - row.egresos_cantidad
}

const getTotalSaldoInicialMonto = (cajaId: number): number => {
  let total = 0
  denominaciones.value.forEach(d => {
    const cant = getSaldoInicialCantidad(cajaId, d.id)
    total += cant * d.valor
  })
  const caja = cajas.value.find(c => c.id === cajaId)
  if (caja && (caja.tipo_caja === 'boveda' || caja.tipo_caja === 'ventanilla')) {
    total += getCajillasSaldoInicial(cajaId)
    total += getDeterioradosSaldoInicial(cajaId)
  }
  return total
}

const getTotalSaldoDisponibleMonto = (cajaId: number): number => {
  let total = 0
  denominaciones.value.forEach(d => {
    const cant = getSaldoDisponibleCantidad(cajaId, d.id)
    total += cant * d.valor
  })
  const caja = cajas.value.find(c => c.id === cajaId)
  if (caja && (caja.tipo_caja === 'boveda' || caja.tipo_caja === 'ventanilla')) {
    total += getCajillasDisponible(cajaId)
    total += getDeterioradosDisponible(cajaId)
  }
  return total
}

// Helpers para Cajillas y Deteriorado
const getCajillasMonto = (cajaId: number, tipo: 'ingresos' | 'egresos'): number => {
  return Number(totalesCajillas.value[cajaId]?.[tipo]) || 0
}

const getCajillasSaldoInicial = (cajaId: number): number => {
  return Number(totalesCajillas.value[cajaId]?.['saldo_inicial']) || 0
}

const getCajillasDisponible = (cajaId: number): number => {
  return getCajillasSaldoInicial(cajaId) + getCajillasMonto(cajaId, 'ingresos') - getCajillasMonto(cajaId, 'egresos')
}


const getDeterioradosMonto = (cajaId: number, tipo: 'ingresos' | 'egresos'): number => {
  return Number(totalesDeteriorados.value[cajaId]?.[tipo]) || 0
}

const getDeterioradosSaldoInicial = (cajaId: number): number => {
  return Number(totalesDeteriorados.value[cajaId]?.['saldo_inicial']) || 0
}

const getDeterioradosDisponible = (cajaId: number): number => {
  return getDeterioradosSaldoInicial(cajaId) + getDeterioradosMonto(cajaId, 'ingresos') - getDeterioradosMonto(cajaId, 'egresos')
}

const getBilletesSaldoInicialMonto = (cajaId: number): number => {
  let total = 0
  billetes.value.forEach(d => {
    total += getSaldoInicialCantidad(cajaId, d.id) * d.valor
  })
  return total
}

const getBilletesMontoCaja = (cajaId: number, tipo: 'ingresos' | 'egresos'): number => {
  let total = 0
  billetes.value.forEach(d => {
    const row = matriz.value[cajaId]?.[d.id]
    if (row) {
      total += tipo === 'ingresos' ? Number(row.ingresos_monto) : Number(row.egresos_monto)
    }
  })
  return total
}

const getBilletesSaldoDisponibleMonto = (cajaId: number): number => {
  let total = 0
  billetes.value.forEach(d => {
    total += getSaldoDisponibleCantidad(cajaId, d.id) * d.valor
  })
  return total
}

const getMonedasSaldoInicialMonto = (cajaId: number): number => {
  let total = 0
  monedas.value.forEach(d => {
    total += getSaldoInicialCantidad(cajaId, d.id) * d.valor
  })
  return total
}

const getMonedasMontoCaja = (cajaId: number, tipo: 'ingresos' | 'egresos'): number => {
  let total = 0
  monedas.value.forEach(d => {
    const row = matriz.value[cajaId]?.[d.id]
    if (row) {
      total += tipo === 'ingresos' ? Number(row.ingresos_monto) : Number(row.egresos_monto)
    }
  })
  return total
}

const getMonedasSaldoDisponibleMonto = (cajaId: number): number => {
  let total = 0
  monedas.value.forEach(d => {
    total += getSaldoDisponibleCantidad(cajaId, d.id) * d.valor
  })
  return total
}

const getTotalMontoCaja = (cajaId: number, tipo: 'ingresos' | 'egresos'): number => {
  let total = 0
  denominaciones.value.forEach(d => {
    const row = matriz.value[cajaId]?.[d.id]
    if (row) {
      total += tipo === 'ingresos' ? Number(row.ingresos_monto) : Number(row.egresos_monto)
    }
  })
  const caja = cajas.value.find(c => c.id === cajaId)
  if (caja && (caja.tipo_caja === 'boveda' || caja.tipo_caja === 'ventanilla')) {
    total += getCajillasMonto(cajaId, tipo)
    total += getDeterioradosMonto(cajaId, tipo)
  }
  return total
}

const calculaSubtotal = (denom: any): number => {
  const buena = Number(denom.cantidad_buena) || 0
  const deteriorada = Number(denom.cantidad_deteriorada) || 0
  return (buena + deteriorada) * denom.valor
}

const totalFisicoBilletesMonedas = computed(() => {
  let total = 0
  localBilletesList.value.forEach(d => {
    total += calculaSubtotal(d)
  })
  localMonedasList.value.forEach(d => {
    total += calculaSubtotal(d)
  })
  return total
})

const granTotalCierre = computed(() => {
  const boveda = bovedas.value[0]
  if (!boveda) return totalFisicoBilletesMonedas.value
  return totalFisicoBilletesMonedas.value + getCajillasDisponible(boveda.id) + getDeterioradosDisponible(boveda.id)
})

const openCierreBovedaModal = async () => {
  const boveda = bovedas.value[0]
  if (!boveda) return

  cierreError.value = ''
  cierreSuccess.value = ''
  saldoCoreManual.value = '' // Reiniciar el input de saldo manual
  
  // Inicializar listas locales
  localBilletesList.value = billetes.value.map(d => ({
    ...d,
    cantidad_buena: 0,
    cantidad_deteriorada: 0
  }))
  localMonedasList.value = monedas.value.map(d => ({
    ...d,
    cantidad_buena: 0,
    cantidad_deteriorada: 0
  }))

  try {
    // Intentar obtener conteo/arqueo de hoy si existe para precargar datos
    const conteoRes = await axios.get(`/cajas/conteos-parciales?caja_id=${boveda.id}`)
    const conteos = conteoRes.data
    
    if (conteos && conteos.length > 0) {
      const activeArqueo = conteos[0]
      const mergeConteo = (list: any[]) => {
        list.forEach(d => {
          const detBueno = activeArqueo.detalles.find((det: any) => det.denominacion_id === d.id && det.estado_dinero === 'bueno')
          const detDet = activeArqueo.detalles.find((det: any) => det.denominacion_id === d.id && det.estado_dinero === 'deteriorado')
          d.cantidad_buena = detBueno ? detBueno.cantidad : 0
          d.cantidad_deteriorada = detDet ? detDet.cantidad : 0
        })
      }
      mergeConteo(localBilletesList.value)
      mergeConteo(localMonedasList.value)
    } else {
      // Si no hay arqueo previo, precargar de los balances del Dashboard (matriz)
      const mergeMatriz = (list: any[]) => {
        list.forEach(d => {
          d.cantidad_buena = getSaldoDisponibleCantidad(boveda.id, d.id)
          const row = matriz.value[boveda.id]?.[d.id]
          d.cantidad_deteriorada = row ? row.deteriorado_ingreso_cantidad : 0
        })
      }
      mergeMatriz(localBilletesList.value)
      mergeMatriz(localMonedasList.value)
    }
    
    cierreModalOpen.value = true
  } catch (err: any) {
    cierreError.value = 'Error al cargar balances o saldos del sistema.'
    cierreModalOpen.value = true
  }
}

const submitCierreBoveda = async () => {
  const boveda = bovedas.value[0]
  if (!boveda) return

  if (saldoCoreManual.value === '' || saldoCoreManual.value === null || isNaN(Number(saldoCoreManual.value))) {
    cierreError.value = 'Por favor, ingrese el Saldo Oficial del Core Bancario para la conciliación antes de cerrar.'
    return
  }

  loadingCierre.value = true
  cierreError.value = ''
  cierreSuccess.value = ''

  // Consolidar detalles
  const detalles: any[] = []
  const pushDetalles = (list: any[]) => {
    list.forEach(d => {
      detalles.push({
        denominacion_id: d.id,
        estado_dinero: 'bueno',
        cantidad: Number(d.cantidad_buena) || 0
      })
      detalles.push({
        denominacion_id: d.id,
        estado_dinero: 'deteriorado',
        cantidad: Number(d.cantidad_deteriorada) || 0
      })
    })
  }

  pushDetalles(localBilletesList.value)
  pushDetalles(localMonedasList.value)

  try {
    await axios.post('/cierres-diarios', {
      caja_id: boveda.id,
      detalles: detalles
    })
    
    cierreSuccess.value = '¡Bóveda cerrada exitosamente para el día de hoy!'
    bovedaCerradaHoy.value = true
    setTimeout(() => {
      cierreModalOpen.value = false
      fetchData()
    }, 1500)
  } catch (err: any) {
    cierreError.value = err.response?.data?.message || 'Error al ejecutar el cierre de la Bóveda.'
  } finally {
    loadingCierre.value = false
  }
}

const openInventarioDeteriorado = async (cajaId: number) => {
  showDeterioradoModal.value = true
  loadingDeterioradoInventario.value = true
  deterioradoInventario.value = []
  
  try {
    const res = await axios.get(`/cajas/${cajaId}/inventario-deteriorado`)
    deterioradoInventario.value = res.data
  } catch (err) {
    console.error('Error al cargar inventario deteriorado:', err)
  } finally {
    loadingDeterioradoInventario.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/reportes/dashboard-general')
    fechaHoy.value = res.data.fecha
    cajas.value = res.data.cajas
    denominaciones.value = res.data.denominaciones
    matriz.value = res.data.matriz
    totalesCajillas.value = res.data.totales_cajillas || {}
    totalesDeteriorados.value = res.data.totales_deteriorados || {}
    bovedaCerradaHoy.value = res.data.boveda_cerrada_hoy || false

    // Seleccionar la primera ventanilla por defecto si hay
    const vList = cajas.value.filter(c => c.tipo_caja === 'ventanilla')
    if (vList.length > 0 && selectedVentanillaId.value === null) {
      selectedVentanillaId.value = vList[0].id
    }
  } catch (err: any) {
    error.value = 'No se pudo cargar el Dashboard Consolidado.'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
