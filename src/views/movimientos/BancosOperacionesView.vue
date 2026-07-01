<template>
  <div class="p-6 w-full space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
        Operaciones con Bancos Externos
      </h1>
      <p class="mt-1 text-sm text-gray-550 dark:text-gray-400">
        Gestiona la inyección de efectivo (Dinero Bueno) o la extracción de remesas (Bueno/Deteriorado) entre las Bóvedas y bancos externos.
      </p>
    </div>

    <!-- Alertas de respuesta -->
    <div v-if="successMsg" class="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400 text-sm font-bold flex items-center gap-2">
      <span>✅</span> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 text-sm font-bold flex items-center gap-2">
      <span>⚠️</span> {{ errorMsg }}
    </div>

    <!-- Formulario principal -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Panel de Control -->
      <div class="bg-white/85 dark:bg-gray-800/85 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-lg space-y-5 md:col-span-1">
        <h3 class="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-2">Parámetros de Operación</h3>

        <!-- Bóveda -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">Bóveda</label>
          <select
            v-model="bovedaId"
            @change="onBovedaChange"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-bold transition-all"
          >
            <option :value="null" disabled>Seleccionar Bóveda</option>
            <option v-for="caja in bovedasDisponibles" :key="caja.id" :value="caja.id">
              {{ caja.nombre }} ({{ caja.agencia?.nombre }})
            </option>
          </select>
        </div>

        <!-- Tipo de Operación -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">Tipo de Operación</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="setTipoOperacion('ingreso')"
              class="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer"
              :class="tipoOperacion === 'ingreso' ? 'bg-green-500 border-green-500 text-white shadow-md' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-750'"
            >
              Inyección
            </button>
            <button
              @click="setTipoOperacion('egreso')"
              class="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer"
              :class="tipoOperacion === 'egreso' ? 'bg-red-500 border-red-500 text-white shadow-md' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-450 hover:bg-gray-50 dark:hover:bg-gray-750'"
            >
              Extracción
            </button>
          </div>
        </div>

        <!-- Resumen de Envío -->
        <div class="pt-4 border-t border-gray-150 dark:border-gray-750 text-xs space-y-2">
          <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
            <span>Total de Piezas:</span>
            <span class="font-bold font-mono text-gray-800 dark:text-white">{{ totalPiezas }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
            <span>Monto Total:</span>
            <span class="text-base font-extrabold font-mono text-azul-cope dark:text-cyan-400">{{ formatCurrency(totalMonto) }}</span>
          </div>
        </div>

        <button
          @click="submitOperacion"
          :disabled="loadingSubmit || !bovedaId || totalMonto === 0"
          class="w-full inline-flex items-center justify-center py-3 bg-azul-cope hover:bg-azul-cope/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 gap-2 text-sm cursor-pointer"
        >
          <span v-if="loadingSubmit" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Confirmar Operación</span>
        </button>
      </div>

      <!-- Panel de Desglose Físico -->
      <div class="bg-white/85 dark:bg-gray-800/85 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-lg md:col-span-2 space-y-4">
        
        <!-- Pestañas de Compartimento (Bueno / Deteriorado) -->
        <div class="flex border-b border-gray-150 dark:border-gray-750 select-none">
          <button
            @click="activeCompartment = 'bueno'"
            class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
            :class="activeCompartment === 'bueno' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Dinero Bueno
          </button>
          <button
            v-if="tipoOperacion === 'egreso'"
            @click="activeCompartment = 'deteriorado'"
            class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
            :class="activeCompartment === 'deteriorado' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Deteriorado
          </button>
        </div>

        <!-- Tipo Denominación Tab (Billetes / Monedas) -->
        <div class="flex gap-2 select-none">
          <button
            @click="activeType = 'billete'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="activeType === 'billete' ? 'bg-slate-100 dark:bg-gray-700 text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Billetes
          </button>
          <button
            @click="activeType = 'moneda'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="activeType === 'moneda' ? 'bg-slate-100 dark:bg-gray-700 text-gray-800 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Monedas
          </button>
        </div>

        <div v-if="!bovedaId" class="text-center py-16 text-gray-450 italic text-sm">
          Por favor, seleccione una Bóveda para comenzar a operar.
        </div>

        <div v-else-if="loadingStock" class="flex flex-col items-center justify-center py-16 space-y-3">
          <div class="w-8 h-8 border-3 border-azul-cope border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs font-bold text-gray-400 uppercase">Consultando disponibilidad en Bóveda...</p>
        </div>

        <!-- Inputs de Cantidades -->
        <div v-else class="space-y-3 overflow-y-auto max-h-[50vh] pr-2">
          <div
            v-for="denom in currentList"
            :key="denom.id"
            class="p-3.5 rounded-2xl bg-gray-55 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-750 flex items-center justify-between gap-4 transition-all"
            :class="tipoOperacion === 'egreso' && (denom.cantidad_operar || 0) > getStock(denom.id) ? 'border-red-300 bg-red-50/20' : ''"
          >
            <div class="flex-1">
              <span class="block font-bold text-gray-900 dark:text-white">{{ denom.nombre }}</span>
              <span v-if="tipoOperacion === 'egreso'" class="block text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wide">
                Disponible en Bóveda: {{ getStock(denom.id) }} piezas
              </span>
            </div>

            <!-- Cantidad input -->
            <div class="flex items-center gap-3 w-48 justify-end">
              <input
                v-model.number="denom.cantidad_operar"
                type="number"
                min="0"
                :max="tipoOperacion === 'egreso' ? getStock(denom.id) : undefined"
                @input="validateInput(denom)"
                class="block w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent transition-all"
                placeholder="0"
              />
              <span class="w-20 text-right font-mono font-bold text-gray-700 dark:text-gray-350 text-xs">
                {{ formatCurrency((denom.cantidad_operar || 0) * denom.valor) }}
              </span>
            </div>
          </div>
        </div>

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
  tipo_caja: string
  agencia_id: number
  agencia?: {
    id: number
    nombre: string
  }
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
  cantidad_operar?: number
}

