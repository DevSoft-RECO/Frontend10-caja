<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          Bandeja de Traslados Entrantes (Autorizaciones)
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Revisa, programa y autoriza las solicitudes de efectivo y envíos entrantes de otras agencias.
        </p>
      </div>

      <!-- Volver al listado si está en vista detalle -->
      <button
        v-if="selectedTraslado"
        @click="selectedTraslado = null"
        class="px-4 py-2 bg-gray-100 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <span>⬅️</span> Volver al Listado
      </button>
    </div>

    <!-- Alertas de respuesta -->
    <div v-if="successMsg" class="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400 text-sm font-bold flex items-center gap-2">
      <span>✅</span> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 text-sm font-bold flex items-center gap-2">
      <span>⚠️</span> {{ errorMsg }}
    </div>

    <!-- VISTA 1: DETALLE Y PROCESAMIENTO DEL TRASLADO -->
    <div v-if="selectedTraslado" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      <!-- Panel de Datos e Inventario Fisico -->
      <div class="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-5">
        <div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
            :class="selectedTraslado.tipo_traslado === 'pedir' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/35 dark:text-amber-400' : 'bg-green-100 text-green-800 dark:bg-green-950/35 dark:text-green-400'">
            {{ selectedTraslado.tipo_traslado === 'pedir' ? '📥 Petición de Efectivo' : '📤 Envío de Efectivo Entrante' }}
          </span>
          <span class="ml-2 text-xs font-bold text-gray-400">#{{ selectedTraslado.id }}</span>
        </div>

        <!-- Ruta -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider">Ruta del Traslado</h3>
          <div class="p-3 bg-gray-55 dark:bg-gray-900/40 rounded-2xl space-y-2 text-xs">
            <div>
              <p class="text-gray-400 font-bold uppercase text-[9px]">Origen (Entrega)</p>
              <p class="font-extrabold text-gray-800 dark:text-white">{{ selectedTraslado.origen_boveda?.nombre }}</p>
              <p class="text-gray-500">{{ selectedTraslado.origen_boveda?.agencia?.nombre }}</p>
            </div>
            <div class="border-t border-gray-150 dark:border-gray-800 pt-2">
              <p class="text-gray-400 font-bold uppercase text-[9px]">Destino (Recibe)</p>
              <p class="font-extrabold text-gray-800 dark:text-white">{{ selectedTraslado.destino_boveda?.nombre }}</p>
              <p class="text-gray-500">{{ selectedTraslado.destino_boveda?.agencia?.nombre }}</p>
            </div>
          </div>
        </div>

        <!-- Desglose Físico -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider">Desglose Físico</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div
              v-for="det in selectedTraslado.detalles"
              :key="det.id"
              class="p-2.5 rounded-xl bg-gray-55 dark:bg-gray-900/20 border border-gray-150 dark:border-gray-800 flex items-center justify-between text-xs"
            >
              <div>
                <p class="font-bold text-gray-800 dark:text-white">{{ det.denominacion?.nombre }}</p>
                <p class="text-[10px] text-gray-450">{{ formatCurrency(det.denominacion?.valor) }} c/u</p>
              </div>
              <div class="text-right">
                <p class="font-bold font-mono text-gray-950 dark:text-white">x{{ det.cantidad }}</p>
                <p class="text-[10px] font-mono text-gray-500">{{ formatCurrency(det.subtotal) }}</p>
              </div>
            </div>
          </div>
          
          <div class="pt-3 border-t border-gray-150 dark:border-gray-750 flex justify-between items-center">
            <span class="text-xs font-bold text-gray-500">Monto Total:</span>
            <span class="text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {{ formatCurrency(selectedTraslado.monto_total) }}
            </span>
          </div>
        </div>

        <!-- Comentarios y datos generales -->
        <div class="text-xs space-y-2 bg-gray-55 dark:bg-gray-900/30 p-3 rounded-2xl">
          <div v-if="selectedTraslado.comentario_peticion">
            <span class="font-bold text-gray-400 block">Notas de Petición:</span>
            <span class="italic text-gray-700 dark:text-gray-300">"{{ selectedTraslado.comentario_peticion }}"</span>
          </div>
          <div v-if="selectedTraslado.comentario_envio">
            <span class="font-bold text-gray-400 block">Notas de Envío:</span>
            <span class="italic text-gray-700 dark:text-gray-300">"{{ selectedTraslado.comentario_envio }}"</span>
          </div>
        </div>
      </div>

      <!-- Panel de Seguimiento, Tracking y Botones de Acción -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
        
        <!-- Estado Actual Header -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-750">
          <h3 class="text-sm font-bold text-gray-700 dark:text-gray-350">Ciclo de Autorización y Tracking</h3>
          <span class="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Estado: {{ formatEstado(selectedTraslado.estado) }}
          </span>
        </div>

        <!-- Tracking Visual Ampliado y Detallado -->
        <div class="py-4">
          <!-- Flujo: Pedir efectivo -->
          <div v-if="selectedTraslado.tipo_traslado === 'pedir'" class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
            <!-- Linea de conexión de fondo para pantallas grandes -->
            <div class="absolute left-4 top-0 bottom-0 w-0.5 md:left-0 md:right-0 md:top-6 md:h-0.5 md:w-full bg-gray-200 dark:bg-gray-700 z-0"></div>

            <div v-for="step in stepsPedir" :key="step.key" class="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 w-full md:w-1/6">
              <div class="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                :class="getStepNodeClass(selectedTraslado.estado, step.keys)">
                <span>{{ step.icon }}</span>
              </div>
              <div class="text-left md:text-center">
                <p class="text-[10px] font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{{ step.label }}</p>
                <p class="text-[9px] text-gray-450 font-semibold">{{ step.desc }}</p>
              </div>
            </div>
          </div>

          <!-- Flujo: Enviar efectivo -->
          <div v-else class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
            <!-- Linea de conexión de fondo para pantallas grandes -->
            <div class="absolute left-4 top-0 bottom-0 w-0.5 md:left-0 md:right-0 md:top-6 md:h-0.5 md:w-full bg-gray-200 dark:bg-gray-700 z-0"></div>

            <div v-for="step in stepsEnviar" :key="step.key" class="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 w-full md:w-1/3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                :class="getStepNodeClass(selectedTraslado.estado, step.keys)">
                <span>{{ step.icon }}</span>
              </div>
              <div class="text-left md:text-center">
                <p class="text-[10px] font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{{ step.label }}</p>
                <p class="text-[9px] text-gray-450 font-semibold">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional del repartidor / fecha si existe -->
        <div v-if="selectedTraslado.repartidor || selectedTraslado.fecha_programada" class="grid grid-cols-2 gap-4 p-4 bg-amber-50/10 dark:bg-gray-900/50 border border-amber-500/10 rounded-2xl text-xs">
          <div v-if="selectedTraslado.fecha_programada">
            <span class="block text-gray-450 font-bold uppercase text-[9px]">Fecha Programada de Arribo</span>
            <span class="font-extrabold text-gray-800 dark:text-gray-200">{{ formatDate(selectedTraslado.fecha_programada) }}</span>
          </div>
          <div v-if="selectedTraslado.repartidor">
            <span class="block text-gray-450 font-bold uppercase text-[9px]">Repartidor Asignado</span>
            <span class="font-extrabold text-gray-800 dark:text-gray-200">{{ selectedTraslado.repartidor }}</span>
          </div>
        </div>

        <!-- Controles de Procesamiento Administrativo -->
        <div class="p-5 bg-gray-55 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-3xl space-y-4">
          <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Acciones Disponibles</h4>
          
          <div class="flex flex-wrap items-center gap-3">
            <!-- Acción: Confirmar Recepción de Solicitud (Solo pedir, estado pendiente) -->
            <button
              v-if="selectedTraslado.tipo_traslado === 'pedir' && selectedTraslado.estado === 'pendiente'"
              @click="updateStatusDetalle('confirmar-recepcion')"
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🤝</span> Confirmar Recepción de Petición
            </button>

            <!-- Acción: Programar Fecha (Solo pedir, estado solicitud_recibida) -->
            <div v-if="selectedTraslado.tipo_traslado === 'pedir' && selectedTraslado.estado === 'solicitud_recibida'" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <div class="flex-1">
                <input
                  type="date"
                  v-model="fechaProgramadaInput"
                  class="px-3 py-2 w-full border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-700 text-xs font-bold"
                />
              </div>
              <button
                @click="programarFechaEnvioDetalle"
                class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer whitespace-nowrap"
              >
                📅 Guardar y Programar Fecha
              </button>
            </div>

            <!-- Acción: Enviar Efectivo (Solo pedir, estado programado) -->
            <div v-if="selectedTraslado.tipo_traslado === 'pedir' && selectedTraslado.estado === 'programado'" class="flex flex-col gap-3 w-full">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  v-model="repartidorInput"
                  placeholder="Nombre del Repartidor"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-xs font-bold"
                />
                <input
                  type="text"
                  v-model="comentarioEnvioInput"
                  placeholder="Notas/Comentario de Envío (Opcional)"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-xs font-semibold"
                />
              </div>
              <button
                @click="enviarEfectivoPeticionDetalle"
                class="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer self-end flex items-center gap-1.5"
              >
                <span>🚚</span> Registrar Salida y Despachar Efectivo
              </button>
            </div>

            <!-- Acción: Marcar Enterado (Solo enviar, estado enviado) -->
            <button
              v-if="selectedTraslado.tipo_traslado === 'enviar' && selectedTraslado.estado === 'enviado'"
              @click="updateStatusDetalle('marcar-enterado')"
              class="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>👀</span> Marcar como Enterado
            </button>

            <!-- Acción: Confirmar Ingreso Efectivo (Solo para el flujo ENVIAR, cuando lo recibe la otra bóveda) -->
            <button
              v-if="selectedTraslado.tipo_traslado === 'enviar' && ['enviado', 'enterado'].includes(selectedTraslado.estado)"
              @click="updateStatusDetalle('confirmar-ingreso')"
              class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🏦</span> Confirmar Ingreso a Bóveda (Acreditar)
            </button>

            <!-- Acción: Cancelar Solicitud con Reversión -->
            <button
              v-if="!['ingresado', 'cancelado'].includes(selectedTraslado.estado)"
              @click="cancelarTrasladoDetalle"
              class="px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>❌</span> Cancelar Traslado
            </button>
          </div>

          <!-- Mensaje Informativo si está ingresado o cancelado -->
          <div v-if="['ingresado', 'cancelado'].includes(selectedTraslado.estado)" class="text-xs text-gray-500 italic text-center py-2">
            Este traslado se encuentra finalizado en estado: {{ formatEstado(selectedTraslado.estado) }}. No requiere de más acciones.
          </div>
        </div>

      </div>

    </div>

    <!-- VISTA 2: LISTADO GENERAL (MODO LISTA) -->
    <div v-else class="space-y-4">
      <!-- Filtro de Bóveda Local -->
      <div class="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div class="flex-1 w-full">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seleccione su Bóveda Local para Autorizaciones</label>
          <select
            v-model="bovedaLocalId"
            @change="fetchTraslados"
            class="block w-full sm:w-80 px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold transition-all"
          >
            <option :value="null" class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">-- Ver Todos los Traslados Entrantes --</option>
            <option v-for="caja in bovedasDisponibles" :key="caja.id" :value="caja.id" class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">
              {{ caja.nombre }} ({{ caja.agencia?.nombre }})
            </option>
          </select>
        </div>
        
        <button
          @click="fetchTraslados"
          class="px-5 py-2.5 bg-gray-150 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>🔄</span> Actualizar Listado
        </button>
      </div>

      <!-- Tabla/Lista Compacta -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden">
        <div v-if="loadingList" class="flex flex-col items-center justify-center py-20 space-y-3">
          <div class="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-gray-500">Cargando bandeja de traslados...</p>
        </div>

        <div v-else-if="trasladosFiltrados.length === 0" class="text-center py-20 text-gray-450 italic text-sm">
          No se encontraron traslados entrantes pendientes que requieran su atención en esta selección.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-55 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-750 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th class="p-4 text-center">ID</th>
                <th class="p-4">Tipo</th>
                <th class="p-4">Origen / Destino</th>
                <th class="p-4 text-right">Monto Total</th>
                <th class="p-4 text-center">Estado Actual</th>
                <th class="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
              <tr v-for="traslado in trasladosFiltrados" :key="traslado.id" class="hover:bg-gray-55/40 dark:hover:bg-gray-750/10 transition-colors">
                <td class="p-4 font-mono font-bold text-center text-gray-400">#{{ traslado.id }}</td>
                <td class="p-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide"
                    :class="traslado.tipo_traslado === 'pedir' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'">
                    {{ traslado.tipo_traslado === 'pedir' ? '📥 Petición' : '📤 Envío' }}
                  </span>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <div>
                      <span class="font-bold text-gray-900 dark:text-white">{{ traslado.origen_boveda?.nombre }}</span>
                      <span class="block text-[10px] text-gray-450">{{ traslado.origen_boveda?.agencia?.nombre }}</span>
                    </div>
                    <span class="text-gray-300 font-bold">➡️</span>
                    <div>
                      <span class="font-bold text-gray-900 dark:text-white">{{ traslado.destino_boveda?.nombre }}</span>
                      <span class="block text-[10px] text-gray-450">{{ traslado.destino_boveda?.agencia?.nombre }}</span>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-right font-mono font-extrabold text-gray-900 dark:text-white">
                  {{ formatCurrency(traslado.monto_total) }}
                </td>
                <td class="p-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                    :class="getEstadoBadgeClass(traslado.estado)">
                    {{ formatEstado(traslado.estado) }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <button
                    @click="verDetalleTraslado(traslado)"
                    class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 mx-auto"
                  >
                    🔍 Gestionar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'

interface Caja {
  id: number
  nombre: string
  tipo_caja: string
  agencia_id: number
  agencia?: {
    id: number
    nombre: string
  }
}

interface Traslado {
  id: number
  origen_boveda_id: number
  destino_boveda_id: number
  tipo_traslado: 'pedir' | 'enviar'
  monto_total: number
  fecha_programada?: string
  repartidor?: string
  comentario_peticion?: string
  comentario_envio?: string
  usuario_creador_id: number
  estado: string
  origen_boveda?: Caja
  destino_boveda?: Caja
  creador?: {
    id: number
    name: string
  }
  detalles: any[]
}

const bovedaLocalId = ref<number | null>(null)
const loadingList = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const cajasList = ref<Caja[]>([])
const trasladosList = ref<Traslado[]>([])

// Vista detalle
const selectedTraslado = ref<Traslado | null>(null)

// Inputs de formulario de detalle
const fechaProgramadaInput = ref('')
const repartidorInput = ref('')
const comentarioEnvioInput = ref('')

// Steps de tracking ampliados para el flujo PEDIR
const stepsPedir = [
  { key: 'solicitado', label: 'Solicitado', desc: 'Petición inicial', icon: '📝', keys: ['pendiente'] },
  { key: 'recibido', label: 'Recibido', desc: 'Petición aceptada', icon: '🤝', keys: ['solicitud_recibida'] },
  { key: 'programado', label: 'Programado', desc: 'Fecha agendada', icon: '📅', keys: ['programado'] },
  { key: 'enviado', label: 'Enviado', desc: 'Egreso registrado', icon: '🚚', keys: ['enviado'] },
  { key: 'paquete_recibido', label: 'En Destino', desc: 'Físico recibido', icon: '📦', keys: ['paquete_recibido'] },
  { key: 'depositado', label: 'Depositado', desc: 'Dinero acreditado', icon: '🏦', keys: ['ingresado'] }
]

// Steps de tracking ampliados para el flujo ENVIAR
const stepsEnviar = [
  { key: 'enviado', label: 'Enviado', desc: 'Salida de caja', icon: '🚚', keys: ['enviado'] },
  { key: 'enterado', label: 'Enterado', desc: 'Destino notificado', icon: '👀', keys: ['enterado'] },
  { key: 'depositado', label: 'Depositado', desc: 'Ingresado a bóveda', icon: '🏦', keys: ['ingresado'] }
]

const bovedasDisponibles = computed(() => {
  return cajasList.value.filter(c => c.tipo_caja === 'boveda')
})

const trasladosFiltrados = computed(() => {
  return trasladosList.value.filter(t => {
    if (bovedaLocalId.value === null) {
      return true
    }
    if (t.tipo_traslado === 'pedir') {
      return t.origen_boveda_id === bovedaLocalId.value
    } else {
      return t.destino_boveda_id === bovedaLocalId.value
    }
  })
})

const verDetalleTraslado = (traslado: Traslado) => {
  selectedTraslado.value = traslado
  fechaProgramadaInput.value = traslado.fecha_programada ? traslado.fecha_programada.substring(0, 10) : ''
  repartidorInput.value = traslado.repartidor || ''
  comentarioEnvioInput.value = traslado.comentario_envio || ''
  successMsg.value = ''
  errorMsg.value = ''
}

const updateStatusDetalle = async (endpoint: string) => {
  if (!selectedTraslado.value) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await axios.post(`/cajas/traslado-bovedas/${selectedTraslado.value.id}/${endpoint}`)
    successMsg.value = 'El estado de la solicitud ha sido actualizado correctamente.'
    
    // Actualizar item en listado y detalle local
    selectedTraslado.value = res.data.solicitud
    fetchTrasladosSilently()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al actualizar el estado de traslado.'
  }
}

