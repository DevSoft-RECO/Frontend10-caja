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
              <span
                v-if="estadoApertura?.esta_abierta"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800 shadow-sm"
              >
                <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Caja Abierta
              </span>
              <span
                v-else-if="estadoApertura?.solicitud_pendiente"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm"
              >
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                Apertura en Revisión
              </span>
              <button
                v-else
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

          <!-- Alerta si no tiene ninguna caja asignada -->
          <div v-if="cajas.length === 0" class="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <p class="font-bold flex items-center gap-1.5 text-sm">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              No tienes una caja de ventanilla asignada
            </p>
            <p class="text-amber-700 dark:text-amber-300 leading-relaxed">
              Actualmente tu usuario no tiene una ventanilla asignada para el turno. Solicita a tu supervisor o administrador que te asigne una ventanilla en el módulo de Asignar Ventanillas para realizar la apertura.
            </p>
          </div>

          <!-- Select Box -->
          <div v-else>
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

          <!-- Banners de Estado Operativo (Caja Abierta o Pendiente) -->
          <div v-if="selectedCajaId && estadoAperturaCargado && estadoApertura?.esta_abierta" class="p-5 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/20 border-2 border-green-400/60 dark:border-green-700/60 rounded-2xl shadow-sm space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="p-2.5 bg-green-600 text-white rounded-xl shadow-md shrink-0">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-extrabold text-green-950 dark:text-green-100">
                      Esta Caja ya se encuentra Abierta y Operativa
                    </h3>
                    <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-green-500 text-white shadow-sm">
                      En Operación
                    </span>
                  </div>
                  <p class="text-xs text-green-800 dark:text-green-300 mt-0.5">
                    La apertura oficial de la jornada ya fue realizada. La ventanilla está habilitada para registrar operaciones de cobro y pago.
                  </p>
                </div>
              </div>

              <router-link
                to="/admin/movimientos/caja"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-azul-cope hover:bg-azul-cope/90 text-white text-xs font-bold rounded-xl shadow transition-all whitespace-nowrap"
              >
                Ir a Movimientos
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </router-link>
            </div>

            <div v-if="estadoApertura.apertura_hoy" class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-green-200/80 dark:border-green-800/60 text-xs">
              <div class="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2.5">
                <span class="text-gray-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Monto de Apertura</span>
                <span class="font-mono font-extrabold text-green-700 dark:text-green-300 text-sm">
                  {{ formatCurrency(estadoApertura.apertura_hoy.monto_total) }}
                </span>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2.5">
                <span class="text-gray-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Fecha / Hora</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">
                  {{ formatDateTime(estadoApertura.apertura_hoy.fecha_transaccion) }}
                </span>
              </div>
              <div class="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2.5">
                <span class="text-gray-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Cajero en Turno</span>
                <span class="font-semibold text-gray-800 dark:text-gray-200">
                  {{ estadoApertura.apertura_hoy.usuario || 'Asignado' }}
                </span>
              </div>
            </div>
          </div>

          <div v-else-if="selectedCajaId && estadoAperturaCargado && estadoApertura?.solicitud_pendiente" class="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border-2 border-amber-400/60 dark:border-amber-700/60 rounded-2xl shadow-sm flex items-start gap-3">
            <div class="p-2.5 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-extrabold text-amber-950 dark:text-amber-100">
                  Solicitud de Apertura Pendiente de Aprobación
                </h3>
                <span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-500 text-white shadow-sm">
                  En Revisión
                </span>
              </div>
              <p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Ya has enviado una solicitud de apertura por 
                <strong>{{ formatCurrency(estadoApertura.solicitud_pendiente.monto_total) }}</strong> el
                <strong>{{ formatDateTime(estadoApertura.solicitud_pendiente.created_at) }}</strong>.
                El encargado de Bóveda debe autorizar y despachar el efectivo antes de que puedas empezar a operar.
              </p>
            </div>
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
                            :disabled="isBlockedApertura"
                            class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm transition-all disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-800/80 disabled:cursor-not-allowed"
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
                            :disabled="isBlockedApertura"
                            class="block w-20 mx-auto text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm transition-all disabled:opacity-60 disabled:bg-gray-100 dark:disabled:bg-gray-800/80 disabled:cursor-not-allowed"
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

            <!-- Alerta Caja Abierta -->
            <div v-if="estadoApertura.esta_abierta" class="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl text-xs text-green-800 dark:text-green-300 font-semibold leading-relaxed space-y-1">
              <p class="font-bold flex items-center gap-1">🟢 Caja Operativa</p>
              Esta ventanilla se encuentra actualmente abierta y lista para atender transacciones.
            </div>

            <!-- Alerta Solicitud Pendiente -->
            <div v-else-if="estadoApertura.solicitud_pendiente" class="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold leading-relaxed space-y-1">
              <p class="font-bold flex items-center gap-1">⏳ Esperando Autorización</p>
              La solicitud fue enviada a la bóveda. Espera a que el custodio confirme la entrega de efectivo.
            </div>

            <!-- Alerta descuadre -->
            <div v-else-if="descuadreDetectado" class="p-4 bg-amber-50 dark:bg-amber-950/10 border border-amber-250 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold leading-relaxed space-y-1">
              <p class="font-bold flex items-center gap-1">⚠️ Descuadre Detectado</p>
              El conteo actual difiere del cierre de ayer. La solicitud será enviada para auditoría y aprobación de Bóveda.
            </div>

            <!-- Alerta todo cuadrado -->
            <div v-else-if="selectedCajaId" class="p-4 bg-green-50 dark:bg-green-950/10 border border-green-250 dark:border-green-900/30 rounded-xl text-xs text-green-800 dark:text-green-300 font-semibold leading-relaxed">
              <p class="font-bold flex items-center gap-1">✓ Saldos Cuadrados</p>
              El arqueo de inicio coincide al 100% con el cierre anterior. Puedes solicitar la apertura de tu caja.
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
  esta_abierta: boolean
  apertura_hoy?: {
    monto_total: number
    fecha_transaccion: string
    usuario?: string | null
  } | null
  solicitud_pendiente?: {
    id: number
    monto_total: number
    created_at: string
  } | null
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
const isBlockedApertura = computed(() => {
  return Boolean(estadoApertura.value?.esta_abierta || estadoApertura.value?.solicitud_pendiente)
})

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