const activeCompartment = ref<'bueno' | 'deteriorado'>('bueno')
const activeType = ref<'billete' | 'moneda'>('billete')
const tipoOperacion = ref<'ingreso' | 'egreso'>('ingreso') // ingreso = inyectar, egreso = remesar
const loadingStock = ref(false)
const loadingSubmit = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const bovedaId = ref<number | null>(null)
const cajasList = ref<Caja[]>([])

// Mapeos separados para Bueno y Deteriorado
const denominacionesBueno = ref<Denominacion[]>([])
const denominacionesDeteriorado = ref<Denominacion[]>([])

// Stocks netos cargados
const stockDisponibleBueno = ref<Record<number, number>>({})
const stockDisponibleDeteriorado = ref<Record<number, number>>({})

// Computeds
const bovedasDisponibles = computed(() => {
  return cajasList.value.filter(c => c.tipo_caja === 'boveda')
})

const currentList = computed(() => {
  const sourceList = activeCompartment.value === 'bueno' ? denominacionesBueno.value : denominacionesDeteriorado.value
  return sourceList.filter(d => d.tipo === activeType.value)
})

const totalPiezas = computed(() => {
  const sumBueno = denominacionesBueno.value.reduce((sum, d) => sum + (Number(d.cantidad_operar) || 0), 0)
  const sumDet = tipoOperacion.value === 'egreso'
    ? denominacionesDeteriorado.value.reduce((sum, d) => sum + (Number(d.cantidad_operar) || 0), 0)
    : 0
  return sumBueno + sumDet
})

const totalMonto = computed(() => {
  const sumBueno = denominacionesBueno.value.reduce((sum, d) => sum + (Number(d.cantidad_operar) || 0) * d.valor, 0)
  const sumDet = tipoOperacion.value === 'egreso'
    ? denominacionesDeteriorado.value.reduce((sum, d) => sum + (Number(d.cantidad_operar) || 0) * d.valor, 0)
    : 0
  return sumBueno + sumDet
})

// Helpers
const getStock = (denomId: number): number => {
  return activeCompartment.value === 'bueno'
    ? (stockDisponibleBueno.value[denomId] || 0)
    : (stockDisponibleDeteriorado.value[denomId] || 0)
}

const setTipoOperacion = (tipo: 'ingreso' | 'egreso') => {
  tipoOperacion.value = tipo
  activeCompartment.value = 'bueno'
  // Limpiar inputs
  denominacionesBueno.value.forEach(d => d.cantidad_operar = undefined)
  denominacionesDeteriorado.value.forEach(d => d.cantidad_operar = undefined)
  successMsg.value = ''
  errorMsg.value = ''
}

