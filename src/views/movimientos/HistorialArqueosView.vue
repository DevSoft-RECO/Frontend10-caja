<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Historial de Arqueos de Caja
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Supervisión y auditoría de conteos físicos parciales registrados por los cajeros y ventanillas de la agencia.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="fetchArqueos"
          class="inline-flex items-center justify-center px-4 py-2.5 bg-azul-cope hover:bg-azul-cope/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 gap-2 text-xs cursor-pointer"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <!-- KPIs / Tarjetas de Resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Arqueos</p>
          <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ arqueosFiltrados.length }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-azul-cope/20 text-azul-cope dark:text-blue-400 flex items-center justify-center text-xl font-bold">
          📋
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Monto Total Auditado</p>
          <p class="text-2xl font-black text-verde-cope dark:text-emerald-400 mt-1 font-mono">{{ formatCurrency(totalMontoFisico) }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-verde-cope dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
          💰
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ventanillas Auditadas</p>
          <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ totalCajasAuditadas }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
          🏦
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Último Registro</p>
          <p class="text-xs font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]">
            {{ ultimoArqueoHora || 'Sin registros' }}
          </p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
          🕒
        </div>
      </div>
    </div>

    <!-- Barra de Filtros -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Filtro Caja / Ventanilla -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Ventanilla</label>
          <select
            v-model="filters.caja_id"
            @change="fetchArqueos"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
          >
            <option value="">Todas las Ventanillas de la Agencia</option>
            <option v-for="caja in cajasAgencia" :key="caja.id" :value="caja.id">
              {{ caja.nombre }} (Turno: {{ caja.usuario_en_turno?.name || 'Sin Cajero' }})
            </option>
          </select>
        </div>

        <!-- Filtro Fecha Desde -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Desde</label>
          <input
            v-model="filters.fecha_desde"
            type="date"
            @change="fetchArqueos"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
          />
        </div>

        <!-- Filtro Fecha Hasta -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Hasta</label>
          <input
            v-model="filters.fecha_hasta"
            type="date"
            @change="fetchArqueos"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
          />
        </div>

        <!-- Búsqueda Rápida de Cajero -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Buscar Cajero / Caja</label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nombre del cajero o caja..."
              class="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60 gap-3">
        <!-- Accesos rápidos de fecha -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Período:</span>
          <button
            type="button"
            @click="setPeriodo('hoy')"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              periodoActivo === 'hoy'
                ? 'bg-azul-cope text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            ]"
          >
            Hoy
          </button>
          <button
            type="button"
            @click="setPeriodo('semana')"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              periodoActivo === 'semana'
                ? 'bg-azul-cope text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            ]"
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            @click="setPeriodo('mes')"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              periodoActivo === 'mes'
                ? 'bg-azul-cope text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            ]"
          >
            Este Mes
          </button>
          <button
            type="button"
            @click="setPeriodo('todos')"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              periodoActivo === 'todos'
                ? 'bg-azul-cope text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            ]"
          >
            Todo el Historial
          </button>
        </div>

        <button
          @click="resetFilters"
          class="px-3.5 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Cargando bitácora de arqueos...</p>
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
          @click="fetchArqueos"
          class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-800 dark:text-red-300 hover:underline cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="arqueosFiltrados.length === 0" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-16 text-center shadow-sm max-w-lg mx-auto space-y-3">
      <span class="text-4xl">📭</span>
      <h3 class="text-lg font-bold text-gray-800 dark:text-white">Sin arqueos registrados</h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        No se encontraron registros de arqueos físicos con los filtros seleccionados.
      </p>
    </div>

    <!-- Tabla Principal de Arqueos -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden transition-all">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              <th class="p-4"># ID</th>
              <th class="p-4">Fecha y Hora</th>
              <th class="p-4">Ventanilla</th>
              <th class="p-4">Agencia</th>
              <th class="p-4">Cajero / Auditor</th>
              <th class="p-4 text-right">Total Físico Declarado</th>
              <th class="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
            <tr
              v-for="item in arqueosFiltrados"
              :key="item.id"
              class="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="p-4 font-mono font-bold text-gray-900 dark:text-white">
                #{{ String(item.id).padStart(5, '0') }}
              </td>
              <td class="p-4 text-gray-700 dark:text-gray-300">
                <div class="flex flex-col">
                  <span class="font-bold text-gray-900 dark:text-white">{{ formatFecha(item.fecha_hora) }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <span>🕒</span> {{ formatHora(item.fecha_hora) }}
                  </span>
                </div>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-azul-cope"></span>
                  <div>
                    <span class="font-bold text-gray-900 dark:text-white">{{ item.caja?.nombre || `Ventanilla #${item.caja_id}` }}</span>
                    <span class="block text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                      Ventanilla
                    </span>
                  </div>
                </div>
              </td>
              <td class="p-4 text-gray-600 dark:text-gray-300">
                <span class="font-medium">{{ item.caja?.agencia?.nombre || 'Agencia Central' }}</span>
              </td>
              <td class="p-4 text-gray-700 dark:text-gray-300">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-azul-cope/10 text-azul-cope dark:bg-azul-cope/30 dark:text-blue-300 flex items-center justify-center font-bold text-xs shadow-xs">
                    {{ item.usuario?.name?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <span class="font-medium">{{ item.usuario?.name || 'Sistema' }}</span>
                </div>
              </td>
              <td class="p-4 text-right font-mono font-black text-gray-900 dark:text-white text-base">
                {{ formatCurrency(Number(item.total_fisico_declarado)) }}
              </td>
              <td class="p-4 text-center">
                <button
                  @click="abrirDetalle(item)"
                  class="p-2 text-gray-500 hover:text-azul-cope dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  title="Ver desglose detallado de denominaciones"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DETALLE DE ARQUEO -->
    <Transition name="fade">
      <div v-if="modalOpen && selectedArqueo" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <!-- Header Modal -->
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0 bg-azul-cope text-white">
            <div>
              <h2 class="text-lg font-bold text-white">
                Detalle de Arqueo Físico #{{ String(selectedArqueo.id).padStart(5, '0') }}
              </h2>
              <p class="text-xs text-blue-100 mt-0.5">
                {{ selectedArqueo.caja?.nombre }} — {{ formatFecha(selectedArqueo.fecha_hora) }} {{ formatHora(selectedArqueo.fecha_hora) }}
              </p>
            </div>
            <button
              @click="cerrarDetalle"
              class="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body Modal -->
          <div class="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            <!-- Metadata Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs">
              <div>
                <span class="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Cajero en Turno</span>
                <span class="font-extrabold text-gray-900 dark:text-white mt-1 block">{{ selectedArqueo.usuario?.name || 'Sistema' }}</span>
              </div>
              <div>
                <span class="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Agencia</span>
                <span class="font-extrabold text-gray-900 dark:text-white mt-1 block">{{ selectedArqueo.caja?.agencia?.nombre || 'Agencia Central' }}</span>
              </div>
              <div>
                <span class="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Físico</span>
                <span class="font-mono font-black text-azul-cope dark:text-blue-400 text-base mt-0.5 block">
                  {{ formatCurrency(Number(selectedArqueo.total_fisico_declarado)) }}
                </span>
              </div>
            </div>

            <!-- Tabla de desglose de denominaciones -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Desglose de Denominaciones Declaradas
              </h3>

              <div class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3">Denominación</th>
                      <th class="p-3 text-center">Tipo</th>
                      <th class="p-3 text-center">Estado Dinero</th>
                      <th class="p-3 text-center">Cantidad</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60">
                    <tr
                      v-for="det in selectedArqueo.detalles"
                      :key="det.id"
                      class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                    >
                      <td class="p-3 font-bold text-gray-900 dark:text-white">
                        {{ det.denominacion?.nombre || `Denom #${det.denominacion_id}` }}
                      </td>
                      <td class="p-3 text-center capitalize text-gray-500 dark:text-gray-400">
                        {{ det.denominacion?.tipo || '-' }}
                      </td>
                      <td class="p-3 text-center">
                        <span
                          :class="[
                            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            det.estado_dinero === 'bueno'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          ]"
                        >
                          {{ det.estado_dinero }}
                        </span>
                      </td>
                      <td class="p-3 text-center font-mono font-bold text-gray-800 dark:text-gray-200">
                        {{ det.cantidad }}
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {{ formatCurrency(Number(det.subtotal)) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="bg-gray-50 dark:bg-gray-900 font-bold border-t border-gray-200 dark:border-gray-700">
                      <td colspan="4" class="p-3 text-right uppercase tracking-wider text-gray-500">
                        Total Declarado:
                      </td>
                      <td class="p-3 text-right font-mono font-black text-azul-cope dark:text-blue-400 text-sm">
                        {{ formatCurrency(Number(selectedArqueo.total_fisico_declarado)) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer Modal -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end shrink-0">
            <button
              @click="cerrarDetalle"
              class="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

interface User {
  id: number
  name: string
}

interface Agencia {
  id: number
  nombre: string
}

interface Caja {
  id: number
  nombre: string
  tipo_caja: 'boveda' | 'general' | 'ventanilla'
  estado: boolean
  agencia_id?: number
  agencia?: Agencia
  usuario_en_turno?: User
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
}

interface ConteoParcialDetalle {
  id: number
  conteo_parcial_id: number
  denominacion_id: number
  estado_dinero: 'bueno' | 'deteriorado'
  cantidad: number
  subtotal: number | string
  denominacion?: Denominacion
}

interface ConteoParcialItem {
  id: number
  caja_id: number
  usuario_id: number
  fecha_hora: string
  total_fisico_declarado: number | string
  caja?: Caja
  usuario?: User
  detalles: ConteoParcialDetalle[]
}

// State
const arqueos = ref<ConteoParcialItem[]>([])
const cajasAgencia = ref<Caja[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const periodoActivo = ref<'hoy' | 'semana' | 'mes' | 'todos'>('hoy')

// Filtros
const filters = ref({
  caja_id: '',
  fecha_desde: new Date().toISOString().split('T')[0],
  fecha_hasta: new Date().toISOString().split('T')[0]
})

// Modal
const modalOpen = ref(false)
const selectedArqueo = ref<ConteoParcialItem | null>(null)

const authStore = useAuthStore()

// Métodos de período rápido
const setPeriodo = (periodo: 'hoy' | 'semana' | 'mes' | 'todos') => {
  periodoActivo.value = periodo
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  if (periodo === 'hoy') {
    filters.value.fecha_desde = todayStr
    filters.value.fecha_hasta = todayStr
  } else if (periodo === 'semana') {
    const semanaAtras = new Date()
    semanaAtras.setDate(today.getDate() - 7)
    filters.value.fecha_desde = semanaAtras.toISOString().split('T')[0]
    filters.value.fecha_hasta = todayStr
  } else if (periodo === 'mes') {
    const mesInicio = new Date(today.getFullYear(), today.getMonth(), 1)
    filters.value.fecha_desde = mesInicio.toISOString().split('T')[0]
    filters.value.fecha_hasta = todayStr
  } else if (periodo === 'todos') {
    filters.value.fecha_desde = ''
    filters.value.fecha_hasta = ''
  }

  fetchArqueos()
}

// Cargar catálogo de cajas de la agencia (únicamente ventanillas)
const fetchCajas = async () => {
  try {
    const userAgencia = authStore.user?.agencia_id || authStore.user?.id_agencia || authStore.user?.agencia?.id
    const params: any = {}
    if (!authStore.hasRole('Super Admin') && userAgencia) {
      params.agencia_id = userAgencia
    }
    const res = await axios.get('/cajas', { params })
    // Filtrar estrictamente ventanillas, ignorando Bóvedas y Cajas Generales
    cajasAgencia.value = res.data.filter((c: any) => c.tipo_caja === 'ventanilla')
  } catch (err) {
    console.error('Error al cargar cajas:', err)
  }
}

// Cargar listado de arqueos desde la función de auditoría aislada
const fetchArqueos = async () => {
  loading.value = true
  error.value = ''

  try {
    const userAgencia = authStore.user?.agencia_id || authStore.user?.id_agencia || authStore.user?.agencia?.id
    const params: any = {}

    if (!authStore.hasRole('Super Admin') && userAgencia) {
      params.agencia_id = userAgencia
    }

    if (filters.value.caja_id) {
      params.caja_id = filters.value.caja_id
    }

    if (filters.value.fecha_desde && filters.value.fecha_hasta) {
      params.fecha_desde = filters.value.fecha_desde
      params.fecha_hasta = filters.value.fecha_hasta
    } else if (filters.value.fecha_desde) {
      params.fecha_desde = filters.value.fecha_desde
    } else if (filters.value.fecha_hasta) {
      params.fecha_hasta = filters.value.fecha_hasta
    }

    const res = await axios.get('/cajas/conteos-parciales/historial', { params })
    arqueos.value = res.data || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al conectar con el servidor para consultar el historial de arqueos.'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    caja_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  }
  searchQuery.value = ''
  periodoActivo.value = 'todos'
  fetchArqueos()
}

// Filtro en cliente por buscador de texto
const arqueosFiltrados = computed(() => {
  if (!searchQuery.value.trim()) return arqueos.value

  const q = searchQuery.value.toLowerCase().trim()
  return arqueos.value.filter(item => {
    const cajero = item.usuario?.name?.toLowerCase() || ''
    const caja = item.caja?.nombre?.toLowerCase() || ''
    const id = String(item.id)
    return cajero.includes(q) || caja.includes(q) || id.includes(q)
  })
})

// Cálculos de KPIs
const totalMontoFisico = computed(() => {
  return arqueosFiltrados.value.reduce((acc, item) => acc + Number(item.total_fisico_declarado || 0), 0)
})

const totalCajasAuditadas = computed(() => {
  const set = new Set(arqueosFiltrados.value.map(i => i.caja_id))
  return set.size
})

const ultimoArqueoHora = computed(() => {
  if (arqueosFiltrados.value.length === 0) return ''
  const item = arqueosFiltrados.value[0]
  return `${formatFecha(item.fecha_hora)} ${formatHora(item.fecha_hora)}`
})

// Acciones de modal
const abrirDetalle = (item: ConteoParcialItem) => {
  selectedArqueo.value = item
  modalOpen.value = true
}

const cerrarDetalle = () => {
  modalOpen.value = false
  selectedArqueo.value = null
}

// Formatters
const formatCurrency = (val: number | undefined) => {
  if (val === undefined || isNaN(val)) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const formatFecha = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatHora = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

onMounted(async () => {
  await Promise.all([
    fetchCajas(),
    fetchArqueos()
  ])
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
