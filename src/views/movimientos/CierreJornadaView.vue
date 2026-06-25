<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Cierre de Jornada Diaria
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Registra el cierre final de turno de tu caja. El saldo operativo se trasladará automáticamente a la Bóveda principal.
        </p>
      </div>
    </div>

    <!-- main body -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Declaration Form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700/60">
            Declaración de Caja Física (Remanente en Gaveta)
          </h2>

          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-800 dark:text-red-300">
            {{ error }}
          </div>

          <div v-if="successMsg" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-bold text-green-800 dark:text-green-300">
            {{ successMsg }}
          </div>

          <!-- Select Box -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seleccionar Caja a Cerrar <span class="text-red-500">*</span></label>
            <select
              v-model="selectedCajaId"
              @change="onCajaChange"
              class="block w-full md:w-80 px-3 py-2.5 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
            >
              <option value="">-- Seleccionar Caja --</option>
              <option v-for="caja in cajas" :key="caja.id" :value="caja.id">
                {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }}) - Turno: {{ caja.usuario_en_turno?.name || 'Sin Cajero' }}
              </option>
            </select>
          </div>

          <!-- Declaracion de efectivo físico -->
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
                          :disabled="deshabilitaDeterioradoPorCaja"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-850"
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
                          :disabled="deshabilitaDeterioradoPorCaja"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-850"
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

            <!-- Acciones -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60">
              <button
                @click="confirmModalOpen = true"
                class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                Ejecutar Cierre y Trasladar
              </button>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-450 dark:text-gray-500 italic text-sm">
            Selecciona una caja arriba para cargar la información de cierre.
          </div>
        </div>
      </div>

      <!-- Resumen de Sistema y Saldos Esperados -->
      <div class="space-y-6">
        <div class="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Monitoreo de Sistema</h3>

          <div v-if="loadingResumen" class="flex flex-col items-center py-6 space-y-2">
            <div class="w-8 h-8 rounded-full border-2 border-azul-cope border-t-transparent animate-spin"></div>
            <p class="text-xs text-gray-400">Obteniendo saldo en tiempo real...</p>
          </div>

          <div v-else-if="resumen" class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">Saldo Inicial</span>
              <span class="font-mono text-sm text-gray-900 dark:text-white">{{ formatCurrency(resumen.saldo_inicial) }}</span>
            </div>

            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span class="text-xs text-green-600 dark:text-green-450 font-bold">Ingresos del Día (+)</span>
              <span class="font-mono text-sm text-green-600 dark:text-green-450 font-bold">+{{ formatCurrency(resumen.ingresos_dia) }}</span>
            </div>

            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span class="text-xs text-red-600 dark:text-red-400 font-bold">Egresos del Día (-)</span>
              <span class="font-mono text-sm text-red-600 dark:text-red-400 font-bold">-{{ formatCurrency(resumen.egresos_dia) }}</span>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-sm font-bold text-azul-cope dark:text-blue-400">Saldo Final Esperado</span>
              <span class="font-mono text-base font-extrabold text-azul-cope dark:text-blue-400">{{ formatCurrency(resumen.saldo_actual) }}</span>
            </div>

            <!-- Gran Total Declarado Comparador -->
            <div class="p-4 bg-gray-55 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Declarado en Gaveta</span>
              <span class="text-xl font-extrabold font-mono text-gray-900 dark:text-white">
                {{ formatCurrency(totalDeclarado) }}
              </span>
            </div>
          </div>

          <div v-else class="text-center py-6 text-gray-400 text-xs italic">
            Selecciona una caja para ver el saldo esperado en el sistema.
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMACION CIERRE -->
    <Transition name="fade">
      <div v-if="confirmModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md border border-gray-250 dark:border-gray-700 shadow-2xl p-6 space-y-6">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-red-100 dark:bg-red-950/30 text-red-650 dark:text-red-400 rounded-2xl shrink-0">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">¿Ejecutar Cierre Diario de Caja?</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Esta acción es <strong>invariable y definitiva</strong>:
              </p>
              <ul class="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                <li>Se registrará el desglose físico de gaveta por <span class="font-bold text-gray-900 dark:text-white">{{ formatCurrency(totalDeclarado) }}</span>.</li>
                <li>Se realizará el <strong>barrido virtual</strong> de saldos hacia la Bóveda.</li>
                <li>Tu turno de cajero asignado a esta caja finalizará inmediatamente.</li>
              </ul>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              @click="confirmModalOpen = false"
              class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-800 dark:text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              @click="submitCierre"
              :disabled="submitting"
              class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              {{ submitting ? 'Cerrando...' : 'Confirmar Cierre' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/api/axios'

interface User {
  id: number
  name: string
}

interface Caja {
  id: number
  nombre: string
  tipo_caja: 'boveda' | 'general' | 'ventanilla'
  estado: boolean
  usuario_en_turno?: User
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
  cantidad_buena: number
  cantidad_deteriorada: number
}

interface ResumenCaja {
  saldo_inicial: number
  ingresos_dia: number
  egresos_dia: number
  saldo_actual: number
}

// State
const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const selectedCajaId = ref('')
const error = ref('')
const successMsg = ref('')
const submitting = ref(false)
const confirmModalOpen = ref(false)

const loadingResumen = ref(false)
const resumen = ref<ResumenCaja | null>(null)

const localDenominaciones = ref<Denominacion[]>([])

// Computeds
const billetesList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'moneda'))

