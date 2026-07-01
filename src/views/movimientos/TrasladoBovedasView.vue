<template>
  <div class="p-6 w-full space-y-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
        Traslado entre Bóvedas
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Inyecta saldo o mueve efectivo Dinero Bueno de una Bóveda a otra a través de la Caja General del sistema.
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
      
      <!-- Panel de Cajas -->
      <div class="bg-white/85 dark:bg-gray-800/85 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-lg space-y-5 md:col-span-1">
        <h3 class="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-2">Puntos de Traslado</h3>

        <!-- Bóveda Origen -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">Bóveda Origen</label>
          <select
            v-model="bovedaOrigenId"
            @change="onBovedaOrigenChange"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-bold transition-all"
          >
            <option :value="null" disabled>Seleccionar origen</option>
            <option v-for="caja in bovedasDisponibles" :key="caja.id" :value="caja.id">
              {{ caja.nombre }} ({{ caja.agencia?.nombre }})
            </option>
          </select>
        </div>

        <!-- Bóveda Destino -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">Bóveda Destino</label>
          <select
            v-model="bovedaDestinoId"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-bold transition-all"
          >
            <option :value="null" disabled>Seleccionar destino</option>
            <option v-for="caja in bovedasDestinoFiltradas" :key="caja.id" :value="caja.id">
              {{ caja.nombre }} ({{ caja.agencia?.nombre }})
            </option>
          </select>
        </div>

        <!-- Resumen de Envío -->
        <div class="pt-4 border-t border-gray-150 dark:border-gray-750 text-xs space-y-2">
          <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
            <span>Total de Piezas:</span>
            <span class="font-bold font-mono text-gray-800 dark:text-white">{{ totalPiezas }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
            <span>Monto Total a Enviar:</span>
            <span class="text-base font-extrabold font-mono text-azul-cope dark:text-cyan-400">{{ formatCurrency(totalMonto) }}</span>
          </div>
        </div>

        <button
          @click="submitTraslado"
          :disabled="loadingSubmit || !bovedaOrigenId || !bovedaDestinoId || totalMonto === 0"
          class="w-full inline-flex items-center justify-center py-3 bg-azul-cope hover:bg-azul-cope/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 gap-2 text-sm cursor-pointer"
        >
          <span v-if="loadingSubmit" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Procesar Traslado</span>
        </button>
      </div>

      <!-- Panel de Desglose Físico -->
      <div class="bg-white/85 dark:bg-gray-800/85 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-lg md:col-span-2 space-y-4">
        
        <!-- Pestañas Tipo Denominación -->
        <div class="flex border-b border-gray-150 dark:border-gray-750 select-none">
          <button
            @click="activeTab = 'billete'"
            class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
            :class="activeTab === 'billete' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Billetes
          </button>
          <button
            @click="activeTab = 'moneda'"
            class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
            :class="activeTab === 'moneda' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Monedas
          </button>
        </div>

        <div v-if="!bovedaOrigenId" class="text-center py-16 text-gray-450 italic text-sm">
          Por favor, seleccione una Bóveda Origen para verificar la disponibilidad de efectivo.
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
            :class="Number(denom.cantidad_enviar) > (stockDisponible[denom.id] || 0) ? 'border-red-300 bg-red-50/20' : ''"
          >
            <div class="flex-1">
              <span class="block font-bold text-gray-900 dark:text-white">{{ denom.nombre }}</span>
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Disponible en Bóveda: {{ stockDisponible[denom.id] || 0 }} piezas
              </span>
            </div>

            <!-- Cantidad input -->
            <div class="flex items-center gap-3 w-48 justify-end">
              <input
                v-model.number="denom.cantidad_enviar"
                type="number"
                min="0"
                :max="stockDisponible[denom.id] || 0"
                @input="validateInput(denom)"
                class="block w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent transition-all"
                placeholder="0"
              />
              <span class="w-20 text-right font-mono font-bold text-gray-700 dark:text-gray-350 text-xs">
                {{ formatCurrency((denom.cantidad_enviar || 0) * denom.valor) }}
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
  cantidad_enviar?: number
}

