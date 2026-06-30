<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Carga Inicial de Día Cero (Producción)
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Inyecta el saldo físico y genera la fotografía del cierre de ayer por única vez para arrancar operaciones hoy.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulario de Inicializacion -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700/60">
            Arqueo de Día Cero
          </h2>

          <!-- Alert / Status -->
          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-800 dark:text-red-300">
            {{ error }}
          </div>

          <div v-if="successMsg" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-bold text-green-800 dark:text-green-300">
            {{ successMsg }}
          </div>

          <!-- Context selectors -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Agencia -->
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Agencia</label>
              <select
                v-model="selectedAgenciaId"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              >
                <option value="">-- Seleccionar Agencia --</option>
                <option v-for="ag in agencias" :key="ag.id" :value="ag.id">
                  {{ ag.nombre }}
                </option>
              </select>
            </div>

            <!-- Caja -->
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Caja a Inicializar <span class="text-red-500">*</span></label>
              <select
                v-model="selectedCajaId"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
                :disabled="!selectedAgenciaId"
              >
                <option value="">-- Seleccionar Caja --</option>
                <option v-for="caja in filteredCajas" :key="caja.id" :value="caja.id">
                  {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }})
                </option>
              </select>
            </div>
          </div>

          <!-- Campos históricos adicionales para la Bóveda -->
          <div v-if="isBovedaSeleccionada" class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl">
            <div>
              <label class="block text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider mb-2">Saldo Inicial Histórico de Cajillas (Q)</label>
              <input
                v-model.number="saldoCajillas"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider mb-2">Saldo Inicial Histórico Deteriorado (Q)</label>
              <input
                v-model.number="saldoDeteriorado"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
              />
            </div>
          </div>

          <!-- Denomination Grid -->
          <div class="space-y-6" v-if="selectedCajaId">
            <!-- Billetes -->
            <div v-if="billetesList.length > 0" class="space-y-3">
              <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Billetes</h3>
              <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-1/3">Denominación</th>
                      <th class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in billetesList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-28">
                        {{ formatCurrency(calculaSubtotal(denom)) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Monedas -->
            <div v-if="monedasList.length > 0" class="space-y-3">
              <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Monedas</h3>
              <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-1/3">Denominación</th>
                      <th class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in monedasList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-28">
                        {{ formatCurrency(calculaSubtotal(denom)) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Justificacion -->
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Justificación / Bitácora Opcional</label>
              <textarea
                v-model="observaciones"
                rows="3"
                placeholder="Ej. Carga de saldo físico inicial verificado contra Core Bancario..."
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm"
              ></textarea>
            </div>

            <!-- Acciones -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60">
              <button
                @click="resetForm"
                class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Limpiar
              </button>
              <button
                @click="submitCarga"
                :disabled="submitting || totalDeclarado === 0"
                class="px-6 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <svg v-if="submitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ejecutar Carga Inicial de Día Cero
              </button>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-450 dark:text-gray-500 italic text-sm">
            Selecciona una agencia y caja para iniciar la carga.
          </div>
        </div>
      </div>

      <!-- Resumen Lateral Comparador -->
      <div class="space-y-6">
        <div class="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Totalizador</h3>

          <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl flex flex-col items-center justify-center">
            <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Monto a Inyectar</span>
            <span class="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
              {{ formatCurrency(totalDeclarado) }}
            </span>
          </div>

          <!-- Alert de Candado de Seguridad -->
          <div class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-250 dark:border-red-900/30 rounded-xl text-xs text-red-800 dark:text-red-300 font-semibold leading-relaxed space-y-1">
            <p class="font-bold flex items-center gap-1 text-red-700 dark:text-red-400">🛡️ Candado de Un Solo Uso</p>
            Esta acción simulará el arqueo físico de anoche y cargará saldo al sistema. El backend bloqueará permanentemente cualquier carga posterior si la caja ya registra algún movimiento operativo en su historial.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'

interface Agencia {
  id: number
  nombre: string
}

interface Caja {
  id: number
  nombre: string
  tipo_caja: string
  estado: boolean
  agencia_id: number
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
  cantidad_buena: number
  cantidad_deteriorada: number
}

// State
const agencias = ref<Agencia[]>([])
const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const selectedAgenciaId = ref('')
const selectedCajaId = ref('')
const saldoCajillas = ref<number | null>(null)
const saldoDeteriorado = ref<number | null>(null)
const observaciones = ref('')
const error = ref('')
const successMsg = ref('')
const submitting = ref(false)

const localDenominaciones = ref<Denominacion[]>([])

// Computeds
const filteredCajas = computed(() => {
  if (!selectedAgenciaId.value) return []
  return cajas.value.filter(c => c.agencia_id === Number(selectedAgenciaId.value) && c.estado)
})

const isBovedaSeleccionada = computed(() => {
  if (!selectedCajaId.value) return false
  const caja = cajas.value.find(c => c.id === Number(selectedCajaId.value))
  return caja ? caja.tipo_caja === 'boveda' : false
})

const billetesList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'moneda'))

const calculaSubtotal = (d: Denominacion) => {
  const buena = d.cantidad_buena || 0
  const det = d.cantidad_deteriorada || 0
  return d.valor * (buena + det)
}

const totalDeclarado = computed(() => {
  return localDenominaciones.value.reduce((acc, d) => acc + calculaSubtotal(d), 0)
})

// Acciones
const resetForm = () => {
  localDenominaciones.value = denominaciones.value.map(d => ({
    ...d,
    cantidad_buena: 0,
    cantidad_deteriorada: 0
  }))
  observaciones.value = ''
  selectedCajaId.value = ''
  saldoCajillas.value = null
  saldoDeteriorado.value = null
  error.value = ''
  successMsg.value = ''
}

const fetchData = async () => {
  try {
    const [agRes, cajasRes, denomsRes] = await Promise.all([
      axios.get('/agencias'),
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    agencias.value = agRes.data
    cajas.value = cajasRes.data
    denominaciones.value = denomsRes.data.filter((d: any) => d.activo)

    localDenominaciones.value = denominaciones.value.map(d => ({
      ...d,
      cantidad_buena: 0,
      cantidad_deteriorada: 0
    }))
  } catch (err) {
    error.value = 'Error al cargar los catálogos.'
  }
}

const submitCarga = async () => {
  error.value = ''
  successMsg.value = ''
  submitting.value = true

  const detalles = localDenominaciones.value
    .filter(d => d.cantidad_buena > 0 || d.cantidad_deteriorada > 0)
    .flatMap(d => {
      const items = []
      if (d.cantidad_buena > 0) {
        items.push({
          denominacion_id: d.id,
          estado_dinero: 'bueno',
          cantidad: d.cantidad_buena
        })
      }
      if (d.cantidad_deteriorada > 0) {
        items.push({
          denominacion_id: d.id,
          estado_dinero: 'deteriorado',
          cantidad: d.cantidad_deteriorada
        })
      }
      return items
    })

  if (detalles.length === 0) {
    error.value = 'Debe declarar cantidades del arqueo antes de inicializar.'
    submitting.value = false
    return
  }

  try {
    await axios.post(`/cajas/${selectedCajaId.value}/dia-cero`, {
      detalles,
      saldo_cajillas: isBovedaSeleccionada.value ? (saldoCajillas.value || 0) : 0,
      saldo_deteriorado: isBovedaSeleccionada.value ? (saldoDeteriorado.value || 0) : 0,
      observaciones: observaciones.value
    })

    successMsg.value = '¡Carga inicial de Día Cero procesada correctamente! La caja está lista para abrir.'
    resetForm()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al procesar la carga inicial.'
  } finally {
    submitting.value = false
  }
}

const formatTipo = (tipo: string) => {
  if (tipo === 'boveda') return 'Bóveda'
  if (tipo === 'general') return 'Caja General'
  return 'Ventanilla'
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

onMounted(() => {
  fetchData()
})
</script>
