<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-5xl border border-gray-250 dark:border-gray-700 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Registrar Movimiento de Efectivo
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Doble entrada en lote: ingresa cantidades buenas y deterioradas por denominación
            </p>
          </div>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-650 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-705 transition-all cursor-pointer"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body Form -->
        <form @submit.prevent="submitForm" class="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <!-- Alert / Error message -->
          <div v-if="formError" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-xs font-semibold text-red-800 dark:text-red-300">{{ formError }}</span>
          </div>

          <!-- Fila Origen, Destino, Categoria -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Origen -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Caja/Bóveda Origen <span class="text-red-500">*</span></label>
              <select
                v-model="form.origen_caja_id"
                @change="handleOrigenChange"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
                required
              >
                <option value="">-- Seleccionar Origen --</option>
                <option v-for="caja in cajas" :key="caja.id" :value="caja.id" :disabled="!caja.estado">
                  {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }})
                </option>
              </select>
            </div>

            <!-- Destino -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Caja/Bóveda Destino <span class="text-red-500">*</span></label>
              <select
                v-model="form.destino_caja_id"
                @change="handleDestinoChange"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
                required
              >
                <option value="">-- Seleccionar Destino --</option>
                <option v-for="caja in cajas" :key="caja.id" :value="caja.id" :disabled="caja.id === Number(form.origen_caja_id) || !caja.estado">
                  {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }})
                </option>
              </select>
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Categoría <span class="text-red-500">*</span></label>
              <select
                v-model="form.categoria_movimiento"
                class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
                required
              >
                <option value="billetes">Billetes</option>
                <option value="monedas">Monedas</option>
                <option value="cajilla">Cajilla</option>
                <option value="deteriorados">Deteriorados</option>
              </select>
            </div>
          </div>

          <!-- Fila Operación e Indicador Informativo -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Dirección de Operación <span class="text-red-500">*</span></label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300 select-none">
                  <input type="radio" v-model="form.tipo_operacion" value="egreso" class="accent-azul-cope" />
                  Egreso (Sale del Origen)
                </label>
                <label class="flex items-center gap-2 cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300 select-none">
                  <input type="radio" v-model="form.tipo_operacion" value="ingreso" class="accent-azul-cope" />
                  Ingreso (Entra al Destino)
                </label>
              </div>
            </div>

            <!-- Cartel de Reglas UX Dinámicas -->
            <div v-if="deshabilitaDeterioradoPorOrigen || deshabilitaDeterioradoPorDestino" class="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-105 dark:border-blue-900/30 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span v-if="deshabilitaDeterioradoPorOrigen">
                Origen es una Bóveda. No se permite egresar efectivo deteriorado. Columna deshabilitada.
              </span>
              <span v-else-if="deshabilitaDeterioradoPorDestino">
                Destino es una Ventanilla. No se permite enviar efectivo deteriorado. Columna deshabilitada.
              </span>
            </div>
          </div>

          <!-- Tabla de doble entrada para Denominaciones (Billetes y Monedas por separado) -->
          <div class="space-y-6">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
              Detalle de Denominaciones a Trasladar
            </h3>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Billetes -->
              <div v-if="billetesList.length > 0" class="space-y-3">
                <h4 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Billetes</h4>
                <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th class="p-3 w-2/5">Denominación</th>
                        <th v-if="form.categoria_movimiento !== 'deteriorados'" class="p-3 w-1/4 text-center">Cant. Buena</th>
                        <th v-if="form.categoria_movimiento === 'deteriorados'" class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                        <th class="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                      <tr v-for="denom in billetesList" :key="denom.id">
                        <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                          {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                        </td>
                        <td v-if="form.categoria_movimiento !== 'deteriorados'" class="p-3">
                          <input
                            v-model.number="denom.cantidad_buena"
                            type="number"
                            min="0"
                            placeholder="0"
                            class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-655 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                          />
                        </td>
                        <td v-if="form.categoria_movimiento === 'deteriorados'" class="p-3">
                          <input
                            v-model.number="denom.cantidad_deteriorada"
                            type="number"
                            min="0"
                            placeholder="0"
                            :disabled="deshabilitaDeterioradoPorOrigen || deshabilitaDeterioradoPorDestino"
                            class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-655 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                          />
                        </td>
                        <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-28">
                          {{ formatCurrency(calculaSubtotalDenominacion(denom)) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Monedas -->
              <div v-if="monedasList.length > 0" class="space-y-3">
                <h4 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Monedas</h4>
                <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th class="p-3 w-2/5">Denominación</th>
                        <th v-if="form.categoria_movimiento !== 'deteriorados'" class="p-3 w-1/4 text-center">Cant. Buena</th>
                        <th v-if="form.categoria_movimiento === 'deteriorados'" class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                        <th class="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                      <tr v-for="denom in monedasList" :key="denom.id">
                        <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                          {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                        </td>
                        <td v-if="form.categoria_movimiento !== 'deteriorados'" class="p-3">
                          <input
                            v-model.number="denom.cantidad_buena"
                            type="number"
                            min="0"
                            placeholder="0"
                            class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-655 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                          />
                        </td>
                        <td v-if="form.categoria_movimiento === 'deteriorados'" class="p-3">
                          <input
                            v-model.number="denom.cantidad_deteriorada"
                            type="number"
                            min="0"
                            placeholder="0"
                            :disabled="deshabilitaDeterioradoPorOrigen || deshabilitaDeterioradoPorDestino"
                            class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-655 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-855"
                          />
                        </td>
                        <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-28">
                          {{ formatCurrency(calculaSubtotalDenominacion(denom)) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Gran Total Informativo -->
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-250 uppercase tracking-wider">Gran Total del Movimiento</span>
              <span class="text-2xl font-extrabold font-mono text-azul-cope dark:text-white">
                {{ formatCurrency(granTotal) }}
              </span>
            </div>
          </div>

          <!-- Descripción / Comentarios -->
          <div>
            <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Comentarios / Bitácora Opcional</label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              placeholder="Escribe comentarios o detalles sobre este traslado (Ej. Número de bolsa de seguridad, valija)..."
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-605 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm transition-all"
            ></textarea>
          </div>

          <!-- Acciones de Formulario -->
          <div class="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              @click="handleClose"
              class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-55 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting || granTotal === 0"
              class="px-6 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <svg v-if="submitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ submitting ? 'Procesando...' : 'Aplicar Traslado' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import axios from '@/api/axios'

interface Caja {
  id: number
  nombre: string
  tipo_caja: 'boveda' | 'general' | 'ventanilla'
  estado: boolean
  agencia?: { nombre: string }
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
  cantidad_buena?: number
  cantidad_deteriorada?: number
}

const props = defineProps<{
  isOpen: boolean
  cajas: Caja[]
  denominaciones: Denominacion[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formError = ref('')
const submitting = ref(false)

const form = ref({
  origen_caja_id: '',
  destino_caja_id: '',
  tipo_operacion: 'egreso' as 'ingreso' | 'egreso',
  categoria_movimiento: 'billetes',
  descripcion: '',
})

const localDenominaciones = ref<Denominacion[]>([])

// Initialize or reset localDenominaciones when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    formError.value = ''
    form.value = {
      origen_caja_id: '',
      destino_caja_id: '',
      tipo_operacion: 'egreso',
      categoria_movimiento: 'billetes',
      descripcion: '',
    }
    localDenominaciones.value = props.denominaciones.map(d => ({
      ...d,
      cantidad_buena: 0,
      cantidad_deteriorada: 0
    }))
  }
})

// Divide localDenominaciones
const billetesList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'moneda'))

const origenCajaSeleccionada = computed(() => {
  if (!form.value.origen_caja_id) return null
  return props.cajas.find(c => c.id === Number(form.value.origen_caja_id)) || null
})

const destinoCajaSeleccionada = computed(() => {
  if (!form.value.destino_caja_id) return null
  return props.cajas.find(c => c.id === Number(form.value.destino_caja_id)) || null
})

const deshabilitaDeterioradoPorOrigen = computed(() => {
  return origenCajaSeleccionada.value?.tipo_caja === 'boveda'
})

const deshabilitaDeterioradoPorDestino = computed(() => {
  return destinoCajaSeleccionada.value?.tipo_caja === 'ventanilla'
})

const calculaSubtotalDenominacion = (d: Denominacion) => {
  if (form.value.categoria_movimiento === 'deteriorados') {
    const deteriorada = d.cantidad_deteriorada || 0
    return d.valor * ((deshabilitaDeterioradoPorOrigen.value || deshabilitaDeterioradoPorDestino.value) ? 0 : deteriorada)
  } else {
    const buena = d.cantidad_buena || 0
    return d.valor * buena
  }
}

const granTotal = computed(() => {
  return localDenominaciones.value.reduce((acc, denom) => {
    return acc + calculaSubtotalDenominacion(denom)
  }, 0)
})

const handleOrigenChange = () => {
  if (form.value.origen_caja_id && form.value.origen_caja_id === form.value.destino_caja_id) {
    form.value.destino_caja_id = ''
  }
  evaluarLimpiezaDeteriorados()
}

const handleDestinoChange = () => {
  evaluarLimpiezaDeteriorados()
}

const evaluarLimpiezaDeteriorados = () => {
  if (deshabilitaDeterioradoPorOrigen.value || deshabilitaDeterioradoPorDestino.value) {
    localDenominaciones.value.forEach(d => {
      d.cantidad_deteriorada = 0
    })
  }
}

const handleClose = () => {
  emit('close')
}

const submitForm = async () => {
  formError.value = ''
  submitting.value = true

  const isDeteriorados = form.value.categoria_movimiento === 'deteriorados'

  const detallesPayload = localDenominaciones.value
    .filter(d => {
      if (isDeteriorados) {
        return (d.cantidad_deteriorada || 0) > 0
      } else {
        return (d.cantidad_buena || 0) > 0
      }
    })
    .map(d => ({
      denominacion_id: d.id,
      cantidad_buena: isDeteriorados ? 0 : (d.cantidad_buena || 0),
      cantidad_deteriorada: isDeteriorados 
        ? ((deshabilitaDeterioradoPorOrigen.value || deshabilitaDeterioradoPorDestino.value) ? 0 : (d.cantidad_deteriorada || 0))
        : 0
    }))

  if (detallesPayload.length === 0) {
    formError.value = 'Debe ingresar al menos una cantidad mayor a cero en los billetes o monedas.'
    submitting.value = false
    return
  }

  try {
    await axios.post('/movimientos', {
      origen_caja_id: form.value.origen_caja_id ? Number(form.value.origen_caja_id) : null,
      destino_caja_id: form.value.destino_caja_id ? Number(form.value.destino_caja_id) : null,
      tipo_operacion: form.value.tipo_operacion,
      categoria_movimiento: form.value.categoria_movimiento,
      descripcion: form.value.descripcion || null,
      detalles: detallesPayload
    })
    emit('success')
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Error al procesar la transacción.'
  } finally {
    submitting.value = false
  }
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
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
