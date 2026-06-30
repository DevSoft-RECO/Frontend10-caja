<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Reporte Histórico de Cierres
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Supervisa el historial de arqueos y cierres de cajas, identificando desviaciones o descuadres con auditorías visuales.
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <!-- Filtro Caja -->
        <select
          v-model="filterCaja"
          @change="fetchCierres"
          class="block w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
        >
          <option value="">Todas las Cajas / Bóvedas</option>
          <option v-for="caja in cajas" :key="caja.id" :value="caja.id">
            {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }})
          </option>
        </select>
      </div>

      <div class="text-xs text-gray-500 dark:text-gray-450">
        Total registros: <span class="font-bold text-gray-800 dark:text-white">{{ cierres.length }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Cargando reportes...</p>
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
          @click="fetchCierres"
          class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-800 dark:text-red-300 hover:underline cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="cierres.length === 0" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm max-w-lg mx-auto">
      <h3 class="text-lg font-bold text-gray-800 dark:text-white">Sin cierres registrados</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Aún no hay registros de cierre en la base de datos para esta selección.
      </p>
    </div>

    <!-- Table of closures -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden transition-all">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-55 dark:bg-gray-900/60 border-b border-gray-150 dark:border-gray-750 text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">
              <th class="p-4">ID</th>
              <th class="p-4">Fecha Cierre</th>
              <th class="p-4">Caja / Bóveda</th>
              <th class="p-4">Cajero</th>
              <th class="p-4 text-right">Físico Gaveta Declarado</th>
              <th class="p-4 text-center">Detalles</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
            <tr
              v-for="cierre in cierres"
              :key="cierre.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors"
            >
              <td class="p-4 font-mono font-bold text-gray-900 dark:text-white">
                #{{ String(cierre.id).padStart(6, '0') }}
              </td>
              <td class="p-4 text-gray-650 dark:text-gray-300">
                {{ formatOnlyDate(cierre.fecha_cierre) }}
              </td>
              <td class="p-4">
                <div class="flex flex-col">
                   <span class="font-bold text-gray-900 dark:text-white">{{ cierre.caja?.nombre }}</span>
                   <span class="text-xs text-gray-400 dark:text-gray-550">{{ cierre.caja?.agencia?.nombre }}</span>
                </div>
              </td>
              <td class="p-4 text-gray-600 dark:text-gray-300">
                <span>{{ cierre.usuario?.name || 'Sistema' }}</span>
              </td>
              <td class="p-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(cierre.saldo_final_fisico_declarado) }}
              </td>
              <td class="p-4 text-center">
                <button
                  @click="openDetailsModal(cierre)"
                  class="p-2 text-gray-500 hover:text-azul-cope dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  title="Ver desglose detallado de gaveta"
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

    <!-- MODAL DETALLE DE CIERRE -->
    <Transition name="fade">
      <div v-if="detailsModalOpen && selectedCierre" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl border border-gray-250 dark:border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between shrink-0">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Desglose Físico de Cierre
                <span class="font-mono text-sm text-gray-450 dark:text-gray-500">#{{ String(selectedCierre.id).padStart(6, '0') }}</span>
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Denominaciones arqueadas en gaveta física</p>
            </div>
            <button
              @click="detailsModalOpen = false"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-6">
            <!-- Metadata Grid -->
             <div class="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-55 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-750">
               <div>
                 <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1">Caja Cerrada</span>
                 <span class="text-sm font-bold text-gray-900 dark:text-white">{{ selectedCierre.caja?.nombre }}</span>
               </div>
               <div>
                 <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1">Cajero Encargado</span>
                 <span class="text-sm font-bold text-gray-900 dark:text-white">{{ selectedCierre.usuario?.name || 'Sistema' }}</span>
               </div>
               <div>
                 <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1">Fecha de Registro</span>
                 <span class="text-sm font-semibold text-gray-750 dark:text-gray-300">{{ formatOnlyDate(selectedCierre.fecha_cierre) }}</span>
               </div>
             </div>

             <!-- Consolidado de Bóveda para Auditoría -->
             <div v-if="selectedCierre.caja?.tipo_caja === 'boveda'" class="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-azul-cope/5 dark:bg-azul-cope/10 border border-azul-cope/20 text-sm">
               <div>
                 <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1">Saldo Inicial (Mañana)</span>
                 <span class="text-sm font-bold text-gray-900 dark:text-white font-mono">
                   {{ formatCurrency(Number(selectedCierre.saldo_final_fisico_declarado) - Number(selectedCierre.total_ingresos_dia || 0) + Number(selectedCierre.total_egresos_dia || 0)) }}
                 </span>
               </div>
               <div>
                 <span class="block text-[10px] font-bold text-green-600 dark:text-green-455 uppercase tracking-wider mb-1">Ingresos del Día</span>
                 <span class="text-sm font-bold text-green-600 dark:text-green-400 font-mono">
                   +{{ formatCurrency(selectedCierre.total_ingresos_dia || 0) }}
                 </span>
               </div>
               <div>
                 <span class="block text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Egresos del Día</span>
                 <span class="text-sm font-bold text-red-500 font-mono">
                   -{{ formatCurrency(selectedCierre.total_egresos_dia || 0) }}
                 </span>
               </div>
               <div>
                 <span class="block text-[10px] font-bold text-azul-cope/90 uppercase tracking-wider mb-1">Saldo Final Bóveda</span>
                 <span class="text-sm font-extrabold text-azul-cope dark:text-cyan-400 font-mono">
                   {{ formatCurrency(selectedCierre.saldo_final_fisico_declarado) }}
                 </span>
               </div>
             </div>

             <!-- Desglose de Caja (Deteriorado e Información de Cajillas) -->
             <div v-if="selectedCierre.caja?.tipo_caja === 'boveda'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-55 dark:bg-gray-900/60 rounded-xl border border-gray-150 dark:border-gray-750 text-xs">
               <div class="flex justify-between items-center px-2">
                 <span class="text-gray-550 dark:text-gray-450 font-medium">De los cuales es Deteriorado (En Bóveda):</span>
                 <span class="font-mono font-bold text-gray-955 dark:text-white">{{ formatCurrency(selectedCierre.saldo_final_deteriorado ?? selectedCierre.saldo_deteriorado) }}</span>
               </div>
               <div class="flex justify-between items-center px-2">
                 <span class="text-gray-550 dark:text-gray-450 font-medium">Saldos en Ventanillas (Al Cierre):</span>
                 <span class="font-mono font-bold text-gray-955 dark:text-white">{{ formatCurrency(selectedCierre.saldo_final_cajillas ?? selectedCierre.saldo_cajillas) }}</span>
               </div>
             </div>

            <!-- Denomination Breakdown Table -->
            <div>
              <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Detalle Físico (Trazabilidad de Piezas)</h3>
              <div class="border border-gray-150 dark:border-gray-700 rounded-xl overflow-hidden">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-100 dark:bg-gray-900 text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider border-b border-gray-150 dark:border-gray-700">
                      <th class="p-3">Denominación</th>
                      <th class="p-3">Estado</th>
                      <th class="p-3 text-center">Cant. Inicial</th>
                      <th class="p-3 text-right">Subtotal Inicial</th>
                      <th class="p-3 text-center">Cant. Final</th>
                      <th class="p-3 text-right">Subtotal Final</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-700 text-sm">
                    <tr v-for="det in selectedCierre.detalles" :key="det.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-200">
                        {{ det.denominacion?.nombre }} ({{ formatCurrency(det.denominacion?.valor) }})
                      </td>
                      <td class="p-3">
                        <span
                          class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          :class="det.estado_dinero === 'bueno' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'"
                        >
                          {{ det.estado_dinero === 'bueno' ? 'Buen estado' : 'Deteriorado' }}
                        </span>
                      </td>
                      <td class="p-3 text-center font-mono font-semibold text-gray-500 dark:text-gray-400">
                        {{ det.cantidad_inicial ?? 0 }}
                      </td>
                      <td class="p-3 text-right font-mono text-gray-500 dark:text-gray-400">
                        {{ formatCurrency(det.subtotal_inicial ?? 0) }}
                      </td>
                      <td class="p-3 text-center font-mono font-bold text-gray-800 dark:text-gray-200">
                        {{ det.cantidad }}
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {{ formatCurrency(det.subtotal) }}
                      </td>
                    </tr>
                    <tr class="bg-gray-55 dark:bg-gray-900 font-bold border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs">
                      <td colspan="3" class="p-3 text-right uppercase tracking-wider">Total Inicial (Mañana)</td>
                      <td class="p-3 text-right font-mono text-gray-700 dark:text-gray-300">
                        {{ formatCurrency(Number(selectedCierre.saldo_final_fisico_declarado) - Number(selectedCierre.total_ingresos_dia || 0) + Number(selectedCierre.total_egresos_dia || 0)) }}
                      </td>
                      <td class="p-3 text-right uppercase tracking-wider">Total Final Cierre</td>
                      <td class="p-3 text-right font-mono text-sm text-azul-cope dark:text-cyan-400">
                        {{ formatCurrency(selectedCierre.saldo_final_fisico_declarado) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Cierres de Ventanillas/Cajillas Asociadas -->
            <div v-if="selectedCierre.cierres_asociados && selectedCierre.cierres_asociados.length > 0">
              <h3 class="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-3">
                Cierres de Ventanillas y Cajas del Día
              </h3>
              <div class="space-y-3">
                <div 
                  v-for="cajaAsoc in selectedCierre.cierres_asociados" 
                  :key="cajaAsoc.id"
                  class="p-4 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-55 dark:bg-gray-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-azul-cope/10 text-azul-cope rounded-xl">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-bold text-gray-900 dark:text-white text-sm">
                        {{ cajaAsoc.caja?.nombre }}
                      </h4>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        Cajero: <span class="font-medium text-gray-700 dark:text-gray-300">{{ cajaAsoc.usuario?.name || 'Sistema' }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-150 dark:border-gray-750">
                    <div>
                      <span class="block text-[10px] text-gray-400 dark:text-gray-550 uppercase font-bold text-right">Físico Declarado</span>
                      <span class="font-mono font-extrabold text-sm text-gray-900 dark:text-white block text-right">
                        {{ formatCurrency(cajaAsoc.saldo_final_fisico_declarado) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-150 dark:border-gray-750 flex justify-end shrink-0">
            <button
              @click="detailsModalOpen = false"
              class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-800 dark:text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'

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
  tipo_caja: string
  estado: boolean
  agencia?: Agencia
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
}

interface CierreDetalle {
  id: number
  denominacion_id: number
  cantidad: number
  subtotal: number
  estado_dinero: string
  denominacion?: Denominacion
  cantidad_inicial?: number
  subtotal_inicial?: number
}

interface Cierre {
  id: number
  caja_id: number
  usuario_id: number
  fecha_cierre: string
  saldo_final_fisico_declarado: number
  saldo_cajillas: number
  saldo_deteriorado: number
  saldo_inicial_bueno?: number
  saldo_final_bueno?: number
  saldo_inicial_cajillas?: number
  saldo_final_cajillas?: number
  saldo_inicial_deteriorado?: number
  saldo_final_deteriorado?: number
  total_ingresos_dia?: number
  total_egresos_dia?: number
  caja?: Caja
  usuario?: User
  detalles?: CierreDetalle[]
  cierres_asociados?: Cierre[]
}

// State
const cierres = ref<Cierre[]>([])
const cajas = ref<Caja[]>([])
const loading = ref(true)
const error = ref('')
const filterCaja = ref('')

const detailsModalOpen = ref(false)
const selectedCierre = ref<Cierre | null>(null)

// Acciones
const fetchCierres = async () => {
  loading.value = true
  error.value = ''
  try {
    const params: any = {}
    if (filterCaja.value) params.caja_id = filterCaja.value

    const res = await axios.get('/cajas/cierres-diarios', { params })
    cierres.value = res.data
  } catch (err: any) {
    error.value = 'Error al consultar históricos de cierres.'
  } finally {
    loading.value = false
  }
}

const fetchCajas = async () => {
  try {
    const res = await axios.get('/cajas')
    cajas.value = res.data
  } catch (err) {
    console.error('Error al cargar catálogo de cajas.')
  }
}

const openDetailsModal = async (cierre: Cierre) => {
  try {
    const res = await axios.get(`/cajas/cierres-diarios/${cierre.id}`)
    selectedCierre.value = res.data
  } catch (err) {
    console.error('Error al obtener el detalle completo del cierre:', err)
    selectedCierre.value = cierre
  }
  detailsModalOpen.value = true
}

const formatTipo = (tipo: string) => {
  if (tipo === 'boveda') return 'Bóveda'
  if (tipo === 'general') return 'Caja General'
  return 'Ventanilla'
}

const formatCurrency = (val: number | undefined) => {
  if (val === undefined) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const formatOnlyDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  // Fix local timezone offset for date mapping
  const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
  return localDate.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(async () => {
  await fetchCajas()
  await fetchCierres()
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
