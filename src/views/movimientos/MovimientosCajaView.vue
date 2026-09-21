<template>
  <div class="space-y-6 w-full">
    <!-- Header -->
    <div class="flex items-center justify-between pb-2">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Movimientos de Caja
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Registro y control de traslados de efectivo bajo flujo de doble entrada institucional
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700/60">
          <span class="w-2.5 h-2.5 rounded-full bg-verde-cope"></span>
          Terminal Activa
        </div>
        <button
          @click="submitForm"
          :disabled="submitting || granTotal === 0 || !cajaOperativa || !miBoveda"
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
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700/60">
      <!-- Corporate Header -->
      <div class="px-6 py-4 bg-azul-cope text-white flex items-center justify-between">
        <h2 class="text-xs font-black uppercase tracking-wider text-white">Solicitud de Transferencia de Fondos</h2>
        <span class="text-[9px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full text-white/95">
          🏦 Flujo de Doble Entrada
        </span>
      </div>

      <!-- Body Form -->
      <form @submit.prevent="submitForm" class="p-6 space-y-6">
        <!-- Alert / Error message -->
        <div v-if="formError" class="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-xs font-semibold text-red-800 dark:text-red-300">{{ formError }}</span>
        </div>

        <!-- Success Message -->
        <div v-if="successMsg" class="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl flex items-start gap-3">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs font-semibold text-green-800 dark:text-green-300">{{ successMsg }}</span>
        </div>

        <!-- Aviso si no hay ventanilla o bóveda -->
        <div v-if="!cajaOperativa" class="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center gap-3 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <span>⚠️ No tienes una caja de ventanilla asignada o activa para operar. Selecciona una ventanilla a continuación o solicita asignación en administración.</span>
        </div>

        <div v-if="cajaOperativa && !miBoveda" class="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-xs font-semibold text-red-800 dark:text-red-300">
          <span>❌ No se encontró una Bóveda activa para la agencia de tu caja. No se pueden realizar traslados institucionales sin bóveda receptora/emisora.</span>
        </div>

        <!-- Selector de Ventanilla para Administradores / Super Admins sin caja fija -->
        <div v-if="!miCajaAsignada && ventanillasDisponibles.length > 0" class="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl space-y-2">
          <label class="block text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">
            Ventanilla / Caja de Operación (Modo Supervisor / Admin)
          </label>
          <select
            v-model="cajaOperativaSeleccionadaId"
            class="block w-full md:w-1/2 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope text-sm font-semibold transition-all"
          >
            <option v-for="caja in ventanillasDisponibles" :key="caja.id" :value="String(caja.id)">
              {{ caja.nombre }} - {{ caja.agencia?.nombre || 'Agencia ' + caja.agencia_id }} ({{ caja.usuario_en_turno?.name || 'Sin cajero en turno' }})
            </option>
          </select>
        </div>

        <!-- 1. SELECCIÓN DE TIPO DE MOVIMIENTO -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tipo de Movimiento <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              v-for="tipo in tiposMovimiento"
              :key="tipo.value"
              type="button"
              @click="seleccionarTipoMovimiento(tipo.value)"
              :class="[
                'p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer',
                form.categoria_movimiento === tipo.value
                  ? 'border-azul-cope bg-blue-50/40 dark:bg-azul-cope/10 ring-2 ring-azul-cope/30 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900/60'
              ]"
            >
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-lg">{{ tipo.icon }}</span>
                  <span
                    :class="[
                      'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                      form.categoria_movimiento === tipo.value
                        ? 'bg-azul-cope text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    ]"
                  >
                    {{ tipo.badge }}
                  </span>
                </div>
                <div class="font-extrabold text-sm text-gray-900 dark:text-white">
                  {{ tipo.label }}
                </div>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {{ tipo.descripcion }}
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- 2. TARJETAS INFORMATIVAS: FLUJO Y DIRECCIÓN DEL DINERO (ORIGEN ➔ DESTINO) -->
        <div class="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-gray-50/80 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/60">
          <!-- Caja Origen -->
          <div class="md:col-span-5 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 flex items-center gap-1">
                <span>🔴</span> Salida / Origen
              </span>
              <span class="text-[10px] font-bold text-gray-500 uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                {{ formatTipo(cajaOrigenInfo?.tipo_caja) }}
              </span>
            </div>
            
            <div class="text-base font-black text-gray-900 dark:text-white tracking-tight">
              {{ cajaOrigenInfo?.nombre || 'Buscando caja origen...' }}
            </div>

            <div class="text-xs text-gray-600 dark:text-gray-300 flex flex-col gap-1 border-t border-gray-100 dark:border-gray-700/60 pt-2 mt-1">
              <div class="flex items-center gap-1.5">
                <span class="text-gray-400 font-semibold">👤 Encargado:</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ getEncargadoNombre(cajaOrigenInfo) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-gray-400 font-semibold">🏢 Agencia:</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ getAgenciaNombre(cajaOrigenInfo) }}</span>
              </div>
            </div>
          </div>

          <!-- Indicador Central de Dirección -->
          <div class="md:col-span-1 flex flex-col items-center justify-center py-1">
            <div class="w-10 h-10 rounded-full bg-azul-cope text-white flex items-center justify-center shadow-md animate-pulse">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <span class="text-[9px] font-black text-azul-cope dark:text-blue-400 uppercase tracking-widest mt-1 text-center">
              {{ form.tipo_operacion === 'egreso' ? 'Egreso' : 'Ingreso' }}
            </span>
          </div>

          <!-- Caja Destino -->
          <div class="md:col-span-5 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span>🟢</span> Entrada / Destino
              </span>
              <span class="text-[10px] font-bold text-gray-500 uppercase px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                {{ formatTipo(cajaDestinoInfo?.tipo_caja) }}
              </span>
            </div>

            <div class="text-base font-black text-gray-900 dark:text-white tracking-tight">
              {{ cajaDestinoInfo?.nombre || 'Buscando caja destino...' }}
            </div>

            <div class="text-xs text-gray-600 dark:text-gray-300 flex flex-col gap-1 border-t border-gray-100 dark:border-gray-700/60 pt-2 mt-1">
              <div class="flex items-center gap-1.5">
                <span class="text-gray-400 font-semibold">👤 Encargado:</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ getEncargadoNombre(cajaDestinoInfo) }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-gray-400 font-semibold">🏢 Agencia:</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ getAgenciaNombre(cajaDestinoInfo) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. DETALLE DE DENOMINACIONES (BILLETES Y MONEDAS) -->
        <div class="space-y-6">
          <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
              Detalle de Denominaciones a Trasladar
            </h3>
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {{ form.categoria_movimiento === 'deteriorado' ? 'Modalidad: Efectivo Deteriorado' : 'Modalidad: Operaciones (Efectivo Bueno)' }}
            </span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Billetes -->
            <div v-if="billetesList.length > 0" class="space-y-3">
              <h4 class="text-xs font-bold text-azul-cope dark:text-blue-400 uppercase tracking-wider">Billetes</h4>
              <div class="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-2/5">Denominación</th>
                      <th v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th v-if="form.categoria_movimiento === 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    <tr v-for="denom in billetesList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-200">
                        <div>{{ denom.nombre }} ({{ formatCurrency(denom.valor) }})</div>
                        <!-- Stock disponible informativo según el tipo de movimiento -->
                        <div class="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                          <span v-if="form.categoria_movimiento === 'abastecimiento'">
                            <span v-if="(stockMap[denom.id]?.stock_bueno ?? 0) > 0" class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Con existencia en Bóveda
                            </span>
                            <span v-else class="inline-flex items-center gap-1 font-bold text-gray-400 dark:text-gray-500">
                              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              Sin existencia en Bóveda
                            </span>
                          </span>
                        </div>
                      </td>
                      <td v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-azul-cope focus:border-transparent text-sm"
                        />
                      </td>
                      <td v-if="form.categoria_movimiento === 'deteriorado'" class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent text-sm"
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
              <h4 class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Monedas</h4>
              <div class="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th class="p-3 w-2/5">Denominación</th>
                      <th v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Buena</th>
                      <th v-if="form.categoria_movimiento === 'deteriorado'" class="p-3 w-1/4 text-center">Cant. Deteriorada</th>
                      <th class="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    <tr v-for="denom in monedasList" :key="denom.id">
                      <td class="p-3 font-semibold text-gray-800 dark:text-gray-200">
                        <div>{{ denom.nombre }} ({{ formatCurrency(denom.valor) }})</div>
                        <!-- Stock disponible informativo según el tipo de movimiento -->
                        <div class="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
                          <span v-if="form.categoria_movimiento === 'abastecimiento'">
                            <span v-if="(stockMap[denom.id]?.stock_bueno ?? 0) > 0" class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Con existencia en Bóveda
                            </span>
                            <span v-else class="inline-flex items-center gap-1 font-bold text-gray-400 dark:text-gray-500">
                              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              Sin existencia en Bóveda
                            </span>
                          </span>
                        </div>
                      </td>
                      <td v-if="form.categoria_movimiento !== 'deteriorado'" class="p-3">
                        <input
                          v-model.number="denom.cantidad_buena"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-sm"
                        />
                      </td>
                      <td v-if="form.categoria_movimiento === 'deteriorado'" class="p-3">
                        <input
                          v-model.number="denom.cantidad_deteriorada"
                          type="number"
                          min="0"
                          placeholder="0"
                          class="block w-full text-center py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent text-sm"
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
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-inner">
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Gran Total del Movimiento</span>
            <span class="text-2xl font-extrabold font-mono text-azul-cope dark:text-white">
              {{ formatCurrency(granTotal) }}
            </span>
          </div>
        </div>

        <!-- 4. DESCRIPCIÓN / COMENTARIOS -->
        <div>
          <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Comentarios / Bitácora Opcional</label>
          <textarea
            v-model="form.descripcion"
            rows="2"
            placeholder="Escribe comentarios o detalles sobre este traslado (Ej. Número de bolsa de seguridad, valija)..."
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm transition-all"
          ></textarea>
        </div>
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
  agencia?: { id?: number; nombre: string }
  usuario_en_turno?: { id: number; name: string } | null
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

