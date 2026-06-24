<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Libro Mayor de Movimientos
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Registra e inspecciona traslados, dotaciones, remesas y excedentes de efectivo entre cajas y bóvedas.
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center px-4 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-verde-cope/50 gap-2 text-sm cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
          Registrar Movimiento
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Filtro Caja Origen -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Caja/Bóveda Origen</label>
          <select
            v-model="filters.origen_caja_id"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
          >
            <option value="">Cualquier origen</option>
            <option v-for="caja in cajas" :key="caja.id" :value="caja.id">
              {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }})
            </option>
          </select>
        </div>

        <!-- Filtro Caja Destino -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Caja/Bóveda Destino</label>
          <select
            v-model="filters.destino_caja_id"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
          >
            <option value="">Cualquier destino</option>
            <option v-for="caja in cajas" :key="caja.id" :value="caja.id">
              {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }})
            </option>
          </select>
        </div>

        <!-- Fecha Desde -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Desde</label>
          <input
            v-model="filters.fecha_desde"
            type="date"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
          />
        </div>

        <!-- Fecha Hasta -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Hasta</label>
          <input
            v-model="filters.fecha_hasta"
            type="date"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
        <button
          @click="resetFilters"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-55 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
        >
          Limpiar Filtros
        </button>
        <button
          @click="fetchMovimientos"
          class="px-4 py-2 bg-azul-cope hover:bg-azul-cope/90 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
        >
          Filtrar / Buscar
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Cargando movimientos...</p>
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
          @click="fetchMovimientos"
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
    <div v-else-if="movimientos.length === 0" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm max-w-lg mx-auto">
      <div class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-400 dark:text-gray-600">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-800 dark:text-white">No se registraron movimientos</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Aún no hay transacciones en el Libro Mayor o ninguna coincide con los filtros aplicados.
      </p>
      <button
        @click="openCreateModal"
        class="mt-6 inline-flex items-center justify-center px-4 py-2 bg-azul-cope hover:bg-azul-cope/90 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        Registrar Primer Traslado
      </button>
    </div>

    <!-- Table of movements -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-all">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-150 dark:border-gray-750 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="p-4">Folio ID</th>
              <th class="p-4">Fecha / Hora</th>
              <th class="p-4">Origen</th>
              <th class="p-4">Destino</th>
              <th class="p-4">Operación / Categoría</th>
              <th class="p-4">Autorizado Por</th>
              <th class="p-4 text-right">Monto Total</th>
              <th class="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
            <tr
              v-for="mov in movimientos"
              :key="mov.id"
              class="hover:bg-gray-55/50 dark:hover:bg-gray-750/30 transition-colors"
            >
              <td class="p-4 font-mono font-bold text-gray-900 dark:text-white">
                #{{ String(mov.id).padStart(6, '0') }}
              </td>
              <td class="p-4 text-gray-600 dark:text-gray-300">
                {{ formatDateTime(mov.fecha_transaccion) }}
              </td>
              <td class="p-4">
                <div v-if="mov.origen_caja" class="flex flex-col">
                  <span class="font-bold text-gray-900 dark:text-white">{{ mov.origen_caja.nombre }}</span>
                  <span class="text-xs text-gray-450 dark:text-gray-500">{{ mov.origen_caja.agencia?.nombre }}</span>
                </div>
                <span v-else class="text-xs italic text-gray-450 dark:text-gray-500">Externo (Ej. Banco)</span>
              </td>
              <td class="p-4">
                <div v-if="mov.destino_caja" class="flex flex-col">
                  <span class="font-bold text-gray-900 dark:text-white">{{ mov.destino_caja.nombre }}</span>
                  <span class="text-xs text-gray-450 dark:text-gray-500">{{ mov.destino_caja.agencia?.nombre }}</span>
                </div>
                <span v-else class="text-xs italic text-gray-450 dark:text-gray-500">Externo (Ej. Banco)</span>
              </td>
              <td class="p-4">
                <div class="flex flex-col gap-1 items-start">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                    :class="mov.tipo_operacion === 'ingreso' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30'"
                  >
                    {{ mov.tipo_operacion }}
                  </span>
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {{ formatCategoria(mov.categoria_movimiento) }}
                  </span>
                </div>
              </td>
              <td class="p-4 text-gray-650 dark:text-gray-300">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-azul-cope/10 text-azul-cope dark:bg-blue-900/25 dark:text-blue-400 flex items-center justify-center font-bold text-xs shadow-sm">
                    {{ mov.usuario?.name?.charAt(0).toUpperCase() || 'S' }}
                  </div>
                  <span>{{ mov.usuario?.name || 'Sistema JIT' }}</span>
                </div>
              </td>
              <td class="p-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(mov.monto_total) }}
              </td>
              <td class="p-4 text-center">
                <button
                  @click="openDetailsModal(mov)"
                  class="p-2 text-gray-500 hover:text-azul-cope dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  title="Ver desglose detallado"
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

    <!-- MODAL DETALLE DE MOVIMIENTO (Modularizado) -->
    <DetalleMovimientoModal
      :is-open="detailsModalOpen"
      :movimiento="selectedMovimiento"
      @close="detailsModalOpen = false"
    />

    <!-- MODAL DE CREACIÓN / REGISTRO DE TRASLADO (Modularizado) -->
    <RegistrarMovimientoModal
      :is-open="createModalOpen"
      :cajas="cajas"
      :denominaciones="denominaciones"
      @close="createModalOpen = false"
      @success="handleRegistrationSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'

