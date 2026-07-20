<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Apertura de Caja (Inicio de Turno)
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Valida el desglose físico de gaveta heredado del cierre anterior e inyecta la dotación contable al Libro Mayor.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Formulario de Conteo Inicial -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              Arqueo de Entrada
            </h2>
            <div v-if="selectedCajaId && estadoAperturaCargado" class="flex gap-2">
              <button
                type="button"
                @click="submitApertura(null)"
                :disabled="submitting"
                class="px-5 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                Solicitar Apertura
              </button>
            </div>
          </div>

          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-800 dark:text-red-300">
            {{ error }}
          </div>

          <div v-if="successMsg" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/30 rounded-xl text-xs font-bold text-green-800 dark:text-green-300">
            {{ successMsg }}
          </div>

          <!-- Select Box -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seleccionar Caja a Abrir <span class="text-red-500">*</span></label>
            <select
              v-model="selectedCajaId"
              @change="onCajaChange"
              class="block w-full md:w-80 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
            >
              <option value="">-- Seleccionar Caja --</option>
              <option v-for="caja in cajas" :key="caja.id" :value="caja.id">
                {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }}) - Turno: {{ caja.usuario_en_turno?.name || 'Sin Cajero' }}
              </option>
            </select>
          </div>

          <!-- Declaracion de efectivo físico -->
          <div class="space-y-6" v-if="selectedCajaId && estadoAperturaCargado">
            
            <!-- Grid de dos columnas para Billetes y Monedas lado a lado -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Billetes (Columna Izquierda) -->
              <div v-if="billetesList.length > 0" class="space-y-3">
                <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Billetes</h3>
                <div class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th class="p-3 w-1/2">Denominación</th>
                        <th class="p-3 w-1/4 text-center">Cant. Buena</th>
                        <th class="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <tr v-for="denom in billetesList" :key="denom.id">
                        <td class="p-3 font-semibold text-gray-800 dark:text-gray-300">
                          {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                        </td>
                        <td class="p-3">
                          <input
                            v-model.number="denom.cantidad_buena"
                            type="number"
                            min="0"
                            placeholder="0"
                            class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                          />
                        </td>
                        <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-24">
                          {{ formatCurrency(calculaSubtotal(denom)) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Monedas (Columna Derecha) -->
              <div v-if="monedasList.length > 0" class="space-y-3">
                <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Monedas</h3>
                <div class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th class="p-3 w-1/2">Denominación</th>
                        <th class="p-3 w-1/4 text-center">Cant. Buena</th>
                        <th class="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <tr v-for="denom in monedasList" :key="denom.id">
                        <td class="p-3 font-semibold text-gray-800 dark:text-gray-300">
                          {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                        </td>
                        <td class="p-3">
                          <input
                            v-model.number="denom.cantidad_buena"
                            type="number"
                            min="0"
                            placeholder="0"
                            class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                          />
                        </td>
                        <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-24">
                          {{ formatCurrency(calculaSubtotal(denom)) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Espacio inferior sutil -->
            <div class="pt-2"></div>
          </div>

          <div v-else class="text-center py-12 text-gray-400 dark:text-gray-500 italic text-sm">
            Selecciona una caja arriba para validar el saldo de apertura.
          </div>
        </div>
      </div>

      <!-- Resumen Lateral Comparador -->
      <div class="space-y-6">
        <div class="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Validación de Saldo</h3>

          <div v-if="loadingEstado" class="flex flex-col items-center py-6 space-y-2">
            <div class="w-8 h-8 rounded-full border-2 border-azul-cope border-t-transparent animate-spin"></div>
            <p class="text-xs text-gray-400">Consultando cierre anterior...</p>
          </div>

          <div v-else-if="estadoApertura" class="space-y-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center">
              <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Saldo de Cierre Anterior</span>
              <span class="text-2xl font-extrabold font-mono text-gray-900 dark:text-white">
                {{ formatCurrency(estadoApertura.saldo_final_fisico_declarado) }}
              </span>
              <span v-if="estadoApertura.fecha_cierre" class="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                Registrado el {{ formatOnlyDate(estadoApertura.fecha_cierre) }}
              </span>
            </div>

            <!-- Declarado actual -->
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <span class="text-xs text-gray-500 dark:text-gray-400 font-semibold">Total Declarado Hoy</span>
              <span class="font-mono text-sm text-gray-900 dark:text-white">{{ formatCurrency(totalDeclarado) }}</span>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Diferencia</span>
              <span class="font-mono text-sm font-bold" :class="diferencia === 0 ? 'text-gray-900 dark:text-white' : diferencia > 0 ? 'text-blue-600' : 'text-red-500'">
                {{ diferencia > 0 ? '+' : '' }}{{ formatCurrency(diferencia) }}
              </span>
            </div>

            <!-- Alerta descuadre -->
            <div v-if="descuadreDetectado" class="p-4 bg-amber-50 dark:bg-amber-950/10 border border-amber-250 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold leading-relaxed space-y-1">
              <p class="font-bold flex items-center gap-1">⚠️ Descuadre Detectado</p>
              El conteo actual difiere del cierre de ayer. La solicitud será enviada para auditoría y aprobación de Bóveda.
            </div>

            <!-- Alerta todo cuadrado -->
            <div v-else-if="selectedCajaId" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-250 dark:border-green-900/30 rounded-xl text-xs text-green-800 dark:text-green-300 font-semibold leading-relaxed">
              <p class="font-bold flex items-center gap-1">✓ Saldos Cuadrados</p>
              El arqueo de inicio coincide al 100% con el cierre anterior. Puedes abrir tu caja con normalidad.
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
import { useAuthStore } from '@/stores/auth'

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

interface CierreDetalle {
  id: number
  denominacion_id: number
  cantidad: number
  estado_dinero: 'bueno' | 'deteriorado'
}

interface EstadoApertura {
  tiene_cierre_anterior: boolean
  saldo_final_fisico_declarado: number
  fecha_cierre?: string
  detalles: CierreDetalle[]
}

// State

const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const selectedCajaId = ref('')
const error = ref('')
const successMsg = ref('')
const submitting = ref(false)

const loadingEstado = ref(false)
const estadoApertura = ref<EstadoApertura | null>(null)
const estadoAperturaCargado = ref(false)

const localDenominaciones = ref<Denominacion[]>([])



// Computeds
const billetesList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'moneda'))

const cajaSeleccionada = computed(() => {
  if (!selectedCajaId.value) return null
  return cajas.value.find(c => c.id === Number(selectedCajaId.value)) || null
})

const deshabilitaDeterioradoPorCaja = computed(() => {
  return cajaSeleccionada.value?.tipo_caja === 'boveda'
})

const calculaSubtotal = (d: Denominacion) => {
  const buena = d.cantidad_buena || 0
  return d.valor * buena
}

const totalDeclarado = computed(() => {
  return localDenominaciones.value.reduce((acc, d) => acc + calculaSubtotal(d), 0)
})

const diferencia = computed(() => {
  const esperado = estadoApertura.value ? estadoApertura.value.saldo_final_fisico_declarado : 0.00
  return totalDeclarado.value - esperado
})

const descuadreDetectado = computed(() => {
  return Math.abs(diferencia.value) > 0.01
})

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
  estadoApertura.value = null
  estadoAperturaCargado.value = false
  error.value = ''
  successMsg.value = ''
}

const onCajaChange = async () => {
  if (!selectedCajaId.value) {
    resetForm()
    return
  }
  loadingEstado.value = true
  error.value = ''
  estadoAperturaCargado.value = false
  try {
    const res = await axios.get(`/cajas/${selectedCajaId.value}/estado-apertura`)
    estadoApertura.value = res.data
    estadoAperturaCargado.value = true

    // Llenar inputs automáticamente si tiene cierre anterior para ahorrar tiempo
    if (res.data.tiene_cierre_anterior) {
      localDenominaciones.value.forEach(d => {
        const detBuena = res.data.detalles.find((x: any) => x.denominacion_id === d.id && x.estado_dinero === 'bueno')
        const detDeteriorada = res.data.detalles.find((x: any) => x.denominacion_id === d.id && x.estado_dinero === 'deteriorado')

        d.cantidad_buena = detBuena ? detBuena.cantidad : 0
        d.cantidad_deteriorada = detDeteriorada ? detDeteriorada.cantidad : 0
      })
    } else {
      // Inicia en ceros
      localDenominaciones.value.forEach(d => {
        d.cantidad_buena = 0
        d.cantidad_deteriorada = 0
      })
    }
  } catch (err: any) {
    error.value = 'Error al recuperar estado de cierre anterior.'
  } finally {
    loadingEstado.value = false
  }
}

const fetchData = async () => {
  try {
    const authStore = useAuthStore()
    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    // Filtrar únicamente las cajas asignadas al usuario activo
    cajas.value = cajasRes.data.filter((c: any) => c.estado && c.usuario_id === authStore.user?.id)
    denominaciones.value = denomsRes.data.filter((d: any) => d.activo)

    localDenominaciones.value = denominaciones.value.map(d => ({
      ...d,
      cantidad_buena: 0,
      cantidad_deteriorada: 0
    }))

    // Auto-seleccionar si el cajero solo tiene una caja asignada
    if (cajas.value.length === 1) {
      selectedCajaId.value = String(cajas.value[0].id)
      onCajaChange()
    }
  } catch (err: any) {
    error.value = 'Error al cargar catálogos.'
  }
}



const submitApertura = async (supervisorId: number | null) => {
  error.value = ''
  successMsg.value = ''
  submitting.value = true

  const detalles = localDenominaciones.value
    .filter(d => d.cantidad_buena > 0)
    .map(d => ({
      denominacion_id: d.id,
      estado_dinero: 'bueno',
      cantidad: d.cantidad_buena
    }))

  // Permite abrir en cero para cajas nuevas
  const payload: any = {
    detalles: detalles.length > 0 ? detalles : denominaciones.value.slice(0, 1).map(d => ({
      denominacion_id: d.id,
      cantidad: 0,
      estado_dinero: 'bueno'
    }))
  }

  if (supervisorId) {
    payload.supervisor_id = supervisorId
  }

  try {
    await axios.post(`/cajas/${selectedCajaId.value}/solicitar-apertura`, payload)
    successMsg.value = '¡Solicitud de apertura enviada exitosamente! Por favor, espera la aprobación del encargado de Bóveda.'
    setTimeout(() => {
      resetForm()
      fetchData()
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al procesar solicitud de apertura de caja.'
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

const formatOnlyDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
  return localDate.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
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