const isMiCaja = (c: any, user: any) => {
  if (!c.estado || c.tipo_caja !== 'ventanilla') return false
  if (!user) return false

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

  // Comparación por ID
  const matchUserId = c.usuario_id && (
    String(c.usuario_id) === userId ||
    (userLocalId && String(c.usuario_id) === userLocalId)
  )

  const matchTurnoId = c.usuario_en_turno?.id && (
    String(c.usuario_en_turno.id) === userId ||
    (userLocalId && String(c.usuario_en_turno.id) === userLocalId)
  )

  return Boolean(matchSso || matchUsername || matchEmail || matchUserId || matchTurnoId)
}

const fetchData = async () => {
  try {
    const authStore = useAuthStore()
    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])

    const user = authStore.user
    const misCajas = cajasRes.data.filter((c: any) => isMiCaja(c, user))

    // Filtrar únicamente las cajas asignadas al usuario activo
    if (misCajas.length > 0) {
      cajas.value = misCajas
    } else if (authStore.hasRole('Super Admin')) {
      const userAgenciaId = authStore.user?.agencia_id || authStore.user?.agencia?.id
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
      onCajaChange()
    }
  } catch (err: any) {
    error.value = 'Error al cargar catálogos.'
  }
}

const submitApertura = async (supervisorId: number | null) => {
  if (isBlockedApertura.value) {
    if (estadoApertura.value?.esta_abierta) {
      error.value = 'Esta caja ya se encuentra abierta y operativa hoy.'
    } else {
      error.value = 'Ya existe una solicitud de apertura pendiente para esta caja.'
    }
    return
  }

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

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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
