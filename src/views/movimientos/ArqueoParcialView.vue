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
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              Declaración de Efectivo Físico
            </h2>
            <span v-if="selectedCajaId && historialHoy.length > 0" class="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Mostrando último arqueo realizado
            </span>
          </div>

          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-800 dark:text-red-300">
            {{ error }}
          </div>

          <!-- Caja Selector -->
          <div v-if="cajas.length > 0">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seleccionar Caja a Auditar <span class="text-red-500">*</span></label>
            <select
              v-model="selectedCajaId"
              class="block w-full md:w-80 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-semibold transition-all"
            >
              <option value="">-- Seleccionar Caja --</option>
              <option v-for="caja in cajas" :key="caja.id" :value="caja.id">
                {{ caja.nombre }} ({{ formatTipo(caja.tipo_caja) }}) - Turno: {{ caja.usuario_en_turno?.name || 'Sin Cajero' }}
              </option>
            </select>
          </div>

          <div v-else class="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300">
            ⚠️ No tienes una ventanilla activa asignada en tu agencia para operar arqueos. Solicita tu asignación en administración.
          </div>

          <!-- Denomination list double entry table -->
          <div class="space-y-6" v-if="selectedCajaId">
            <!-- Banner informativo del arqueo visualizado -->
            <div v-if="arqueoSeleccionado" class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-blue-50/70 dark:bg-azul-cope/10 border border-blue-200 dark:border-blue-900/40 rounded-2xl gap-2">
              <div class="flex items-center gap-2.5">
                <span class="text-base">📌</span>
                <div class="text-xs">
                  <span class="font-extrabold text-azul-cope dark:text-blue-300">
                    {{ esUltimoArqueo ? 'Último Arqueo Realizado Hoy' : 'Arqueo Anterior Cargado' }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-300">
                    — Registrado a las {{ formatHora(arqueoSeleccionado.fecha_hora) }} (Total: {{ formatCurrency(Number(arqueoSeleccionado.total_fisico_declarado)) }})
                  </span>
                </div>
              </div>
              <button
                type="button"
                @click="comenzarNuevoArqueo"
                class="text-xs font-bold text-azul-cope dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                title="Poner cantidades en cero para ingresar un nuevo arqueo"
              >
                <span>➕</span> Iniciar Conteo en Cero
              </button>
            </div>

            <!-- Billetes -->
            <div v-if="billetesList.length > 0" class="space-y-3">
              <h3 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Billetes</h3>
              <div class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-1/3">Denominación</th>
                      <th class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
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
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          placeholder="0"
                          :disabled="deshabilitaDeterioradoPorCaja"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
              <div class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-1/3">Denominación</th>
                      <th class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
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
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          placeholder="0"
                          :disabled="deshabilitaDeterioradoPorCaja"
                          class="block w-24 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
                type="button"
                class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-40"
              >
                Poner en Cero
              </button>
              <button
                @click="submitArqueo"
                type="button"
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

          <div v-else class="text-center py-12 text-gray-400 dark:text-gray-500 italic text-sm">
            Selecciona una caja arriba para comenzar a arquealizar.
          </div>
        </div>
      </div>

      <!-- Resumen Lateral Informativo e Historial del Día -->
      <div class="space-y-6">
        <!-- Tarjeta de Resumen del Conteo -->
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
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <p class="font-bold mb-1">🔍 Auditoría Ciega Activa</p>
              El sistema no muestra el saldo contable ni la diferencia matemática al cajero para asegurar un conteo físico objetivo y transparente. La discrepancia se registrará silenciosamente en el backend para revisión del supervisor.
            </div>
          </div>
        </div>

        <!-- LISTA DE TODOS LOS ARQUEOS QUE REALIZÓ EL USUARIO DURANTE EL DÍA -->
        <div class="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 class="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>📋</span> Arqueos Realizados Hoy
              </h3>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                {{ formatFechaHoy() }}
              </p>
            </div>
            <span class="px-2.5 py-1 bg-azul-cope/10 text-azul-cope dark:bg-azul-cope/20 dark:text-blue-400 text-xs font-extrabold rounded-full">
              {{ historialHoy.length }} {{ historialHoy.length === 1 ? 'arqueo' : 'arqueos' }}
            </span>
          </div>

          <!-- Estado de carga -->
          <div v-if="loadingHistorial" class="py-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
            <svg class="w-5 h-5 animate-spin text-azul-cope" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando arqueos de hoy...</span>
          </div>

          <!-- Estado vacío -->
          <div v-else-if="!selectedCajaId" class="py-8 text-center text-xs text-gray-400 italic">
            Selecciona una caja para ver sus arqueos del día.
          </div>

          <div v-else-if="historialHoy.length === 0" class="py-8 text-center space-y-2">
            <span class="text-3xl">📭</span>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Sin arqueos hoy
            </p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 max-w-[200px] mx-auto">
              No se han guardado arqueos el día de hoy para esta caja. Cada nuevo arqueo se listará aquí.
            </p>
          </div>

          <!-- Listado de arqueos de hoy -->
          <div v-else class="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            <div
              v-for="(item, index) in historialHoy"
              :key="item.id"
              @click="cargarArqueoEnFormulario(item)"
              :class="[
                'p-3.5 rounded-2xl border transition-all cursor-pointer relative',
                arqueoSeleccionadoId === item.id
                  ? 'border-azul-cope bg-blue-50/50 dark:bg-azul-cope/15 ring-2 ring-azul-cope/30 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-900/40'
              ]"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-black text-gray-700 dark:text-gray-300">
                    #{{ historialHoy.length - index }}
                  </span>
                  <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span>🕒</span> {{ formatHora(item.fecha_hora) }}
                  </span>
                </div>

                <!-- Insignia Último / Activo -->
                <span
                  v-if="index === 0"
                  class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Último Realizado
                </span>
                <span
                  v-else-if="arqueoSeleccionadoId === item.id"
                  class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-azul-cope dark:bg-blue-950/60 dark:text-blue-300"
                >
                  Cargado
                </span>
              </div>

              <div class="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-150 dark:border-gray-700/60">
                <span class="text-[11px] text-gray-500 dark:text-gray-400">Total Físico:</span>
                <span class="text-sm font-mono font-black text-gray-900 dark:text-white">
                  {{ formatCurrency(Number(item.total_fisico_declarado)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Botón de comenzar nuevo arqueo en cero -->
          <div v-if="historialHoy.length > 0" class="pt-2">
            <button
              type="button"
              @click="comenzarNuevoArqueo"
              class="w-full py-2 px-3 border border-dashed border-gray-300 dark:border-gray-600 hover:border-azul-cope dark:hover:border-blue-400 text-gray-600 dark:text-gray-300 hover:text-azul-cope dark:hover:text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>➕</span> Iniciar Nuevo Conteo en Cero
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'
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

interface ConteoParcialDetalle {
  id: number
  conteo_parcial_id: number
  denominacion_id: number
  estado_dinero: 'bueno' | 'deteriorado'
  cantidad: number
  subtotal: number
  denominacion?: Denominacion
}

interface ConteoParcialItem {
  id: number
  caja_id: number
  usuario_id: number
  fecha_hora: string
  total_fisico_declarado: number | string
  usuario?: User
  detalles: ConteoParcialDetalle[]
}

// State
const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const selectedCajaId = ref('')
const error = ref('')
const submitting = ref(false)
const loadingHistorial = ref(false)

const localDenominaciones = ref<Denominacion[]>([])
const historialHoy = ref<ConteoParcialItem[]>([])
const arqueoSeleccionadoId = ref<number | null>(null)

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

// Arqueo actualmente seleccionado
const arqueoSeleccionado = computed(() => {
  if (!arqueoSeleccionadoId.value) return null
  return historialHoy.value.find(item => item.id === arqueoSeleccionadoId.value) || null
})

// Verifica si el arqueo cargado es el último realizado
const esUltimoArqueo = computed(() => {
  if (!historialHoy.value.length || !arqueoSeleccionadoId.value) return false
  return historialHoy.value[0].id === arqueoSeleccionadoId.value
})

// Resetear deteriorados a 0 si la caja elegida es boveda
watch(deshabilitaDeterioradoPorCaja, (newVal) => {
  if (newVal) {
    localDenominaciones.value.forEach(d => {
      d.cantidad_deteriorada = 0
    })
  }
})

// Cargar un arqueo específico en el formulario principal
const cargarArqueoEnFormulario = (arqueo: ConteoParcialItem) => {
  arqueoSeleccionadoId.value = arqueo.id
  localDenominaciones.value.forEach(d => {
    const detBueno = arqueo.detalles.find((det: any) => det.denominacion_id === d.id && det.estado_dinero === 'bueno')
    const detDet = arqueo.detalles.find((det: any) => det.denominacion_id === d.id && det.estado_dinero === 'deteriorado')
    
    d.cantidad_buena = detBueno ? detBueno.cantidad : 0
    d.cantidad_deteriorada = detDet ? detDet.cantidad : 0
  })
}

// Iniciar un nuevo arqueo en blanco (cantidades en 0)
const comenzarNuevoArqueo = () => {
  arqueoSeleccionadoId.value = null
  resetForm()
}

// Consultar el historial de arqueos del día de hoy para la caja seleccionada
const cargarHistorial = async (cajaId: string | number) => {
  if (!cajaId) {
    historialHoy.value = []
    comenzarNuevoArqueo()
    return
  }

  loadingHistorial.value = true
  error.value = ''
  try {
    const res = await axios.get(`/cajas/conteos-parciales?caja_id=${cajaId}`)
    historialHoy.value = res.data || []

    // Si existen arqueos hoy, por defecto mantenemos cargado el último realizado
    if (historialHoy.value.length > 0) {
      cargarArqueoEnFormulario(historialHoy.value[0])
    } else {
      comenzarNuevoArqueo()
    }
  } catch (err) {
    error.value = 'No se pudo verificar el historial de arqueos parciales de hoy para esta caja.'
  } finally {
    loadingHistorial.value = false
  }
}

// Escuchar cambios de caja seleccionada
watch(selectedCajaId, async (newId) => {
  await cargarHistorial(newId)
})

// Acciones
const resetForm = () => {
  localDenominaciones.value = denominaciones.value.map(d => ({
    ...d,
    cantidad_buena: 0,
    cantidad_deteriorada: 0
  }))
  error.value = ''
}

const limpiarArqueo = async () => {
  if (!selectedCajaId.value) return
  
  const result = await Swal.fire({
    title: '¿Poner Formulario en Cero?',
    text: 'Se limpiarán las cantidades en pantalla para ingresar un nuevo conteo físico. Los arqueos previos del día seguirán registrados en tu historial.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#004A98',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Sí, poner en cero',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    comenzarNuevoArqueo()
    Swal.fire({
      icon: 'info',
      title: 'Formulario Limpio',
      text: 'Listo para ingresar un nuevo conteo físico.',
      timer: 1400,
      showConfirmButton: false
    })
  }
}

const isMiCaja = (c: any, user: any) => {
  if (!c.estado || c.tipo_caja !== 'ventanilla') return false
  if (!user) return false

  // Validar también que pertenezca estrictamente a la agencia del usuario si tiene agencia asignada
  const userAgenciaId = user.agencia_id || user.id_agencia || user.agencia?.id
  if (userAgenciaId && c.agencia_id && Number(c.agencia_id) !== Number(userAgenciaId)) {
    return false
  }

  const userId = user.id ? String(user.id) : null
  const userSsoId = user.sso_id ? String(user.sso_id) : null
  const userLocalId = user.local_id ? String(user.local_id) : null
  const username = user.username ? String(user.username).toLowerCase() : null
  const userEmail = user.email ? String(user.email).toLowerCase() : null

  // Comparación por sso_id en usuario_en_turno
  const matchSso = c.usuario_en_turno?.sso_id && (
    String(c.usuario_en_turno.sso_id) === userId ||
    (userSsoId && String(c.usuario_en_turno.sso_id) === userSsoId)
  )

  // Comparación por username
  const matchUsername = c.usuario_en_turno?.username && username && (
    String(c.usuario_en_turno.username).toLowerCase() === username
  )

  // Comparación por email
  const matchEmail = c.usuario_en_turno?.email && userEmail && (
    String(c.usuario_en_turno.email).toLowerCase() === userEmail
  )

  // Comparación por ID de usuario asignado a la caja
  const matchUserId = c.usuario_id && (
    String(c.usuario_id) === userId ||
    (userLocalId && String(c.usuario_id) === userLocalId)
  )

  // Comparación por ID del cajero en turno
  const matchTurnoId = c.usuario_en_turno?.id && (
    String(c.usuario_en_turno.id) === userId ||
    (userLocalId && String(c.usuario_en_turno.id) === userLocalId)
  )

  return Boolean(matchSso || matchUsername || matchEmail || matchUserId || matchTurnoId)
}

const fetchData = async () => {
  try {
    const authStore = useAuthStore()
    const user = authStore.user
    const userAgenciaId = user?.agencia_id || user?.id_agencia || user?.agencia?.id

    const params: any = {}
    if (!authStore.hasRole('Super Admin') && userAgenciaId) {
      params.agencia_id = userAgenciaId
    }

    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas', { params }),
      axios.get('/denominaciones')
    ])

    // Filtrar estrictamente únicamente las cajas asignadas al usuario activo en su agencia
    const misCajas = cajasRes.data.filter((c: any) => isMiCaja(c, user))

    if (misCajas.length > 0) {
      cajas.value = misCajas
    } else if (authStore.hasRole('Super Admin')) {
      // Si es Super Admin y no tiene caja asignada, permitirle seleccionar ventanillas de su agencia
      cajas.value = cajasRes.data.filter((c: any) => 
        c.estado && 
        c.tipo_caja === 'ventanilla' && 
        (!userAgenciaId || Number(c.agencia_id) === Number(userAgenciaId))
      )
    } else {
      cajas.value = []
    }

    denominaciones.value = denomsRes.data.filter((d: any) => d.activo)

    localDenominaciones.value = denominaciones.value.map(d => ({
      ...d,
      cantidad_buena: 0,
      cantidad_deteriorada: 0
    }))

    // Auto-seleccionar si el cajero solo tiene una caja asignada
    if (cajas.value.length === 1) {
      selectedCajaId.value = String(cajas.value[0].id)
    }
  } catch (err: any) {
    error.value = 'Error al cargar catálogos.'
  }
}

const submitArqueo = async () => {
  error.value = ''
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
    const msg = 'Debe declarar cantidades en al menos una denominación.'
    error.value = msg
    Swal.fire({
      icon: 'warning',
      title: 'Monto en Cero',
      text: msg,
      confirmButtonColor: '#004A98'
    })
    submitting.value = false
    return
  }

  try {
    await axios.post('/cajas/conteos-parciales', {
      caja_id: Number(selectedCajaId.value),
      detalles
    })

    await Swal.fire({
      icon: 'success',
      title: '¡Arqueo Guardado!',
      text: 'El nuevo arqueo parcial ha sido registrado exitosamente en el historial del día.',
      confirmButtonColor: '#004A98'
    })

    // Recargar el historial de hoy para que el nuevo conteo encabece la lista y quede como último realizado
    await cargarHistorial(selectedCajaId.value)
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Error al procesar el arqueo.'
    error.value = errorMsg
    Swal.fire({
      icon: 'error',
      title: 'Error al Guardar',
      text: errorMsg,
      confirmButtonColor: '#d33'
    })
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

const formatHora = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

const formatFechaHoy = () => {
  return new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchData()
})
</script>