const authStore = useAuthStore()

const cajas = ref<Caja[]>([])
const denominaciones = ref<Denominacion[]>([])
const localDenominaciones = ref<Denominacion[]>([])

const form = ref({
  origen_caja_id: '',
  destino_caja_id: '',
  tipo_operacion: 'egreso' as 'ingreso' | 'egreso',
  categoria_movimiento: 'abastecimiento' as 'abastecimiento' | 'devolucion' | 'deteriorado',
  descripcion: '',
})

// Catálogo de tipos de movimiento disponibles para el usuario operativo
const tiposMovimiento = [
  {
    value: 'abastecimiento' as const,
    label: 'Abastecimiento de Efectivo',
    descripcion: 'Solicitar efectivo operativo de Bóveda hacia tu Ventanilla.',
    icon: '📥',
    badge: 'Bóveda ➔ Ventanilla'
  },
  {
    value: 'devolucion' as const,
    label: 'Devolución de Efectivo',
    descripcion: 'Enviar excedente de efectivo bueno desde tu Ventanilla hacia Bóveda.',
    icon: '📤',
    badge: 'Ventanilla ➔ Bóveda'
  },
  {
    value: 'deteriorado' as const,
    label: 'Devolución de Deteriorado',
    descripcion: 'Enviar billetes y monedas dañadas a Bóveda (Deteriorado).',
    icon: '⚠️',
    badge: 'Ventanilla ➔ Bóveda'
  }
]

