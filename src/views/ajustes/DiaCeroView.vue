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
                <option v-for="ag in filteredAgencias" :key="ag.id" :value="ag.id">
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

          <!-- Tabs Selector si es Bóveda -->
          <div v-if="isBovedaSeleccionada && selectedCajaId" class="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-700/60 select-none">
            <button
              @click="activeTab = 'operaciones'"
              class="flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
              :class="activeTab === 'operaciones' ? 'bg-white dark:bg-gray-800 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              💼 1. Operaciones (Bueno)
            </button>
            <button
              @click="activeTab = 'cajillas'"
              class="flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
              :class="activeTab === 'cajillas' ? 'bg-white dark:bg-gray-800 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              🏪 2. Cajillas (Tránsito)
            </button>
            <button
              @click="activeTab = 'deteriorado'"
              class="flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
              :class="activeTab === 'deteriorado' ? 'bg-white dark:bg-gray-800 text-azul-cope shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'"
            >
              ⚠️ 3. Deteriorado
            </button>
          </div>

          <!-- Denomination Grid -->
          <div class="space-y-6" v-if="selectedCajaId">
            
            <!-- LISTADO DE BILLETES -->
            <div v-if="billetesList.length > 0" class="space-y-3">
              <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">
                Billetes <span class="text-gray-400 dark:text-gray-500 font-semibold" v-if="isBovedaSeleccionada">({{ formatTabName(activeTab) }})</span>
              </h3>
              <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-1/2">Denominación</th>
                      <th class="p-3 w-1/4 text-center">Cantidad</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in getActiveList(billetesList)" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-28 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm font-bold font-mono"
                        />
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-32">
                        {{ formatCurrency(denom.cantidad * denom.valor) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- LISTADO DE MONEDAS -->
            <div v-if="monedasList.length > 0" class="space-y-3">
              <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">
                Monedas <span class="text-gray-400 dark:text-gray-500 font-semibold" v-if="isBovedaSeleccionada">({{ formatTabName(activeTab) }})</span>
              </h3>
              <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-1/2">Denominación</th>
                      <th class="p-3 w-1/4 text-center">Cantidad</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
                    <tr v-for="denom in getActiveList(monedasList)" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                        {{ denom.nombre }} ({{ formatCurrency(denom.valor) }})
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-28 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-650 rounded-lg bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm font-bold font-mono"
                        />
                      </td>
                      <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white w-32">
                        {{ formatCurrency(denom.cantidad * denom.valor) }}
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
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

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
const successMsg = ref('')
const submitting = ref(false)
const observaciones = ref('')

const activeTab = ref<'operaciones' | 'cajillas' | 'deteriorado'>('operaciones')

const localOperaciones = ref<any[]>([])
const localCajillas = ref<any[]>([])
const localDeteriorado = ref<any[]>([])
const error = ref('')

// Computeds
const filteredAgencias = computed(() => {
  const isSuperAdmin = authStore.hasRole('Super Admin')
  if (isSuperAdmin) {
    return agencias.value
  }
  const userAgenciaId = authStore.user?.agencia_id || 
                        authStore.user?.agencia?.id || 
                        cajas.value.find((c: any) => c.usuario_id === authStore.user?.id)?.agencia_id

  if (!userAgenciaId) return []
  return agencias.value.filter(ag => Number(ag.id) === Number(userAgenciaId))
})

const filteredCajas = computed(() => {
  if (!selectedAgenciaId.value) return []
  return cajas.value.filter(c => 
    c.agencia_id === Number(selectedAgenciaId.value) && 
    c.estado && 
    c.tipo_caja === 'boveda'
  )
})

const isBovedaSeleccionada = computed(() => {
  if (!selectedCajaId.value) return false
  const caja = cajas.value.find(c => c.id === Number(selectedCajaId.value))
  return caja ? caja.tipo_caja === 'boveda' : false
})

const billetesList = computed(() => denominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => denominaciones.value.filter(d => d.tipo === 'moneda'))

const getActiveList = (list: any[]) => {
  if (!isBovedaSeleccionada.value) {
    return localOperaciones.value.filter(d => list.some(item => item.id === d.id))
  }
  const target = activeTab.value === 'operaciones'
    ? localOperaciones.value
    : activeTab.value === 'cajillas'
    ? localCajillas.value
    : localDeteriorado.value
  return target.filter(d => list.some(item => item.id === d.id))
}

const totalDeclarado = computed(() => {
  let total = 0
  localOperaciones.value.forEach(d => total += (Number(d.cantidad) || 0) * d.valor)
  if (isBovedaSeleccionada.value) {
    localCajillas.value.forEach(d => total += (Number(d.cantidad) || 0) * d.valor)
    localDeteriorado.value.forEach(d => total += (Number(d.cantidad) || 0) * d.valor)
  }
  return total
})

// Acciones
const resetForm = () => {
  const mapear = () => denominaciones.value.map(d => ({
    id: d.id,
    nombre: d.nombre,
    valor: d.valor,
    tipo: d.tipo,
    cantidad: 0
  }))

  localOperaciones.value = mapear()
  localCajillas.value = mapear()
  localDeteriorado.value = mapear()

  observaciones.value = ''
  selectedCajaId.value = ''
  activeTab.value = 'operaciones'
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

    resetForm()

    // Auto-seleccionar la agencia si no es Super Admin
    if (!authStore.hasRole('Super Admin')) {
      const userAgenciaId = authStore.user?.agencia_id || 
                            authStore.user?.agencia?.id || 
                            cajas.value.find((c: any) => c.usuario_id === authStore.user?.id)?.agencia_id
      if (userAgenciaId) {
        selectedAgenciaId.value = String(userAgenciaId)
      }
    }
  } catch (err) {
    error.value = 'Error al cargar los catálogos.'
  }
}

const submitCarga = async () => {
  error.value = ''
  successMsg.value = ''
  submitting.value = true

  const mapDetalles = (list: any[]) => {
    return list
      .filter(d => Number(d.cantidad) > 0)
      .map(d => ({
        denominacion_id: d.id,
        cantidad: Number(d.cantidad)
      }))
  }

  const detallesBueno = mapDetalles(localOperaciones.value)
  const detallesCajillas = isBovedaSeleccionada.value ? mapDetalles(localCajillas.value) : []
  const detallesDeteriorado = isBovedaSeleccionada.value ? mapDetalles(localDeteriorado.value) : []

  if (detallesBueno.length === 0 && detallesCajillas.length === 0 && detallesDeteriorado.length === 0) {
    error.value = 'Debe declarar al menos una cantidad mayor a 0 antes de inicializar.'
    submitting.value = false
    return
  }

  try {
    await axios.post(`/cajas/${selectedCajaId.value}/dia-cero`, {
      detalles_operaciones: detallesBueno,
      detalles_cajillas: detallesCajillas,
      detalles_deteriorado: detallesDeteriorado,
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

const formatTabName = (tab: string) => {
  if (tab === 'operaciones') return 'Operaciones'
  if (tab === 'cajillas') return 'Cajillas'
  return 'Deteriorado'
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
