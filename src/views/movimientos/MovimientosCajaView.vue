<template>
  <div class="space-y-6 w-full">
    <!-- Header -->
    <div class="flex items-center justify-between pb-2 border-b border-gray-150 dark:border-gray-750">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Movimientos de Caja
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Registro y control de traslados de efectivo bajo flujo de doble entrada institucional
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold border border-gray-250 dark:border-gray-700/60">
          <span class="w-2.5 h-2.5 rounded-full bg-verde-cope"></span>
          Terminal Activa
        </div>
        <button
          @click="submitForm"
          :disabled="submitting || granTotal === 0"
          class="px-5 py-2.5 bg-azul-cope hover:bg-azul-cope/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg v-if="submitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-else>➕</span>
          {{ submitting ? 'Procesando...' : 'Solicitar Movimiento' }}
        </button>
      </div>
    </div>

    <!-- Main Container -->
    <div class="bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700/60 rounded-3xl shadow-sm overflow-hidden">
      <!-- Body Form -->
      <form @submit.prevent="submitForm" class="p-6 space-y-6">
        <!-- Alert / Error message -->
        <div v-if="formError" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-xs font-semibold text-red-800 dark:text-red-300">{{ formError }}</span>
        </div>

        <!-- Success Message -->
        <div v-if="successMsg" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl flex items-start gap-3">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs font-semibold text-green-800 dark:text-green-300">{{ successMsg }}</span>
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
              <option v-for="caja in cajasFiltradasOrigen" :key="caja.id" :value="caja.id" :disabled="!caja.estado && caja.tipo_caja !== 'general'">
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
              <option v-for="caja in cajasFiltradasDestino" :key="caja.id" :value="caja.id" :disabled="!caja.estado">
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
              <option v-for="cat in categoriasDisponibles" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Fila Operación e Indicador Informativo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Dirección de Operación</label>
            <div class="flex">
              <span 
                v-if="form.tipo_operacion === 'egreso'"
                class="px-4 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider"
              >
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Egreso (Sale de la Bóveda hacia Ventanilla)
              </span>
              <span 
                v-else
                class="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Ingreso (Entra de Ventanilla a la Bóveda)
              </span>
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
                      <th v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th v-if="form.categoria_movimiento === 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in billetesList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-655 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td v-if="form.categoria_movimiento === 'deteriorado'" class="p-3">
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
                      <th v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th v-if="form.categoria_movimiento === 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in monedasList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-655 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td v-if="form.categoria_movimiento === 'deteriorado'" class="p-3">
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
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