// 1. Identificar caja asignada al cajero logueado
const miCajaAsignada = computed(() => {
  const userId = authStore.user?.id
  if (!userId) return null
  return cajas.value.find(c => c.usuario_id === userId && c.tipo_caja === 'ventanilla') || null
})

// Selector para admins que no tienen ventanilla propia asignada
const cajaOperativaSeleccionadaId = ref<string>('')

// Ventanillas elegibles para administradores
const ventanillasDisponibles = computed(() => {
  const userAgencia = authStore.user?.agencia_id || authStore.user?.id_agencia || authStore.user?.agencia?.id
  return cajas.value.filter(c => {
    if (!c.estado || c.tipo_caja !== 'ventanilla') return false
    if (!authStore.hasRole('Super Admin') && userAgencia) {
      return c.agencia_id === Number(userAgencia)
    }
    return true
  })
})

// Caja operativa activa (la ventanilla asignada o la elegida por el supervisor)
const cajaOperativa = computed(() => {
  if (miCajaAsignada.value) return miCajaAsignada.value
  if (cajaOperativaSeleccionadaId.value) {
    return cajas.value.find(c => c.id === Number(cajaOperativaSeleccionadaId.value)) || null
  }
  // Primer ventanilla de la lista disponible como fallback
  return ventanillasDisponibles.value[0] || null
})