// Componentes modularizados
import DetalleMovimientoModal from './components/DetalleMovimientoModal.vue'
import RegistrarMovimientoModal from './components/RegistrarMovimientoModal.vue'

interface Agencia {
  id: number
  nombre: string
}

interface Caja {
  id: number
  nombre: string
  tipo_caja: 'boveda' | 'general' | 'ventanilla'
  estado: boolean
  agencia?: Agencia
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
}

interface MovimientoDetalle {
  id: number
  denominacion_id: number
  cantidad: number
  subtotal: number
  estado_dinero: 'bueno' | 'deteriorado'
  denominacion?: Denominacion
}

interface Usuario {
  id: number
  name: string
}

interface Movimiento {
  id: number
  origen_caja_id: number | null
  destino_caja_id: number | null
  tipo_operacion: 'ingreso' | 'egreso'
  categoria_movimiento: string
  monto_total: number
  descripcion: string | null
  fecha_transaccion: string
  origen_caja?: Caja
  destino_caja?: Caja
  usuario?: Usuario
  detalles?: MovimientoDetalle[]
}

// State
const movimientos = ref<Movimiento[]>([])
const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const loading = ref(true)
const error = ref('')

// Filtros
const filters = ref({
  origen_caja_id: '',
  destino_caja_id: '',
  fecha_desde: '',
  fecha_hasta: ''
})

// Modales de control
const detailsModalOpen = ref(false)
const selectedMovimiento = ref<Movimiento | null>(null)
const createModalOpen = ref(false)

// Lógica de carga
const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    cajas.value = cajasRes.data
    denominaciones.value = denomsRes.data.filter((d: any) => d.activo)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al conectar con el servidor.'
  } finally {
    loading.value = false
  }
}

const fetchMovimientos = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.origen_caja_id) params.origen_caja_id = filters.value.origen_caja_id
    if (filters.value.destino_caja_id) params.destino_caja_id = filters.value.destino_caja_id
    if (filters.value.fecha_desde) params.fecha_desde = filters.value.fecha_desde
    if (filters.value.fecha_hasta) params.fecha_hasta = filters.value.fecha_hasta

    const res = await axios.get('/movimientos', { params })
    movimientos.value = res.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cargar el Libro Mayor.'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  createModalOpen.value = true
}

const openDetailsModal = (mov: Movimiento) => {
  selectedMovimiento.value = mov
  detailsModalOpen.value = true
}

const handleRegistrationSuccess = async () => {
  createModalOpen.value = false
  await fetchMovimientos()
}

const resetFilters = () => {
  filters.value = {
    origen_caja_id: '',
    destino_caja_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  }
  fetchMovimientos()
}

const formatTipo = (tipo: string) => {
  if (tipo === 'boveda') return 'Bóveda'
  if (tipo === 'general') return 'Caja General'
  return 'Ventanilla'
}

const formatCategoria = (cat: string) => {
  if (cat === 'billetes') return 'Billetes'
  if (cat === 'monedas') return 'Monedas'
  if (cat === 'cajilla') return 'Cajilla'
  if (cat === 'deteriorados') return 'Deteriorados'
  return cat
}

const formatCurrency = (val: number | undefined) => {
  if (val === undefined) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(async () => {
  await fetchData()
  await fetchMovimientos()
})
</script>

<style scoped>
/* Estilos generales */
</style>
