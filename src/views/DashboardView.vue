<template>
  <div class="p-6 w-full space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Dashboard Corporativo de Bóvedas
        </h1>
        <p class="mt-1 text-sm text-gray-550 dark:text-gray-400">
          Monitoreo y distribución porcentual del efectivo disponible de todas las agencias a nivel nacional.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="fetchSaldos"
          class="inline-flex items-center justify-center p-2.5 bg-azul-cope hover:bg-azul-cope/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all gap-1.5 text-xs cursor-pointer active:scale-95 select-none"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
          </svg>
          Actualizar Datos
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-550 dark:text-gray-400 animate-pulse">Obteniendo datos del corporativo...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5 flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
      <div class="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-red-800 dark:text-red-300">Error al cargar saldos</h3>
        <p class="text-xs text-red-700 dark:text-red-400 mt-1">{{ error }}</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left Panel: consolidated cash & chart (col-span-5) -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Gran Total Card -->
        <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-750 text-white rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group">
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative z-10 space-y-4">
            <span class="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full text-white/95">
              🏦 Consolidado Corporativo
            </span>
            <div>
              <h2 class="text-xs font-semibold text-white/70 uppercase tracking-wider">Efectivo Total en Bóvedas</h2>
              <div class="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mt-1">
                {{ formatCurrency(totalGeneral) }}
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/10">
              <span>Agencias Monitoreadas</span>
              <span class="font-extrabold">{{ agenciasSaldos.length }}</span>
            </div>
          </div>
        </div>


        <!-- Tránsito Card -->
        <div class="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group">
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-white/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
          <div class="relative z-10 space-y-4">
            <span class="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase bg-white/25 px-3 py-1 rounded-full text-white/95">
              🚚 Efectivo en Tránsito
            </span>
            <div>
              <h2 class="text-xs font-semibold text-white/70 uppercase tracking-wider">Total en Movimiento Nacional</h2>
              <div class="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mt-1">
                {{ formatCurrency(totalEnTransito) }}
              </div>
            </div>
            <p class="text-[10px] text-white/85 leading-relaxed">Efectivo saliente de origen que está pendiente de ingresarse en bóveda destino.</p>
          </div>
        </div>

        <!-- Chart Card -->
        <div class="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-3xl p-6 shadow-sm flex flex-col items-center">
          <div class="w-full pb-4 border-b border-gray-100 dark:border-gray-700/60 mb-4 flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Distribución de Fondos</h3>
            <span class="w-2.5 h-2.5 rounded-full bg-verde-cope animate-pulse"></span>
          </div>
          <div class="relative w-64 h-64 flex items-center justify-center">
            <canvas id="corporateChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Right Panel: List & Progress Bars (col-span-7) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Top 5 Agencias por Límite de Póliza (Compacto) -->
        <div class="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-3xl p-4.5 shadow-sm space-y-3">
          <div class="pb-2.5 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <h3 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Top 5 Riesgo Límite de Póliza (Bóvedas)</h3>
            <div class="flex items-center gap-2">
              <button
                @click="isRiesgoPolizasModalOpen = true"
                class="px-2 py-0.5 bg-azul-cope/10 hover:bg-azul-cope hover:text-white dark:bg-blue-900/20 text-azul-cope dark:text-blue-300 rounded-md text-[9px] font-bold transition-all cursor-pointer select-none active:scale-95"
              >
                Ver Todas
              </button>
              <span class="text-[10px] text-gray-400 dark:text-gray-550 font-bold font-mono">Consumo de Póliza</span>
            </div>
          </div>

          <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
            <div
              v-for="agencia in top5Agencias"
              :key="agencia.id"
              class="py-2.5 first:pt-0 last:pb-0 group"
            >
              <div class="flex items-start justify-between gap-4 mb-1">
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 rounded-lg bg-azul-cope/5 dark:bg-azul-cope/10 text-azul-cope dark:text-blue-300 flex items-center justify-center text-[10px] font-bold font-mono">
                    {{ getRank(agencia.id) }}
                  </span>
                  <div>
                    <h4 class="text-xs font-bold text-gray-900 dark:text-white group-hover:text-azul-cope transition-colors">
                      {{ agencia.nombre }}
                    </h4>
                    <div class="text-[9px] text-gray-450 dark:text-gray-500 mt-0.5">
                      Saldo: <span class="font-bold text-gray-700 dark:text-gray-300">{{ formatCurrency(agencia.saldo_disponible) }}</span>
                      / Póliza: <span class="font-bold text-gray-700 dark:text-gray-300">{{ formatCurrency(agencia.poliza_limite) }}</span>
                    </div>
                  </div>
                </div>

                <div class="text-right">
                  <div
                    class="text-xs font-black px-2 py-0.5 rounded-lg inline-block"
                    :class="
                      agencia.porcentaje_poliza >= 90
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-pulse'
                        : agencia.porcentaje_poliza >= 75
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-955/20 dark:text-emerald-450'
                    "
                  >
                    {{ agencia.porcentaje_poliza.toFixed(1) }}%
                  </div>
                  <div class="text-[8px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wider">
                    {{ agencia.porcentaje_poliza >= 90 ? 'Límite Crítico' : agencia.porcentaje_poliza >= 75 ? 'Advertencia' : 'Seguro' }}
                  </div>
                </div>
              </div>

              <!-- Progress Bar (Compacta y Dinámica) -->
              <div class="w-full flex items-center gap-2.5">
                <div class="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div
                    class="h-full rounded-full transition-all duration-1000 ease-out"
                    :class="
                      agencia.porcentaje_poliza >= 90
                        ? 'bg-gradient-to-r from-red-500 to-rose-600'
                        : agencia.porcentaje_poliza >= 75
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                        : 'bg-gradient-to-r from-azul-cope to-verde-cope'
                    "
                    :style="{ width: `${Math.min(agencia.porcentaje_poliza, 100)}%` }"
                  ></div>
                </div>
                <router-link
                  :to="{ path: '/admin/movimientos/dashboard-general-alt', query: { agencia_id: agencia.id } }"
                  class="p-0.5 bg-gray-50 hover:bg-azul-cope hover:text-white dark:bg-gray-700 dark:hover:bg-azul-cope text-gray-400 rounded-md transition-all cursor-pointer"
                  title="Ver detalle de operaciones"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Efectivo en Tránsito Card -->
        <div class="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div class="pb-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Tránsitos Activos Inter-Agencia</h3>
            <span class="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-955/25 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-full font-mono">En Ruta</span>
          </div>

          <div v-if="trasladosEnTransito.length === 0" class="py-12 text-center text-xs text-gray-400 font-medium">
            No hay traslados de efectivo circulando en tránsito actualmente.
          </div>
          <div v-else class="overflow-hidden border border-gray-150 dark:border-gray-750 rounded-2xl">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-150 dark:border-gray-750 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th class="p-3">Ruta de Envío</th>
                  <th class="p-3 text-right">Monto en Ruta</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-gray-750 dark:text-gray-300">
                <tr v-for="t in trasladosEnTransito" :key="t.id" class="hover:bg-gray-55/50 dark:hover:bg-gray-750/30 transition-colors">
                  <td class="p-3">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-gray-900 dark:text-white">{{ t.origen_agencia }}</span>
                      <span class="text-gray-400">➜</span>
                      <span class="font-bold text-gray-900 dark:text-white">{{ t.destino_agencia }}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 mt-1">
                      <span class="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-red-550 bg-red-50 dark:bg-red-955/20 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200/10">
                        📤 Resta de origen: -{{ formatCurrency(t.monto) }}
                      </span>
                      <span class="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-955/20 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200/10">
                        🚚 Suma a destino: +{{ formatCurrency(t.monto) }}
                      </span>
                    </div>
                    <span v-if="t.repartidor" class="block text-[10px] text-gray-450 mt-1">Custodio: {{ t.repartidor }}</span>
                  </td>
                  <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                    {{ formatCurrency(t.monto) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- New Section: Descuadres Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Card for Bar Chart (3/4 = col-span-9) -->
      <div class="lg:col-span-9 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="pb-4 border-b border-gray-100 dark:border-gray-700/60 mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Descuadres por Agencia</h3>
              <p class="text-xs text-gray-400 dark:text-gray-550 mt-1">
                Total: <span class="font-extrabold text-gray-900 dark:text-white">{{ totalDescuadresCount }} incidentes</span>
                <span class="mx-2">|</span>
                Agencia con más reportes: <span class="font-extrabold text-red-655 dark:text-red-400">{{ agencyMostDescuadres }}</span>
              </p>
            </div>
            <router-link
              to="/admin/movimientos/descuadres"
              class="text-xs font-bold text-azul-cope hover:text-azul-cope/80 flex items-center gap-1.5"
            >
              Ver Módulo ➜
            </router-link>
          </div>
          
          <div class="relative w-full h-64 flex items-center justify-center">
            <div v-if="totalDescuadresCount === 0" class="text-xs text-gray-400 text-center font-medium">
              No hay descuadres registrados en el sistema
            </div>
            <canvas v-else id="agenciasDescuadresBarChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Card for Pie Chart (1/4 = col-span-3) -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between">
        <div class="w-full pb-4 border-b border-gray-100 dark:border-gray-700/60 mb-4">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center">Tipo de Descuadre</h3>
        </div>
        
        <div class="w-full flex flex-col items-center justify-center gap-4 flex-1">
          <div class="relative w-36 h-36 flex items-center justify-center">
            <div v-if="totalDescuadresCount === 0" class="text-xs text-gray-400 text-center font-medium">
              Sin registros
            </div>
            <canvas v-else id="descuadresChart"></canvas>
          </div>
          
          <div v-if="totalDescuadresCount > 0" class="space-y-2 text-xs w-full">
            <div class="flex items-center justify-between px-2">
              <div class="flex items-center gap-2">
                <span class="inline-block w-3 h-3 bg-red-500 rounded-md"></span>
                <span class="text-gray-750 dark:text-gray-300">Faltantes</span>
              </div>
              <span class="font-mono font-black text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-955/20 px-2.5 py-0.5 rounded-full">{{ faltantesCount }}</span>
            </div>
            <div class="flex items-center justify-between px-2">
              <div class="flex items-center gap-2">
                <span class="inline-block w-3.5 h-3 bg-emerald-500 rounded-md"></span>
                <span class="text-gray-750 dark:text-gray-300">Sobrantes</span>
              </div>
              <span class="font-mono font-black text-emerald-650 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-955/20 px-2.5 py-0.5 rounded-full">{{ sobrantesCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal de Riesgo de Pólizas -->
    <RiesgoPolizasModal
      :is-open="isRiesgoPolizasModalOpen"
      :agencias="sortedByPolizaReach"
      @close="isRiesgoPolizasModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import axios from '@/api/axios'
import Chart from 'chart.js/auto'
import RiesgoPolizasModal from '@/components/movimientos/RiesgoPolizasModal.vue'

interface AgenciaSaldo {
  id: number
  nombre: string
  saldo_disponible: number
  en_transito_entrante: number
  en_transito_saliente: number
  poliza_limite: number
  porcentaje_poliza?: number
  en_transito_entrante_detalles?: { agencia: string; monto: number }[]
  en_transito_saliente_detalles?: { agencia: string; monto: number }[]
}

const loading = ref(true)
const error = ref('')
const isRiesgoPolizasModalOpen = ref(false)
const agenciasSaldos = ref<AgenciaSaldo[]>([])
const trasladosEnTransito = ref<any[]>([])
const descuadres = ref<any[]>([])
let chartInstance: Chart | null = null
let descuadresChartInstance: Chart | null = null
let agenciasBarChartInstance: Chart | null = null

// Computar total general
const totalGeneral = computed(() => {
  return agenciasSaldos.value.reduce((acc, curr) => acc + curr.saldo_disponible, 0)
})

// Computar total en tránsito consolidado a nivel nacional
const totalEnTransito = computed(() => {
  return agenciasSaldos.value.reduce((acc, curr) => acc + (curr.en_transito_entrante || 0), 0)
})



// Computar estadísticas de descuadres
const totalDescuadresCount = computed(() => descuadres.value.length)

const faltantesCount = computed(() => {
  return descuadres.value.filter(d => d.tipo_descuadre === 'FALTANTE').length
})

const sobrantesCount = computed(() => {
  return descuadres.value.filter(d => d.tipo_descuadre === 'SOBRANTE').length
})

const agencyMostDescuadres = computed(() => {
  if (descuadres.value.length === 0) return 'Ninguna'
  const counts: Record<string, number> = {}
  descuadres.value.forEach(d => {
    const name = d.agencia?.nombre || `Agencia ID: ${d.agencia_id}`
    counts[name] = (counts[name] || 0) + 1
  })
  let maxName = 'Ninguna'
  let maxVal = 0
  for (const name in counts) {
    if (counts[name] > maxVal) {
      maxVal = counts[name]
      maxName = name
    }
  }
  return `${maxName} (${maxVal} reportes)`
})

const agenciasDescuadresData = computed(() => {
  const counts: Record<string, number> = {}
  descuadres.value.forEach(d => {
    const name = d.agencia?.nombre || `Agencia ID: ${d.agencia_id}`
    counts[name] = (counts[name] || 0) + 1
  })
  const labels = Object.keys(counts)
  const data = labels.map(label => counts[label])
  return { labels, data }
})

// Ordenar agencias de mayor a menor efectivo disponible (para otras utilidades o gráficos de barra si es necesario)
const sortedAgencias = computed(() => {
  return [...agenciasSaldos.value].sort((a, b) => b.saldo_disponible - a.saldo_disponible)
})

// Ordenar agencias por porcentaje alcanzado de la póliza de su bóveda
const sortedByPolizaReach = computed(() => {
  return [...agenciasSaldos.value]
    .filter(a => a.poliza_limite > 0)
    .map(a => {
      const percentage = (a.saldo_disponible / a.poliza_limite) * 100
      return {
        ...a,
        porcentaje_poliza: percentage
      }
    })
    .sort((a, b) => b.porcentaje_poliza - a.porcentaje_poliza)
})

const top5Agencias = computed(() => {
  return sortedByPolizaReach.value.slice(0, 5)
})

const getRank = (id: number) => {
  const index = sortedByPolizaReach.value.findIndex(a => a.id === id)
  return index !== -1 ? `#${index + 1}` : '-'
}

const getPercentage = (saldo: number) => {
  if (totalGeneral.value === 0) return 0
  return (saldo / totalGeneral.value) * 100
}

const fetchSaldos = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/reportes/saldos-agencias')
    agenciasSaldos.value = res.data.agencias
    trasladosEnTransito.value = res.data.traslados_en_transito
    
    // Obtener los descuadres para la gráfica
    const descuadresRes = await axios.get('/descuadres')
    descuadres.value = descuadresRes.data
  } catch (err: any) {
    error.value = 'No se pudieron obtener los saldos o los reportes de descuadres.'
  } finally {
    loading.value = false
  }

  nextTick(() => {
    renderChart()
    renderDescuadresChart()
    renderAgenciasDescuadresBarChart()
  })
}

// Renderizar gráfico Doughnut
const renderChart = () => {
  const canvas = document.getElementById('corporateChart') as HTMLCanvasElement
  if (!canvas) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const labels = sortedAgencias.value.map(a => a.nombre)
  const data = sortedAgencias.value.map(a => a.saldo_disponible)

  const backgroundColors = [
    '#005691', // azul-cope
    '#00c07f', // verde-cope
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#14b8a6', // Teal
  ]

  chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw as number
              const formattedVal = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
              const percent = getPercentage(val).toFixed(1)
              return ` ${context.label}: ${formattedVal} (${percent}%)`
            },
          },
        },
      },
      cutout: '70%',
    },
  })
}