// 2. Identificar la Bóveda de la agencia de la caja operativa
const miBoveda = computed(() => {
  const agenciaId = cajaOperativa.value?.agencia_id || authStore.user?.agencia_id || authStore.user?.id_agencia || authStore.user?.agencia?.id
  if (!agenciaId) return null
  return cajas.value.find(c => c.tipo_caja === 'boveda' && c.agencia_id === Number(agenciaId) && c.estado) 
    || cajas.value.find(c => c.tipo_caja === 'boveda' && c.agencia_id === Number(agenciaId)) 
    || null
})

// Sincronizar automáticamente Origen, Destino y Tipo de Operación
const sincronizarRutas = () => {
  if (!cajaOperativa.value || !miBoveda.value) {
    form.value.origen_caja_id = ''
    form.value.destino_caja_id = ''
    return
  }

  if (form.value.categoria_movimiento === 'abastecimiento') {
    // Sale de Bóveda hacia la Ventanilla (Operaciones)
    form.value.origen_caja_id = String(miBoveda.value.id)
    form.value.destino_caja_id = String(cajaOperativa.value.id)
    form.value.tipo_operacion = 'egreso'
  } else {
    // Devolución o Deteriorado: Sale de Ventanilla hacia Bóveda
    form.value.origen_caja_id = String(cajaOperativa.value.id)
    form.value.destino_caja_id = String(miBoveda.value.id)
    form.value.tipo_operacion = 'ingreso'
  }
}

watch([() => form.value.categoria_movimiento, cajaOperativa, miBoveda], () => {
  sincronizarRutas()
}, { immediate: true })

const seleccionarTipoMovimiento = (tipo: 'abastecimiento' | 'devolucion' | 'deteriorado') => {
  form.value.categoria_movimiento = tipo
  // Limpiar campos de cantidad al alternar entre bueno y deteriorado
  localDenominaciones.value.forEach(d => {
    d.cantidad_buena = 0
    d.cantidad_deteriorada = 0
  })
  sincronizarRutas()
}

// Información reactiva de las cajas Origen y Destino para pintar en la interfaz
const cajaOrigenInfo = computed(() => {
  if (!form.value.origen_caja_id) return null
  return cajas.value.find(c => c.id === Number(form.value.origen_caja_id)) || null
})

const cajaDestinoInfo = computed(() => {
  if (!form.value.destino_caja_id) return null
  return cajas.value.find(c => c.id === Number(form.value.destino_caja_id)) || null
})

const getEncargadoNombre = (caja: Caja | null) => {
  if (!caja) return 'Sin asignar'
  if (caja.tipo_caja === 'boveda') {
    return caja.usuario_en_turno?.name || 'Custodio de Bóveda'
  }
  return caja.usuario_en_turno?.name || (caja.usuario_id === authStore.user?.id ? authStore.user?.name : 'Sin asignar')
}

const getAgenciaNombre = (caja: Caja | null) => {
  if (!caja) return 'Sin asignar'
  return caja.agencia?.nombre || `Agencia #${caja.agencia_id || 'N/A'}`
}