const onBovedaChange = async () => {
  if (!bovedaId.value) return
  loadingStock.value = true
  errorMsg.value = ''
  successMsg.value = ''

  // Limpiar inputs
  denominacionesBueno.value.forEach(d => d.cantidad_operar = undefined)
  denominacionesDeteriorado.value.forEach(d => d.cantidad_operar = undefined)

  try {
    const res = await axios.get('/reportes/dashboard-general', {
      params: { agencia_id: cajasList.value.find(c => c.id === bovedaId.value)?.agencia_id }
    })

    const matriz = res.data.matriz
    const id = bovedaId.value

    const tempStockBueno: Record<number, number> = {}
    const tempStockDeteriorado: Record<number, number> = {}

    denominacionesBueno.value.forEach(d => {
      const row = matriz[id]?.[d.id]
      if (row) {
        tempStockBueno[d.id] = Number(row.saldo_inicial_cantidad || 0) + Number(row.ingresos_cantidad || 0) - Number(row.egresos_cantidad || 0)
        tempStockDeteriorado[d.id] = Number(row.deteriorado_inicial_cantidad || 0) + Number(row.deteriorado_ingreso_cantidad || 0) - Number(row.deteriorado_egreso_cantidad || 0)
      } else {
        tempStockBueno[d.id] = 0
        tempStockDeteriorado[d.id] = 0
      }
    })

    stockDisponibleBueno.value = tempStockBueno
    stockDisponibleDeteriorado.value = tempStockDeteriorado

  } catch (err) {
    errorMsg.value = 'No se pudo cargar el saldo disponible de la Bóveda.'
  } finally {
    loadingStock.value = false
  }
}

const validateInput = (denom: Denominacion) => {
  if (tipoOperacion.value === 'egreso') {
    const stock = getStock(denom.id)
    if (denom.cantidad_operar && denom.cantidad_operar > stock) {
      denom.cantidad_operar = stock
    }
  }
  if (denom.cantidad_operar && denom.cantidad_operar < 0) {
    denom.cantidad_operar = 0
  }
}

const submitOperacion = async () => {
  if (!bovedaId.value || totalMonto.value === 0) return

  loadingSubmit.value = true
  successMsg.value = ''
  errorMsg.value = ''

  // Consolidar detalles
  const detalles: any[] = []
  
  denominacionesBueno.value
    .filter(d => Number(d.cantidad_operar) > 0)
    .forEach(d => {
      detalles.push({
        denominacion_id: d.id,
        cantidad: Number(d.cantidad_operar),
        estado_dinero: 'bueno'
      })
    })

  if (tipoOperacion.value === 'egreso') {
    denominacionesDeteriorado.value
      .filter(d => Number(d.cantidad_operar) > 0)
      .forEach(d => {
        detalles.push({
          denominacion_id: d.id,
          cantidad: Number(d.cantidad_operar),
          estado_dinero: 'deteriorado'
        })
      })
  }

  try {
    await axios.post('/cajas/bancos-operacion', {
      boveda_id: bovedaId.value,
      tipo_operacion: tipoOperacion.value,
      detalles: detalles
    })

    successMsg.value = tipoOperacion.value === 'ingreso'
      ? '¡Inyección de fondos desde banco externo realizada exitosamente!'
      : '¡Remesa / Extracción de fondos hacia banco externo realizada exitosamente!'

    bovedaId.value = null
    denominacionesBueno.value.forEach(d => d.cantidad_operar = undefined)
    denominacionesDeteriorado.value.forEach(d => d.cantidad_operar = undefined)

  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al ejecutar la operación bancaria.'
  } finally {
    loadingSubmit.value = false
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const fetchData = async () => {
  try {
    const [resCajas, resDenom] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    cajasList.value = resCajas.data
    
    // Asignar listas reactivas separadas
    denominacionesBueno.value = resDenom.data.map((d: any) => ({ ...d, cantidad_operar: undefined }))
    denominacionesDeteriorado.value = resDenom.data.map((d: any) => ({ ...d, cantidad_operar: undefined }))
  } catch (err) {
    errorMsg.value = 'Error al precargar agencias y denominaciones.'
  }
}

onMounted(() => {
  fetchData()
})
</script>
