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
        <div class="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div class="pb-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <h3 class="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Participación de Agencias</h3>
            <span class="text-xs text-gray-400 dark:text-gray-550 font-bold">Porcentaje del Total Nacional</span>
          </div>

          <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
            <div
              v-for="agencia in sortedAgencias"
              :key="agencia.id"
              class="py-4 first:pt-0 last:pb-0 group"
            >
              <div class="flex items-start justify-between gap-4 mb-2">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-azul-cope/5 dark:bg-azul-cope/10 text-azul-cope dark:text-blue-300 flex items-center justify-center text-xs font-bold font-mono">
                    {{ getRank(agencia.id) }}
                  </span>
                  <div>
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-azul-cope transition-colors">
                      {{ agencia.nombre }}
                    </h4>
                    <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span class="text-[10px] text-gray-400 dark:text-gray-500">Saldo Disponible</span>
                      <!-- Incoming transit badge -->
                      <template v-if="agencia.en_transito_entrante_detalles && agencia.en_transito_entrante_detalles.length > 0">
                        <span v-for="(det, i) in agencia.en_transito_entrante_detalles" :key="'in-' + i" class="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-955/20 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200/10" :title="`Viene de ${det.agencia}`">
                          🚚 +{{ formatCurrency(det.monto) }} de {{ det.agencia }}
                        </span>
                      </template>
                      <!-- Outgoing transit badge -->
                      <template v-if="agencia.en_transito_saliente_detalles && agencia.en_transito_saliente_detalles.length > 0">
                        <span v-for="(det, i) in agencia.en_transito_saliente_detalles" :key="'out-' + i" class="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-red-550 bg-red-50 dark:bg-red-955/20 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200/10" :title="`Va hacia ${det.agencia}`">
                          📤 -{{ formatCurrency(det.monto) }} a {{ det.agencia }}
                        </span>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-sm font-extrabold text-gray-900 dark:text-white font-mono">
                    {{ formatCurrency(agencia.saldo_disponible) }}
                  </div>
                  <div class="text-[10px] font-bold text-verde-cope bg-verde-cope/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                    {{ getPercentage(agencia.saldo_disponible).toFixed(1) }}%
                  </div>
                </div>
              </div>

              <!-- Beautiful Animated Progress Bar -->
              <div class="w-full flex items-center gap-3">
                <div class="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div
                    class="h-full bg-gradient-to-r from-azul-cope to-verde-cope rounded-full transition-all duration-1000 ease-out"
                    :style="{ width: `${getPercentage(agencia.saldo_disponible)}%` }"
                  ></div>
                </div>
                <router-link
                  :to="{ path: '/admin/movimientos/dashboard-general', query: { agencia_id: agencia.id } }"
                  class="p-1 bg-gray-50 hover:bg-azul-cope hover:text-white dark:bg-gray-700 dark:hover:bg-azul-cope text-gray-400 rounded-lg transition-all cursor-pointer"
                  title="Ver detalle de operaciones"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import axios from '@/api/axios'
import Chart from 'chart.js/auto'

interface AgenciaSaldo {
  id: number
  nombre: string
  saldo_disponible: number
  en_transito_entrante: number
  en_transito_saliente: number
}

const loading = ref(true)
const error = ref('')
const agenciasSaldos = ref<AgenciaSaldo[]>([])
const trasladosEnTransito = ref<any[]>([])
let chartInstance: Chart | null = null

// Computar total general
const totalGeneral = computed(() => {
  return agenciasSaldos.value.reduce((acc, curr) => acc + curr.saldo_disponible, 0)
})

// Computar total en tránsito consolidado a nivel nacional
const totalEnTransito = computed(() => {
  return agenciasSaldos.value.reduce((acc, curr) => acc + (curr.en_transito_entrante || 0), 0)
})

// Ordenar agencias de mayor a menor efectivo disponible
const sortedAgencias = computed(() => {
  return [...agenciasSaldos.value].sort((a, b) => b.saldo_disponible - a.saldo_disponible)
})

const getRank = (id: number) => {
  const index = sortedAgencias.value.findIndex(a => a.id === id)
  return index !== -1 ? `#${index + 1}` : '-'
}

const getPercentage = (saldo: number) => {
  if (totalGeneral.value === 0) return 0
  return (saldo / totalGeneral.value) * 100
}

const formatEntranteTitle = (agencia: any) => {
  if (!agencia.en_transito_entrante_detalles || agencia.en_transito_entrante_detalles.length === 0) {
    return 'En tránsito: Sin detalles'
  }
  const details = agencia.en_transito_entrante_detalles.map((d: any) => {
    return `${formatCurrency(d.monto)} desde ${d.agencia}`
  }).join(', ')
  return `En tránsito: Viene de ${details}`
}

const formatSalienteTitle = (agencia: any) => {
  if (!agencia.en_transito_saliente_detalles || agencia.en_transito_saliente_detalles.length === 0) {
    return 'En tránsito: Sin detalles'
  }
  const details = agencia.en_transito_saliente_detalles.map((d: any) => {
    return `${formatCurrency(d.monto)} hacia ${d.agencia}`
  }).join(', ')
  return `En tránsito: Va hacia ${details}`
}

const getStatusLabel = (estado: string) => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    solicitud_recibida: 'Recibido',
    programado: 'Programado',
    enviado: 'Enviado',
    paquete_recibido: 'En Destino',
    ingresado: 'Depositado',
    cancelado: 'Cancelado',
    enterado: 'Enterado'
  }
  return labels[estado] || estado
}

const getStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'ingresado':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
    case 'cancelado':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
    case 'pendiente':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30'
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
  }
}

const fetchSaldos = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/reportes/saldos-agencias')
    agenciasSaldos.value = res.data.agencias
    trasladosEnTransito.value = res.data.traslados_en_transito
  } catch (err: any) {
    error.value = 'No se pudieron obtener los saldos de las agencias.'
  } finally {
    loading.value = false
  }

  nextTick(() => {
    renderChart()
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

  // Colores dinámicos
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
})
</script>

<style scoped>
/* Transición suave para barra de progreso */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
