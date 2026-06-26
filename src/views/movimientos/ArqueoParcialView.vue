<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Arqueo / Conteo Parcial
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Realiza un conteo ciego de control en cualquier momento de la jornada para verificar existencias físicas.
        </p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulario de Declaración Física -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700/60">
            Declaración de Efectivo Físico
          </h2>

          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-800 dark:text-red-300">
            {{ error }}
          </div>

          <div v-if="successMsg" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-bold text-green-800 dark:text-green-300">
            {{ successMsg }}
          </div>

          <!-- Caja Selector -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seleccionar Caja a Auditar <span class="text-red-500">*</span></label>
            <select
              v-model="selectedCajaId"
              class="block w-full md:w-80 px-3 py-2.5 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
            >
              <option value="">-- Seleccionar Caja --</option>
              <option v-for="caja in cajas" :key="caja.id" :value="caja.id">
                {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }}) - Turno: {{ caja.usuario_en_turno?.name || 'Sin Cajero' }}
              </option>
            </select>
          </div>

          <!-- Denomination list double entry table -->
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
                @click="limpiarArqueo"
                :disabled="submitting"
                class="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 font-semibold rounded-xl text-sm border border-red-200 transition-all cursor-pointer disabled:opacity-40"
              >
                Limpiar Arqueo Activo
              </button>
              <button
                @click="submitArqueo"
                :disabled="submitting || totalDeclarado === 0"
                class="px-6 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <svg v-if="submitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardar Arqueo Parcial
              </button>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-450 dark:text-gray-500 italic text-sm">
            Selecciona una caja arriba para comenzar a arquealizar.
          </div>
        </div>
      </div>

      <!-- Resumen Lateral Informativo -->
      <div class="space-y-6">
        <div class="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Resumen del Conteo</h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Declarado</span>
              <span class="text-lg font-extrabold font-mono text-gray-900 dark:text-white">
                {{ formatCurrency(totalDeclarado) }}
              </span>
            </div>

            <!-- Nota de auditoria ciega -->
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <p class="font-bold mb-1">🔍 Auditoría Ciega Activa</p>
              El sistema no muestra el saldo contable ni la diferencia matemática al cajero para asegurar un conteo físico objetivo y transparente. La discrepancia se registrará silenciosamente en el backend para revisión del supervisor.
            </div>
          </div>
        </div>
      </div>
    </div>
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
  usuario_en_turn?: User
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

// State
const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const selectedCajaId = ref('')
const error = ref('')
const successMsg = ref('')
const submitting = ref(false)

const localDenominaciones = ref<Denominacion[]>([])

// Computeds
const billetesList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'moneda'))

const cajaSeleccionada = computed(() => {
  if (!selectedCajaId.value) return null
  return cajas.value.find(c => c.id === Number(selectedCajaId.value)) || null
})

// Bloquea deteriorado si es bóveda
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

// Cargar el conteo existente si ya hay uno para la caja elegida
watch(selectedCajaId, async (newId) => {
  error.value = ''
  successMsg.value = ''
  if (!newId) {
    resetForm()
    return
  }

  try {
    const res = await axios.get(`/cajas/conteos-parciales?caja_id=${newId}`)
    const conteos = res.data
    
    // Si hay registros, tomamos el primero (ya que es único por caja)
    if (conteos && conteos.length > 0) {
      const activeArqueo = conteos[0]
      localDenominaciones.value.forEach(d => {
        // Encontrar los detalles del arqueo para esta denominación
        const detBueno = activeArqueo.detalles.find((det: any) => det.denominacion_id === d.id && det.estado_dinero === 'bueno')
        const detDet = activeArqueo.detalles.find((det: any) => det.denominacion_id === d.id && det.estado_dinero === 'deteriorado')
        
        d.cantidad_buena = detBueno ? detBueno.cantidad : 0
        d.cantidad_deteriorada = detDet ? detDet.cantidad : 0
      })
    } else {
      // Si no hay arqueo previo, limpiar los inputs
      localDenominaciones.value.forEach(d => {
        d.cantidad_buena = 0
        d.cantidad_deteriorada = 0
      })
    }
  } catch (err) {
    error.value = 'No se pudo verificar el historial de arqueo parcial para esta caja.'
  }
})

// Acciones
const resetForm = () => {
  localDenominaciones.value = denominaciones.value.map(d => ({
    ...d,
    cantidad_buena: 0,
    cantidad_deteriorada: 0
  }))
  error.value = ''
  successMsg.value = ''
}

const limpiarArqueo = async () => {
  if (!selectedCajaId.value) return
  error.value = ''
  successMsg.value = ''
  submitting.value = true

  try {
    await axios.delete(`/cajas/conteos-parciales/${selectedCajaId.value}`)
    successMsg.value = 'Arqueo Parcial limpiado correctamente en el sistema.'
    resetForm()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al intentar limpiar el arqueo de esta caja.'
  } finally {
    submitting.value = false
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

const submitArqueo = async () => {
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
    error.value = 'Debe declarar cantidades en al menos una denominación.'
    submitting.value = false
    return
  }

  try {
    await axios.post('/cajas/conteos-parciales', {
      caja_id: Number(selectedCajaId.value),
      detalles
    })

    successMsg.value = '¡Arqueo Parcial guardado exitosamente!'
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al procesar el arqueo.'
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
