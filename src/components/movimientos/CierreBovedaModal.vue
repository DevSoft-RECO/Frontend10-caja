<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
    <div class="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full border border-gray-150 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 bg-red-600 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🚪</span>
          <div>
            <h2 class="text-base font-extrabold tracking-wide uppercase">Cierre de Bóveda y Arqueo Físico</h2>
            <p class="text-[10px] text-red-100 font-semibold uppercase tracking-wider">Arqueo clasificado de jornada - Agencia {{ boveda?.nombre }}</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-white hover:text-red-100 text-2xl font-bold cursor-pointer focus:outline-none">&times;</button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-6 flex-1">
        
        <!-- Alerts -->
        <div v-if="cierreError" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-800 dark:text-red-300">
          {{ cierreError }}
        </div>
        <div v-if="cierreSuccess" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-bold text-green-800 dark:text-green-300">
          {{ cierreSuccess }}
        </div>

        <!-- Barra de Control Superior (Compartimentos y Tipo) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-55 dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-750 shadow-sm">
          
          <!-- Tabs de Compartimentos (Bueno, Cajilla, Deteriorado) -->
          <div class="flex flex-wrap gap-1 bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl">
            <button
              @click="activeCompartment = 'bueno'"
              class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              :class="activeCompartment === 'bueno' ? 'bg-white dark:bg-gray-700 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              💼 Operaciones (Bueno)
            </button>
            <button
              @click="activeCompartment = 'cajillas'"
              class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              :class="activeCompartment === 'cajillas' ? 'bg-white dark:bg-gray-700 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              🏪 Cajillas (Tránsito)
            </button>
            <button
              @click="activeCompartment = 'deteriorado'"
              class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              :class="activeCompartment === 'deteriorado' ? 'bg-white dark:bg-gray-700 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              ⚠️ Deteriorado
            </button>
          </div>

          <!-- Tabs de Tipo (Billetes / Monedas) -->
          <div class="flex gap-1 bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl w-fit">
            <button
              @click="activeType = 'billete'"
              class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
              :class="activeType === 'billete' ? 'bg-white dark:bg-gray-700 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              💵 Billetes
            </button>
            <button
              @click="activeType = 'moneda'"
              class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
              :class="activeType === 'moneda' ? 'bg-white dark:bg-gray-700 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              🪙 Monedas
            </button>
          </div>

        </div>

        <!-- Tabla Única Compacta y Optimizada -->
        <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
                <th class="p-3 w-1/3">Denominación</th>
                <th class="p-3 text-center w-1/4">Teórico en Sistema</th>
                <th class="p-3 text-center w-1/4">Cantidad Física (Arqueo)</th>
                <th class="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
              <tr v-for="denom in currentList" :key="denom.id" class="hover:bg-slate-50/40 dark:hover:bg-gray-750/10 transition-colors">
                <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                  {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                </td>
                <td class="p-3 text-center font-mono text-gray-400 dark:text-gray-500 font-bold">
                  {{ formatCurrency(getTeoricoMonto(denom)) }}
                </td>
                <td class="p-3">
                  <input
                    v-model.number="denom[getFieldName()]"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="block w-28 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-950 dark:text-white font-bold font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </td>
                <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-28">
                  {{ formatCurrency(denom[getFieldName()] * denom.valor) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Compartment Consolidation Grid -->
        <div class="p-4 bg-slate-50 dark:bg-gray-850 border border-gray-150 dark:border-gray-700/60 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            class="p-3 rounded-xl border shadow-sm flex flex-col transition-all"
            :class="activeCompartment === 'bueno' ? 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40 ring-1 ring-blue-500/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'"
          >
            <span class="text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider">💼 Operaciones (Bueno)</span>
            <span class="text-base font-extrabold text-gray-800 dark:text-gray-200 mt-1 font-mono">
              {{ formatCurrency(totalOperaciones) }}
            </span>
          </div>
          <div 
            class="p-3 rounded-xl border shadow-sm flex flex-col transition-all"
            :class="activeCompartment === 'cajillas' ? 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40 ring-1 ring-blue-500/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'"
          >
            <span class="text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider">🏪 Cajillas (En Tránsito)</span>
            <span class="text-base font-extrabold text-gray-800 dark:text-gray-200 mt-1 font-mono">
              {{ formatCurrency(totalCajillas) }}
            </span>
          </div>
          <div 
            class="p-3 rounded-xl border shadow-sm flex flex-col transition-all"
            :class="activeCompartment === 'deteriorado' ? 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40 ring-1 ring-blue-500/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'"
          >
            <span class="text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider">⚠️ Efectivo Deteriorado</span>
            <span class="text-base font-extrabold text-gray-800 dark:text-gray-200 mt-1 font-mono">
              {{ formatCurrency(totalDeteriorado) }}
            </span>
          </div>
        </div>

      </div>

      <!-- Footer / Resumen -->
      <div class="p-6 border-t border-gray-150 dark:border-gray-750 bg-gray-55 dark:bg-gray-850 flex flex-col space-y-4">
        
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
          <button @click="$emit('close')" class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-250 font-bold rounded-xl text-sm transition-all cursor-pointer">
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
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import axios from '@/api/axios'

const props = defineProps<{
  show: boolean
  boveda: any
  billetes: any[]
  monedas: any[]
  matriz: any
  getCajillasDisponible: (cajaId: number) => number
  getDeterioradosDisponible: (cajaId: number) => number
  getSaldoDisponibleCantidad: (cajaId: number, denomId: number) => number
}>()

const emit = defineEmits(['close', 'success'])

// Tabs de Navegación
const activeCompartment = ref<'bueno' | 'cajillas' | 'deteriorado'>('bueno')
const activeType = ref<'billete' | 'moneda'>('billete')

const loadingCierre = ref(false)
const cierreError = ref('')
const cierreSuccess = ref('')
const localDenominacionesList = ref<any[]>([])
const saldoCoreManual = ref<number | ''>('')

// Mapea la propiedad de arqueo activa según la pestaña
const getFieldName = (): string => {
  if (activeCompartment.value === 'bueno') return 'cantidad_buena'
  if (activeCompartment.value === 'cajillas') return 'cantidad_cajillas'
  return 'cantidad_deteriorada'
}

// Filtra la lista según tipo (Billetes / Monedas)
const currentList = computed(() => {
  return localDenominacionesList.value.filter(d => d.tipo === activeType.value)
})

const getCajillasDisponibleCantidad = (cajaId: number, denomId: number): number => {
  const row = props.matriz[cajaId]?.[denomId]
  if (!row) return 0
  return Number(row.cajillas_inicial_cantidad || 0) + Number(row.cajillas_ingresos_cantidad || 0) - Number(row.cajillas_egresos_cantidad || 0)
}

const getDeterioradoDisponibleCantidad = (cajaId: number, denomId: number): number => {
  const row = props.matriz[cajaId]?.[denomId]
  if (!row) return 0
  return Number(row.deteriorado_inicial_cantidad || 0) + Number(row.deteriorado_ingreso_cantidad || 0) - Number(row.deteriorado_egreso_cantidad || 0)
}

// Calcula el teórico en sistema para una denominación según el compartimento
const getTeoricoMonto = (denom: any): number => {
  if (!props.boveda) return 0
  if (activeCompartment.value === 'bueno') {
    return props.getSaldoDisponibleCantidad(props.boveda.id, denom.id) * denom.valor
  }
  if (activeCompartment.value === 'cajillas') {
    return getCajillasDisponibleCantidad(props.boveda.id, denom.id) * denom.valor
  }
  // Deteriorado
  return getDeterioradoDisponibleCantidad(props.boveda.id, denom.id) * denom.valor
}

// Cálculos de Totales por Compartimento
const totalOperaciones = computed(() => {
  return localDenominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_buena) || 0) * d.valor, 0)
})