const activeTab = ref<'billete' | 'moneda'>('billete')
const loadingStock = ref(false)
const loadingSubmit = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const bovedaOrigenId = ref<number | null>(null)
const bovedaDestinoId = ref<number | null>(null)
const cajasList = ref<Caja[]>([])
const denominacionesList = ref<Denominacion[]>([])
const stockDisponible = ref<Record<number, number>>({})

// Computeds
const bovedasDisponibles = computed(() => {
  return cajasList.value.filter(c => c.tipo_caja === 'boveda')
})

const bovedasDestinoFiltradas = computed(() => {
  return bovedasDisponibles.value.filter(c => c.id !== bovedaOrigenId.value)
})

const currentList = computed(() => {
  return denominacionesList.value.filter(d => d.tipo === activeTab.value)
})

const totalPiezas = computed(() => {
  return denominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_enviar) || 0), 0)
})

const totalMonto = computed(() => {
  return denominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_enviar) || 0) * d.valor, 0)
})

// Acciones
const onBovedaOrigenChange = async () => {
  if (!bovedaOrigenId.value) return
  bovedaDestinoId.value = null
  loadingStock.value = true
  errorMsg.value = ''
  successMsg.value = ''

  // Limpiar inputs
  denominacionesList.value.forEach(d => {
    d.cantidad_enviar = undefined
  })

  try {
    // Para ver el stock disponible de Dinero Bueno de la Bóveda Origen, llamamos al endpoint del Dashboard
    // y extraemos las piezas netas calculadas para esa caja
    const res = await axios.get('/reportes/dashboard-general', {
      params: { agencia_id: cajasList.value.find(c => c.id === bovedaOrigenId.value)?.agencia_id }
    })

    const matriz = res.data.matriz
    const bovedaId = bovedaOrigenId.value

    const tempStock: Record<number, number> = {}
    denominacionesList.value.forEach(d => {
      const row = matriz[bovedaId]?.[d.id]
      if (row) {
        tempStock[d.id] = Number(row.saldo_inicial_cantidad || 0) + Number(row.ingresos_cantidad || 0) - Number(row.egresos_cantidad || 0)
      } else {
        tempStock[d.id] = 0
      }
    })
    stockDisponible.value = tempStock

  } catch (err) {
    errorMsg.value = 'No se pudo cargar el saldo disponible de la Bóveda origen.'
  } finally {
    loadingStock.value = false
  }
}

const validateInput = (denom: Denominacion) => {
  const stock = stockDisponible.value[denom.id] || 0
  if (denom.cantidad_enviar && denom.cantidad_enviar > stock) {
    denom.cantidad_enviar = stock
  }
  if (denom.cantidad_enviar && denom.cantidad_enviar < 0) {
    denom.cantidad_enviar = 0
  }
}

const submitTraslado = async () => {
  if (!bovedaOrigenId.value || !bovedaDestinoId.value || totalMonto.value === 0) return

  loadingSubmit.value = true
  successMsg.value = ''
  errorMsg.value = ''

  const detalles = denominacionesList.value
    .filter(d => Number(d.cantidad_enviar) > 0)
    .map(d => ({
      denominacion_id: d.id,
      cantidad: Number(d.cantidad_enviar)
    }))

  try {
    await axios.post('/cajas/traslado-bovedas', {
      boveda_origen_id: bovedaOrigenId.value,
      boveda_destino_id: bovedaDestinoId.value,
      detalles: detalles
    })

    successMsg.value = '¡Traslado entre Bóvedas realizado y registrado exitosamente!'
    bovedaOrigenId.value = null
    bovedaDestinoId.value = null
    denominacionesList.value.forEach(d => {
      d.cantidad_enviar = undefined
    })
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al ejecutar el traslado entre bóvedas.'
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
    denominacionesList.value = resDenom.data.map((d: any) => ({
      ...d,
      cantidad_enviar: undefined
    }))
  } catch (err) {
    errorMsg.value = 'Error al precargar agencias y denominaciones.'
  }
}

onMounted(() => {
  fetchData()
})
</script>