// Consulta de Stock en tiempo real para la caja origen
const stockMap = ref<Record<number, { stock_bueno: number, stock_deteriorado: number }>>({})

const fetchStock = async () => {
  stockMap.value = {}
  if (!form.value.origen_caja_id) return
  
  try {
    const res = await axios.get(`/cajas/${form.value.origen_caja_id}/stock-denominaciones`)
    const map: Record<number, { stock_bueno: number, stock_deteriorado: number }> = {}
    res.data.forEach((item: any) => {
      map[item.denominacion_id] = {
        stock_bueno: item.stock_bueno,
        stock_deteriorado: item.stock_deteriorado
      }
    })
    stockMap.value = map
  } catch (err) {
    console.error('Error al cargar stock de la caja origen:', err)
  }
}

watch(() => form.value.origen_caja_id, fetchStock)

// Cargar catálogos iniciales
onMounted(async () => {
  try {
    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    cajas.value = cajasRes.data
    denominaciones.value = denomsRes.data.filter((d: any) => d.activo)
    
    // Si no tiene caja asignada, auto-seleccionar la primera ventanilla disponible
    if (!miCajaAsignada.value && ventanillasDisponibles.value.length > 0) {
      cajaOperativaSeleccionadaId.value = String(ventanillasDisponibles.value[0].id)
    }

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
  sincronizarRutas()
}

// Billetes y Monedas
const billetesList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'billete'))
const monedasList = computed(() => localDenominaciones.value.filter(d => d.tipo === 'moneda'))

const calculaSubtotalDenominacion = (d: Denominacion) => {
  if (form.value.categoria_movimiento === 'deteriorado') {
    return d.valor * (d.cantidad_deteriorada || 0)
  } else {
    return d.valor * (d.cantidad_buena || 0)
  }
}

const granTotal = computed(() => {
  return localDenominaciones.value.reduce((acc, denom) => {
    return acc + calculaSubtotalDenominacion(denom)
  }, 0)
})

const submitForm = async () => {
  formError.value = ''
  successMsg.value = ''
  submitting.value = true

  if (!cajaOperativa.value) {
    formError.value = 'No se ha detectado una ventanilla activa para operar.'
    submitting.value = false
    return
  }

  if (!miBoveda.value) {
    formError.value = 'No se ha detectado una Bóveda activa para procesar la transacción.'
    submitting.value = false
    return
  }

  const isDeteriorados = form.value.categoria_movimiento === 'deteriorado'

  // Validar stock disponible únicamente para Abastecimiento (porque sale de Bóveda)
  // Para Devolución y Deteriorado no hay restricción ya que son ingresos que alimentan el inventario de Bóveda
  if (form.value.categoria_movimiento === 'abastecimiento') {
    for (const d of localDenominaciones.value) {
      const cantReq = d.cantidad_buena || 0
      if (cantReq > 0) {
        const disponible = stockMap.value[d.id]?.stock_bueno || 0
        if (cantReq > disponible) {
          formError.value = `No hay suficiente existencia en Bóveda para cubrir la cantidad solicitada en la denominación ${d.nombre}.`
          submitting.value = false
          return
        }
      }
    }
  }

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
      cantidad_deteriorada: isDeteriorados ? (d.cantidad_deteriorada || 0) : 0
    }))

  if (detallesPayload.length === 0) {
    formError.value = 'Debe ingresar al menos una cantidad mayor a cero en los billetes o monedas.'
    submitting.value = false
    return
  }

  try {
    await axios.post('/movimientos/solicitar', {
      origen_caja_id: Number(form.value.origen_caja_id),
      destino_caja_id: Number(form.value.destino_caja_id),
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

const formatTipo = (tipo?: string) => {
  if (tipo === 'boveda') return 'Bóveda'
  if (tipo === 'general') return 'Caja General'
  if (tipo === 'ventanilla') return 'Ventanilla'
  return tipo || 'Caja'
}

const formatCurrency = (val: number | undefined) => {
  if (val === undefined) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}
</script>

<style scoped>
</style>