const cajaSeleccionada = computed(() => {
  if (!selectedCajaId.value) return null
  return cajas.value.find(c => c.id === Number(selectedCajaId.value)) || null
})

// Bóveda origen desactiva deteriorados
const deshabilitaDeterioradoPorCaja = computed(() => {
  return cajaSeleccionada.value?.tipo_caja === 'boveda'
})

// Subtotal por denominación
const calculaSubtotal = (d: Denominacion) => {
  const buena = d.cantidad_buena || 0
  const det = deshabilitaDeterioradoPorCaja.value ? 0 : (d.cantidad_deteriorada || 0)
  return d.valor * (buena + det)
}

// Total declarado
const totalDeclarado = computed(() => {
  return localDenominaciones.value.reduce((acc, d) => acc + calculaSubtotal(d), 0)
})

// Resetear deteriorados a 0 si la caja elegida es boveda
watch(deshabilitaDeterioradoPorCaja, (newVal) => {
  if (newVal) {
    localDenominaciones.value.forEach(d => {
      d.cantidad_deteriorada = 0
    })
  }
})

// Acciones
const resetForm = () => {
  localDenominaciones.value = denominaciones.value.map(d => ({
    ...d,
    cantidad_buena: 0,
    cantidad_deteriorada: 0
  }))
  resumen.value = null
  selectedCajaId.value = ''
  error.value = ''
  successMsg.value = ''
}

const onCajaChange = async () => {
  if (!selectedCajaId.value) {
    resumen.value = null
    return
  }
  loadingResumen.value = true
  error.value = ''
  try {
    const res = await axios.get(`/cajas/${selectedCajaId.value}/saldo-actual`)
    resumen.value = res.data
  } catch (err: any) {
    error.value = 'No se pudo cargar el balance en tiempo real de la caja.'
  } finally {
    loadingResumen.value = false
  }
}

const fetchData = async () => {
  try {
    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    cajas.value = cajasRes.data.filter((c: any) => c.estado)
    denominaciones.value = denomsRes.data.filter((d: any) => d.activo)

    localDenominaciones.value = denominaciones.value.map(d => ({
      ...d,
      cantidad_buena: 0,
      cantidad_deteriorada: 0
    }))
  } catch (err: any) {
    error.value = 'Error al cargar catálogos.'
  }
}

const submitCierre = async () => {
  error.value = ''
  successMsg.value = ''
  submitting.value = true
  confirmModalOpen.value = false

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
      if (d.cantidad_deteriorada > 0 && !deshabilitaDeterioradoPorCaja.value) {
        items.push({
          denominacion_id: d.id,
          estado_dinero: 'deteriorado',
          cantidad: d.cantidad_deteriorada
        })
      }
      return items
    })

  if (detalles.length === 0) {
    error.value = 'Debe declarar cantidades del arqueo de gaveta antes de cerrar.'
    submitting.value = false
    return
  }

  try {
    await axios.post('/cajas/cierres-diarios', {
      caja_id: Number(selectedCajaId.value),
      detalles
    })

    successMsg.value = '¡Cierre Diario y barrido completado con éxito!'
    resetForm()
    await fetchData()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al procesar el cierre diario.'
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