const programarFechaEnvioDetalle = async () => {
  if (!selectedTraslado.value) return
  if (!fechaProgramadaInput.value) {
    errorMsg.value = 'Debe seleccionar una fecha válida.'
    return
  }
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await axios.post(`/cajas/traslado-bovedas/${selectedTraslado.value.id}/programar-fecha`, {
      fecha_programada: fechaProgramadaInput.value
    })
    successMsg.value = 'Fecha de traslado programada guardada exitosamente.'
    selectedTraslado.value = res.data.solicitud
    fetchTrasladosSilently()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al guardar la fecha programada.'
  }
}

const enviarEfectivoPeticionDetalle = async () => {
  if (!selectedTraslado.value) return
  if (!repartidorInput.value) {
    errorMsg.value = 'Debe especificar el nombre del repartidor.'
    return
  }
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await axios.post(`/cajas/traslado-bovedas/${selectedTraslado.value.id}/enviar-efectivo`, {
      repartidor: repartidorInput.value,
      comentario_envio: comentarioEnvioInput.value || null
    })
    successMsg.value = 'Salida de efectivo registrada e iniciada en transporte.'
    selectedTraslado.value = res.data.solicitud
    fetchTrasladosSilently()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al registrar el envío de efectivo.'
  }
}

const cancelarTrasladoDetalle = async () => {
  if (!selectedTraslado.value) return
  if (!confirm('¿Está seguro de que desea cancelar esta solicitud?')) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await axios.delete(`/cajas/traslado-bovedas/${selectedTraslado.value.id}`)
    successMsg.value = 'El traslado ha sido cancelado y los fondos reversados.'
    selectedTraslado.value = res.data.solicitud
    fetchTrasladosSilently()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al cancelar la solicitud.'
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const formatDate = (val: string) => {
  return new Date(val).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
}

const formatEstado = (val: string) => {
  const map: Record<string, string> = {
    'pendiente': 'Pendiente',
    'solicitud_recibida': 'Recibido',
    'programado': 'Programado',
    'enviado': 'Enviado',
    'paquete_recibido': 'Paquete Recibido',
    'enterado': 'Enterado',
    'ingresado': 'Depositado',
    'cancelado': 'Cancelado'
  }
  return map[val] || val
}

const getEstadoBadgeClass = (val: string) => {
  switch (val) {
    case 'pendiente': return 'bg-yellow-50 text-yellow-750 border border-yellow-250 dark:bg-yellow-950/20 dark:text-yellow-450 dark:border-yellow-900/30'
    case 'solicitud_recibida': return 'bg-blue-50 text-blue-750 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
    case 'programado': return 'bg-orange-50 text-orange-750 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30'
    case 'enviado': return 'bg-purple-50 text-purple-755 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30'
    case 'paquete_recibido': return 'bg-sky-50 text-sky-750 border border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30'
    case 'enterado': return 'bg-cyan-50 text-cyan-750 border border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30'
    case 'ingresado': return 'bg-green-50 text-green-750 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
    case 'cancelado': return 'bg-red-50 text-red-750 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
    default: return 'bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400'
  }
}

const getStepNodeClass = (estadoActual: string, stepKeys: string[]) => {
  if (estadoActual === 'cancelado') {
    return 'bg-red-50 border-red-300 text-red-500 scale-95 opacity-50'
  }
  
  const matches = stepKeys.includes(estadoActual)
  if (matches) {
    return 'bg-amber-500 border-amber-600 text-white font-bold scale-115 shadow'
  }

  // Verificar si ya pasó ese estado
  return 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-450'
}

const fetchTraslados = async () => {
  loadingList.value = true
  try {
    const res = await axios.get('/cajas/traslado-bovedas')
    trasladosList.value = res.data
  } catch (err) {
    errorMsg.value = 'Error al cargar el historial de traslados.'
  } finally {
    loadingList.value = false
  }
}

const fetchTrasladosSilently = async () => {
  try {
    const res = await axios.get('/cajas/traslado-bovedas')
    trasladosList.value = res.data
  } catch (_) {}
}

const fetchData = async () => {
  try {
    const resCajas = await axios.get('/cajas')
    cajasList.value = resCajas.data
  } catch (err) {
    errorMsg.value = 'Error al precargar agencias.'
  }
}

onMounted(() => {
  fetchData()
  fetchTraslados()
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