const totalCajillas = computed(() => {
  return localDenominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_cajillas) || 0) * d.valor, 0)
})

const totalDeteriorado = computed(() => {
  return localDenominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_deteriorada) || 0) * d.valor, 0)
})

const granTotalCierre = computed(() => {
  return totalOperaciones.value + totalCajillas.value + totalDeteriorado.value
})

const diferenciaConciliacion = computed(() => {
  if (saldoCoreManual.value === '' || saldoCoreManual.value === null) return 0
  return Number(granTotalCierre.value) - Number(saldoCoreManual.value)
})

// Escuchar la apertura del modal para inicializar datos y precargas
watch(() => props.show, (newVal) => {
  if (newVal && props.boveda) {
    cierreError.value = ''
    cierreSuccess.value = ''
    saldoCoreManual.value = ''
    activeCompartment.value = 'bueno'
    activeType.value = 'billete'
    
    // Inicializar lista única desglosada
    localDenominacionesList.value = [...props.billetes, ...props.monedas].map(d => ({
      id: d.id,
      nombre: d.nombre,
      valor: d.valor,
      tipo: d.tipo,
      cantidad_buena: 0,
      cantidad_cajillas: 0,
      cantidad_deteriorada: 0
    }))

    // Sincronizar cantidades directamente de la matriz calculada en el Dashboard
    localDenominacionesList.value.forEach(d => {
      d.cantidad_buena = props.getSaldoDisponibleCantidad(props.boveda.id, d.id)
      d.cantidad_cajillas = getCajillasDisponibleCantidad(props.boveda.id, d.id)
      d.cantidad_deteriorada = getDeterioradoDisponibleCantidad(props.boveda.id, d.id)
    })
  }
})

const submitCierreBoveda = async () => {
  if (!props.boveda) return

  if (saldoCoreManual.value === '' || saldoCoreManual.value === null || isNaN(Number(saldoCoreManual.value))) {
    cierreError.value = 'Por favor, ingrese el Saldo Oficial del Core Bancario para la conciliación antes de cerrar.'
    return
  }

  loadingCierre.value = true
  cierreError.value = ''
  cierreSuccess.value = ''

  // Consolidar detalles en base a los tres compartimentos de base de datos
  const detalles: any[] = []
  
  localDenominacionesList.value.forEach(d => {
    // Operaciones (Bueno)
    if (Number(d.cantidad_buena) > 0) {
      detalles.push({
        denominacion_id: d.id,
        estado_dinero: 'bueno',
        cantidad: Number(d.cantidad_buena)
      })
    }
    // Cajillas
    if (Number(d.cantidad_cajillas) > 0) {
      detalles.push({
        denominacion_id: d.id,
        estado_dinero: 'cajillas',
        cantidad: Number(d.cantidad_cajillas)
      })
    }
    // Deteriorado
    if (Number(d.cantidad_deteriorada) > 0) {
      detalles.push({
        denominacion_id: d.id,
        estado_dinero: 'deteriorado',
        cantidad: Number(d.cantidad_deteriorada)
      })
    }
  })

  try {
    await axios.post('/cajas/cierres-diarios', {
      caja_id: props.boveda.id,
      detalles: detalles
    })
    
    cierreSuccess.value = '¡Bóveda cerrada exitosamente para el día de hoy!'
    setTimeout(() => {
      emit('success')
    }, 1500)
  } catch (err: any) {
    cierreError.value = err.response?.data?.message || 'Error al ejecutar el cierre de la Bóveda.'
  } finally {
    loadingCierre.value = false
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}
</script>