// Renderizar gráfico de pastel de descuadres
const renderDescuadresChart = () => {
  const canvas = document.getElementById('descuadresChart') as HTMLCanvasElement
  if (!canvas) return

  if (descuadresChartInstance) {
    descuadresChartInstance.destroy()
  }

  const faltantes = faltantesCount.value
  const sobrantes = sobrantesCount.value

  if (faltantes === 0 && sobrantes === 0) return

  descuadresChartInstance = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: ['Faltantes', 'Sobrantes'],
      datasets: [
        {
          data: [faltantes, sobrantes],
          backgroundColor: ['#ef4444', '#10b981'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw as number
              const total = totalDescuadresCount.value
              const percent = ((val / total) * 100).toFixed(1)
              return ` ${context.label}: ${val} (${percent}%)`
            },
          },
        },
      },
    },
  })
}

// Renderizar gráfico de barras de agencias
const renderAgenciasDescuadresBarChart = () => {
  const canvas = document.getElementById('agenciasDescuadresBarChart') as HTMLCanvasElement
  if (!canvas) return

  if (agenciasBarChartInstance) {
    agenciasBarChartInstance.destroy()
  }

  const { labels, data } = agenciasDescuadresData.value

  if (labels.length === 0) return

  agenciasBarChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Descuadres',
          data: data,
          backgroundColor: '#005691',
          borderRadius: 8,
          borderWidth: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563',
          },
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
          }
        },
        x: {
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563',
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

onMounted(() => {
  fetchSaldos()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
  if (descuadresChartInstance) {
    descuadresChartInstance.destroy()
  }
  if (agenciasBarChartInstance) {
    agenciasBarChartInstance.destroy()
  }
})
</script>

<style scoped>
/* Transición suave para barra de progreso */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