interface Caja {
  id: number
  nombre: string
  tipo_caja: 'boveda' | 'general' | 'ventanilla'
  estado: boolean
  agencia_id?: number
  usuario_id?: number | null
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

const formError = ref('')
const successMsg = ref('')
const submitting = ref(false)

const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const localDenominaciones = ref<Denominacion[]>([])

const form = ref({
  origen_caja_id: '',
  destino_caja_id: '',
  tipo_operacion: 'egreso' as 'ingreso' | 'egreso',
  categoria_movimiento: 'abastecimiento',
  descripcion: '',
})

const origenCajaSeleccionada = computed(() => {
  if (!form.value.origen_caja_id) return null
  return cajas.value.find(c => c.id === Number(form.value.origen_caja_id)) || null
})

const cajasFiltradasOrigen = computed(() => {
  const authStore = useAuthStore()
  const userId = authStore.user?.id
  if (!userId) return []

  // 1. Buscar la caja asignada al cajero activo
  const miCaja = cajas.value.find(c => c.usuario_id === userId)
  if (!miCaja) {
    // Si no es cajero (ej. administrador), mostrar todo
    return cajas.value.filter(c => c.estado)
  }

  // 2. Retornar solo su propia caja y la bóveda de su agencia
  return cajas.value.filter(c => {
    return c.estado && (c.id === miCaja.id || (c.tipo_caja === 'boveda' && c.agencia_id === miCaja.agencia_id))
  })
})

const destinoCajaSeleccionada = computed(() => {
  if (!form.value.destino_caja_id) return null
  return cajas.value.find(c => c.id === Number(form.value.destino_caja_id)) || null
})

const cajasFiltradasDestino = computed(() => {
  const authStore = useAuthStore()
  const userId = authStore.user?.id
  if (!userId) return []

  const miCaja = cajas.value.find(c => c.usuario_id === userId)
  if (!miCaja) {
    // Si no es cajero, permitir cualquiera menos el origen
    return cajas.value.filter(c => c.estado && c.id !== Number(form.value.origen_caja_id))
  }

  if (!form.value.origen_caja_id) return []

  const origenId = Number(form.value.origen_caja_id)

  // De Bóveda -> A mi Caja asignada
  if (origenId !== miCaja.id) {
    return cajas.value.filter(c => c.estado && c.id === miCaja.id)
  }

  // De mi Caja asignada -> A Bóveda
  return cajas.value.filter(c => c.estado && c.tipo_caja === 'boveda' && c.agencia_id === miCaja.agencia_id)
})

// Categorías según la regla del origen y destino
const categoriasDisponibles = computed(() => {
  const o = origenCajaSeleccionada.value
  const d = destinoCajaSeleccionada.value

  if (o && (o.tipo_caja === 'boveda' || o.tipo_caja === 'general') && d && d.tipo_caja === 'ventanilla') {
    return [{ value: 'abastecimiento', label: 'Abastecimiento' }]
  }

  if (o && o.tipo_caja === 'ventanilla' && d && (d.tipo_caja === 'boveda' || d.tipo_caja === 'general')) {
    return [
      { value: 'devolucion', label: 'Devolución' },
      { value: 'deteriorado', label: 'Deteriorado' }
    ]
  }

  return [
    { value: 'abastecimiento', label: 'Abastecimiento' },
    { value: 'devolucion', label: 'Devolución' },
    { value: 'deteriorado', label: 'Deteriorado' }
  ]
})

watch(categoriasDisponibles, (newVal) => {
  const exists = newVal.some(c => c.value === form.value.categoria_movimiento)
  if (!exists && newVal.length > 0) {
    form.value.categoria_movimiento = newVal[0].value
  }
}, { immediate: true })

watch(() => form.value.categoria_movimiento, (newCat) => {
  if (newCat === 'devolucion' || newCat === 'deteriorado') {
    form.value.tipo_operacion = 'ingreso'
  } else if (newCat === 'abastecimiento') {
    form.value.tipo_operacion = 'egreso'
  }
})

// Load catalogs on mounted
onMounted(async () => {
  try {
    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    cajas.value = cajasRes.data
    denominaciones.value = denomsRes.data.filter((d: any) => d.activo)
    
    resetForm()
  } catch (err) {
    formError.value = 'Error al cargar catálogos y denominaciones.'
  }
})

const resetForm = () => {
  form.value = {
    origen_caja_id: '',
    destino_caja_id: '',
    tipo_operacion: 'egreso',
    categoria_movimiento: 'abastecimiento',
    descripcion: '',
  }
  localDenominaciones.value = denominaciones.value.map(d => ({
    ...d,
    cantidad_buena: 0,
    cantidad_deteriorada: 0
  }))
}

// Divide localDenominaciones
const billetesList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'moneda'))

const deshabilitaDeterioradoPorOrigen = computed(() => {
  return origenCajaSeleccionada.value?.tipo_caja === 'boveda'
})

const deshabilitaDeterioradoPorDestino = computed(() => {
  return destinoCajaSeleccionada.value?.tipo_caja === 'ventanilla'
})

const calculaSubtotalDenominacion = (d: Denominacion) => {
  if (form.value.categoria_movimiento === 'deteriorado') {
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
  form.value.destino_caja_id = ''
  
  // Auto-seleccionar si solo hay una opción válida de destino
  const validDestinos = cajasFiltradasDestino.value
  if (validDestinos.length === 1) {
    form.value.destino_caja_id = String(validDestinos[0].id)
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

const submitForm = async () => {
  formError.value = ''
  successMsg.value = ''
  submitting.value = true

  const isDeteriorados = form.value.categoria_movimiento === 'deteriorado'

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
    await axios.post('/movimientos/solicitar', {
      origen_caja_id: form.value.origen_caja_id ? Number(form.value.origen_caja_id) : null,
      destino_caja_id: form.value.destino_caja_id ? Number(form.value.destino_caja_id) : null,
      tipo_operacion: form.value.tipo_operacion,
      categoria_movimiento: form.value.categoria_movimiento,
      descripcion: form.value.descripcion || null,
      detalles: detallesPayload
    })
    
    successMsg.value = 'La solicitud de traslado ha sido enviada exitosamente. Esperando aprobación de Bóveda.'
    resetForm()
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
</style>
