<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Monitoreo Interactivo
        </h1>
        <p class="mt-1 text-sm text-gray-550 dark:text-gray-400">
          Vista del flujo físico de efectivo en bóveda, caja general y ventanillas.
          <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-verde-cope bg-verde-cope/10 px-2 py-0.5 rounded-full ml-2 border border-verde-cope/10">
            <span class="w-1.5 h-1.5 rounded-full bg-verde-cope animate-pulse"></span>
            Operativa: {{ fechaHoy }}
          </span>
        </p>
      </div>

      <!-- Total Disponible de Bóveda (Centro) -->
      <div v-if="bovedas.length > 0" class="hidden lg:flex flex-1 justify-center">
        <div class="bg-gradient-to-r from-azul-cope/10 to-verde-cope/10 border border-azul-cope/20 dark:border-verde-cope/20 rounded-2xl px-5 py-2 flex items-center gap-3 shadow-xs select-none">
          <span class="text-xs font-black uppercase text-azul-cope dark:text-gray-300 tracking-wider">Disponible Bóveda:</span>
          <span class="font-mono text-base font-black text-verde-cope bg-verde-cope/10 px-3 py-1 rounded-xl">
            {{ formatCurrency(totalDisponibleBoveda) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Selector de Agencia -->
        <div v-if="agencias.length > 0" class="flex items-center gap-2">
          <label class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">Agencia:</label>
          <select
            v-model="agenciaSeleccionadaId"
            @change="onAgenciaChange"
            :disabled="!authStore.hasRole('Super Admin')"
            class="block w-48 px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option v-for="agencia in agencias" :key="agencia.id" :value="agencia.id">
              {{ agencia.nombre }}
            </option>
          </select>
        </div>

        <button
          @click="fetchData"
          class="inline-flex items-center justify-center p-2.5 bg-azul-cope text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all gap-1.5 text-xs cursor-pointer border-none"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
          </svg>
          Actualizar Datos
        </button>

        <button
          v-if="bovedas.length > 0 && !bovedaCerradaHoy"
          @click="cierreModalOpen = true"
          class="inline-flex items-center justify-center p-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all gap-1.5 text-xs cursor-pointer border-none"
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
      <p class="text-sm font-medium text-gray-550 dark:text-gray-400 animate-pulse">Cargando monitoreo consolidado...</p>
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
    </div>

    <!-- Consolidated View -->
    <div v-else class="space-y-8">
      <!-- Banner de Saldos Superior -->
      <DashboardBanner
        :boveda-id="bovedaId"
        :billetes="billetes"
        :monedas="monedas"
        :matriz="matriz"
        :totales-cajillas="totalesCajillas"
        :totales-deteriorados="totalesDeteriorados"
        :format-currency="formatCurrency"
      />

      <!-- Paneles Principales de Monitoreo -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <!-- Panel 1: Bóveda Principal con Selector de Categorías -->
        <BovedaPanel
          :boveda-id="bovedaId"
          :boveda-nombre="bovedaNombre"
          :billetes="billetes"
          :monedas="monedas"
          :matriz="matriz"
          :category="selectedCategory"
          :format-currency="formatCurrency"
          @category-change="handleCategoryChange"
        />

        <!-- Panel 2: Caja General / Ventanillas dinámicas sincronizadas -->
        <CajasPanel
          :cajas-generales="cajasGenerales"
          :ventanillas="ventanillas"
          :billetes="billetes"
          :monedas="monedas"
          :matriz="matriz"
          :totales-cajillas="totalesCajillas"
          :totales-deteriorados="totalesDeteriorados"
          :category="selectedCategory"
          :format-currency="formatCurrency"
        />
      </div>

      <!-- Componente Cierre de Bóveda Modal -->
      <CierreBovedaModal
        v-if="bovedas.length > 0"
        :show="cierreModalOpen"
        :boveda="bovedas[0]"
        :billetes="billetes"
        :monedas="monedas"
        :matriz="matriz"
        :get-cajillas-disponible="getCajillasDisponible"
        :get-deteriorados-disponible="getDeterioradosDisponible"
        :get-saldo-disponible-cantidad="getSaldoDisponibleCantidad"
        @close="cierreModalOpen = false"
        @success="onCierreSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

// Componentes modulares nuevos
import DashboardBanner from '@/components/movimientos/dashboard_alternate/DashboardBanner.vue'
import BovedaPanel from '@/components/movimientos/dashboard_alternate/BovedaPanel.vue'
import CajasPanel from '@/components/movimientos/dashboard_alternate/CajasPanel.vue'

// Reutilización de cierre
import CierreBovedaModal from '@/components/movimientos/CierreBovedaModal.vue'

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
const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')
const fechaHoy = ref('')
const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const matriz = ref<Record<number, Record<number, FilaMatriz>>>({})
const totalesCajillas = ref<Record<number, FlujoEspecial>>({})
const totalesDeteriorados = ref<Record<number, FlujoEspecial>>({})

// Selector de Categoría (Sincronizado entre Bóveda y Detalle Cajas)
const selectedCategory = ref<'operaciones' | 'cajillas' | 'deteriorado'>('operaciones')

// Cierre Bóveda States
const bovedaCerradaHoy = ref(false)
const cierreModalOpen = ref(false)

// Computeds
const bovedas = computed(() => cajas.value.filter(c => c.tipo_caja === 'boveda'))
const cajasGenerales = computed(() => cajas.value.filter(c => c.tipo_caja === 'general'))
const ventanillas = computed(() => cajas.value.filter(c => c.tipo_caja === 'ventanilla'))

const bovedaId = computed(() => bovedas.value.length > 0 ? bovedas.value[0].id : null)
const bovedaNombre = computed(() => bovedas.value.length > 0 ? bovedas.value[0].nombre : '')

const billetes = computed(() => denominaciones.value.filter(d => d.tipo === 'billete'))
const monedas = computed(() => denominaciones.value.filter(d => d.tipo === 'moneda'))

const handleCategoryChange = (cat: 'operaciones' | 'cajillas' | 'deteriorado') => {
  selectedCategory.value = cat
}

// Helpers para Modal Cierre de Bóveda
const getSaldoDisponibleCantidad = (cajaId: number, denomId: number): number => {
  const row = matriz.value[cajaId]?.[denomId]
  if (!row) return 0
  return row.saldo_inicial_cantidad + row.ingresos_cantidad - row.egresos_cantidad
}

const getCajillasSaldoInicial = (cajaId: number): number => {
  return Number(totalesCajillas.value[cajaId]?.['saldo_inicial']) || 0
}

const getCajillasMonto = (cajaId: number, tipo: 'ingresos' | 'egresos'): number => {
  return Number(totalesCajillas.value[cajaId]?.[tipo]) || 0
}

const getCajillasDisponible = (cajaId: number): number => {
  return getCajillasSaldoInicial(cajaId) + getCajillasMonto(cajaId, 'ingresos') - getCajillasMonto(cajaId, 'egresos')
}

const getDeterioradosSaldoInicial = (cajaId: number): number => {
  return Number(totalesDeteriorados.value[cajaId]?.['saldo_inicial']) || 0
}

const getDeterioradosMonto = (cajaId: number, tipo: 'ingresos' | 'egresos'): number => {
  return Number(totalesDeteriorados.value[cajaId]?.[tipo]) || 0
}

const getDeterioradosDisponible = (cajaId: number): number => {
  return getDeterioradosSaldoInicial(cajaId) + getDeterioradosMonto(cajaId, 'ingresos') - getDeterioradosMonto(cajaId, 'egresos')
}

const totalDisponibleBoveda = computed(() => {
  if (bovedaId.value === null) return 0
  let total = 0
  denominaciones.value.forEach(d => {
    const cant = getSaldoDisponibleCantidad(bovedaId.value!, d.id)
    total += cant * d.valor
  })
  total += getCajillasDisponible(bovedaId.value!)
  total += getDeterioradosDisponible(bovedaId.value!)
  return total
})

const onCierreSuccess = () => {
  cierreModalOpen.value = false
  fetchData()
}

// Agencias
const agencias = ref<any[]>([])
const agenciaSeleccionadaId = ref<number | null>(null)

const onAgenciaChange = () => {
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params: any = {}
    if (agenciaSeleccionadaId.value !== null) {
      params.agencia_id = agenciaSeleccionadaId.value
    }
    const res = await axios.get('/reportes/dashboard-general', { params })
    fechaHoy.value = res.data.fecha
    cajas.value = res.data.cajas
    denominaciones.value = res.data.denominaciones
    matriz.value = res.data.matriz
    totalesCajillas.value = res.data.totales_cajillas || {}
    totalesDeteriorados.value = res.data.totales_deteriorados || {}
    bovedaCerradaHoy.value = res.data.boveda_cerrada_hoy || false
    agencias.value = res.data.agencias || []
    
    if (res.data.agencia_seleccionada_id && agenciaSeleccionadaId.value === null) {
      agenciaSeleccionadaId.value = res.data.agencia_seleccionada_id
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
