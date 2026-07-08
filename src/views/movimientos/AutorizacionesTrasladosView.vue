<template>
  <div class="p-6 w-full space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
        Bandeja de Traslados Entrantes (Autorizaciones)
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Revisa, programa y autoriza los traslados de efectivo solicitados o enviados por otras agencias/bóvedas del sistema.
      </p>
    </div>

    <!-- Alertas de respuesta -->
    <div v-if="successMsg" class="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400 text-sm font-bold flex items-center gap-2">
      <span>✅</span> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 text-sm font-bold flex items-center gap-2">
      <span>⚠️</span> {{ errorMsg }}
    </div>

    <!-- Filtro de Bóveda Local -->
    <div class="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
      <div class="flex-1 w-full">
        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seleccione su Bóveda Local</label>
        <select
          v-model="bovedaLocalId"
          @change="fetchTraslados"
          class="block w-full sm:w-80 px-3 py-2.5 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold transition-all"
        >
          <option :value="null">-- Ver Todos los Traslados Entrantes --</option>
          <option v-for="caja in bovedasDisponibles" :key="caja.id" :value="caja.id">
            {{ caja.nombre }} ({{ caja.agencia?.nombre }})
          </option>
        </select>
      </div>
      
      <button
        @click="fetchTraslados"
        class="px-5 py-2.5 bg-gray-150 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
      >
        <span>🔄</span> Actualizar
      </button>
    </div>

    <!-- Lista de solicitudes entrantes -->
    <div class="space-y-4">
      <div v-if="loadingList" class="flex flex-col items-center justify-center py-20 space-y-3">
        <div class="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-500">Cargando solicitudes entrantes...</p>
      </div>

      <div v-else-if="trasladosFiltrados.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-250 dark:border-gray-800 text-gray-450 italic text-sm">
        No hay traslados entrantes o peticiones pendientes que requieran su atención en esta bóveda.
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="traslado in trasladosFiltrados"
          :key="traslado.id"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-4"
        >
          <!-- Fila Superior -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-150 dark:border-gray-750">
            <div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                :class="traslado.tipo_traslado === 'pedir' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/35 dark:text-amber-400' : 'bg-green-100 text-green-800 dark:bg-green-950/35 dark:text-green-400'">
                {{ traslado.tipo_traslado === 'pedir' ? '📥 Solicitud de Efectivo Recibida' : '📤 Envío de Efectivo Entrante' }}
              </span>
              <span class="ml-2 text-xs font-bold text-gray-400">#{{ traslado.id }}</span>
            </div>
            <div class="text-right">
              <span class="text-sm font-extrabold text-gray-800 dark:text-white font-mono">
                Monto: {{ formatCurrency(traslado.monto_total) }}
              </span>
            </div>
          </div>

          <!-- Ruta y Agencias -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <p class="text-gray-400 font-bold uppercase text-[10px]">Origen (Entrega)</p>
              <p class="font-extrabold text-gray-800 dark:text-white text-sm">
                {{ traslado.origen_boveda?.nombre }}
              </p>
              <p class="text-gray-500 font-semibold">{{ traslado.origen_boveda?.agencia?.nombre }}</p>
            </div>
            
            <div class="flex items-center justify-center text-gray-300 dark:text-gray-600 hidden md:flex">
              ➡️
            </div>

            <div>
              <p class="text-gray-400 font-bold uppercase text-[10px]">Destino (Recibe)</p>
              <p class="font-extrabold text-gray-800 dark:text-white text-sm">
                {{ traslado.destino_boveda?.nombre }}
              </p>
              <p class="text-gray-500 font-semibold">{{ traslado.destino_boveda?.agencia?.nombre }}</p>
            </div>
          </div>

          <!-- Información General -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-gray-55 dark:bg-gray-900/30 p-3 rounded-2xl text-xs">
            <div v-if="traslado.fecha_programada">
              <span class="font-bold text-gray-400 block">Fecha Programada:</span>
              <span class="font-extrabold text-gray-800 dark:text-gray-200">
                {{ formatDate(traslado.fecha_programada) }}
              </span>
            </div>
            <div v-if="traslado.repartidor">
              <span class="font-bold text-gray-400 block">Repartidor:</span>
              <span class="font-extrabold text-gray-800 dark:text-gray-200">
                {{ traslado.repartidor }}
              </span>
            </div>
            <div>
              <span class="font-bold text-gray-400 block">Solicitante / Creador:</span>
              <span class="font-semibold text-gray-700 dark:text-gray-300">
                {{ traslado.creador?.name || 'Sistema' }}
              </span>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="text-xs space-y-1 p-2 border-l-2 border-amber-500/30">
            <p v-if="traslado.comentario_peticion"><span class="font-bold text-gray-400">Comentario de Petición:</span> <span class="italic text-gray-700 dark:text-gray-300">"{{ traslado.comentario_peticion }}"</span></p>
            <p v-if="traslado.comentario_envio"><span class="font-bold text-gray-400">Comentario de Envío:</span> <span class="italic text-gray-700 dark:text-gray-300">"{{ traslado.comentario_envio }}"</span></p>
          </div>

          <!-- Desglose físico en acordeón/lista simple -->
          <div class="text-xs space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
            <p class="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">Detalle por Denominación:</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div v-for="det in traslado.detalles" :key="det.id" class="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 flex justify-between items-center">
                <span class="font-semibold text-gray-700 dark:text-gray-300">{{ det.denominacion?.nombre }}:</span>
                <span class="font-mono font-bold text-gray-900 dark:text-white">x{{ det.cantidad }}</span>
              </div>
            </div>
          </div>

          <!-- Tracking visual del progreso -->
          <div class="pt-2">
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Estado del Tracking</p>
            
            <!-- Flujo Pedir -->
            <div v-if="traslado.tipo_traslado === 'pedir'" class="grid grid-cols-6 gap-1 text-center select-none text-[10px]">
              <div :class="getStepClass(traslado.estado, ['pendiente', 'solicitud_recibida', 'programado', 'enviado', 'paquete_recibido', 'ingresado'])">
                <span class="block text-sm">📝</span> Solicitado
              </div>
              <div :class="getStepClass(traslado.estado, ['solicitud_recibida', 'programado', 'enviado', 'paquete_recibido', 'ingresado'])">
                <span class="block text-sm">🤝</span> Recibido
              </div>
              <div :class="getStepClass(traslado.estado, ['programado', 'enviado', 'paquete_recibido', 'ingresado'])">
                <span class="block text-sm">📅</span> Programado
              </div>
              <div :class="getStepClass(traslado.estado, ['enviado', 'paquete_recibido', 'ingresado'])">
                <span class="block text-sm">🚚</span> Enviado
              </div>
              <div :class="getStepClass(traslado.estado, ['paquete_recibido', 'ingresado'])">
                <span class="block text-sm">📦</span> En Destino
              </div>
              <div :class="getStepClass(traslado.estado, ['ingresado'])">
                <span class="block text-sm">🏦</span> Depositado
              </div>
            </div>

            <!-- Flujo Enviar -->
            <div v-else class="grid grid-cols-3 gap-1 text-center select-none text-[10px]">
              <div :class="getStepClass(traslado.estado, ['enviado', 'enterado', 'ingresado'])">
                <span class="block text-sm">🚚</span> Enviado
              </div>
              <div :class="getStepClass(traslado.estado, ['enterado', 'ingresado'])">
                <span class="block text-sm">👀</span> Enterado
              </div>
              <div :class="getStepClass(traslado.estado, ['ingresado'])">
                <span class="block text-sm">🏦</span> Depositado
              </div>
            </div>
          </div>

          <!-- Botones de Acción para quien responde o recibe la solicitud entrante -->
          <div class="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-gray-150 dark:border-gray-750">
            
            <!-- Acción: Confirmar Recepción de Solicitud (Solo pedir, estado pendiente) -->
            <button
              v-if="traslado.tipo_traslado === 'pedir' && traslado.estado === 'pendiente'"
              @click="updateStatus(traslado.id, 'confirmar-recepcion')"
              class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Confirmar Recepción de Petición
            </button>

            <!-- Acción: Programar Fecha (Solo pedir, estado solicitud_recibida) -->
            <div v-if="traslado.tipo_traslado === 'pedir' && traslado.estado === 'solicitud_recibida'" class="flex items-center gap-2">
              <input
                type="date"
                v-model="tempFechaProgramada[traslado.id]"
                class="px-2.5 py-1 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-700 text-xs font-bold"
              />
              <button
                @click="programarFechaEnvio(traslado.id)"
                class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Programar Fecha
              </button>
            </div>

            <!-- Acción: Enviar Efectivo (Solo pedir, estado programado) -->
            <div v-if="traslado.tipo_traslado === 'pedir' && traslado.estado === 'programado'" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                v-model="tempRepartidor[traslado.id]"
                placeholder="Nombre del Repartidor"
                class="px-2.5 py-1 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-700 text-xs font-bold"
              />
              <input
                type="text"
                v-model="tempComentarioEnvio[traslado.id]"
                placeholder="Comentario Envío (Opcional)"
                class="px-2.5 py-1 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-700 text-xs font-semibold"
              />
              <button
                @click="enviarEfectivoPeticion(traslado.id)"
                class="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Registrar Salida y Enviar
              </button>
            </div>

            <!-- Acción: Marcar Enterado (Solo enviar, estado enviado) -->
            <button
              v-if="traslado.tipo_traslado === 'enviar' && traslado.estado === 'enviado'"
              @click="updateStatus(traslado.id, 'marcar-enterado')"
              class="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Marcar como Enterado
            </button>

            <!-- Acción: Confirmar Ingreso Efectivo (Solo para el flujo ENVIAR, cuando lo recibe la otra bóveda) -->
            <button
              v-if="traslado.tipo_traslado === 'enviar' && ['enviado', 'enterado'].includes(traslado.estado)"
              @click="updateStatus(traslado.id, 'confirmar-ingreso')"
              class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Confirmar Ingreso a Bóveda
            </button>

            <!-- Acción: Cancelar Solicitud -->
            <button
              v-if="['pendiente', 'solicitud_recibida', 'programado'].includes(traslado.estado)"
              @click="cancelarTraslado(traslado.id)"
              class="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>

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

const tempFechaProgramada = ref<Record<number, string>>({})
const tempRepartidor = ref<Record<number, string>>({})
const tempComentarioEnvio = ref<Record<number, string>>({})

const bovedasDisponibles = computed(() => {
  return cajasList.value.filter(c => c.tipo_caja === 'boveda')
})

// Filtrar traslados entrantes:
// - Para 'pedir': la bóveda local es la ORIGEN (a quien le piden).
// - Para 'enviar': la bóveda local es la DESTINO (quien recibe el envío).
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

const updateStatus = async (id: number, endpoint: string) => {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await axios.post(`/cajas/traslado-bovedas/${id}/${endpoint}`)
    successMsg.value = 'Estado de traslado actualizado exitosamente.'
    fetchTraslados()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al actualizar el estado de traslado.'
  }
}

const programarFechaEnvio = async (id: number) => {
  const fecha = tempFechaProgramada.value[id]
  if (!fecha) {
    errorMsg.value = 'Debe seleccionar una fecha válida.'
    return
  }
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await axios.post(`/cajas/traslado-bovedas/${id}/programar-fecha`, {
      fecha_programada: fecha
    })
    successMsg.value = 'Fecha programada guardada correctamente.'
    fetchTraslados()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al guardar la fecha programada.'
  }
}

const enviarEfectivoPeticion = async (id: number) => {
  const rep = tempRepartidor.value[id]
  const com = tempComentarioEnvio.value[id]
  if (!rep) {
    errorMsg.value = 'Debe especificar el nombre del repartidor.'
    return
  }
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await axios.post(`/cajas/traslado-bovedas/${id}/enviar-efectivo`, {
      repartidor: rep,
      comentario_envio: com || null
    })
    successMsg.value = 'Efectivo enviado y egreso registrado exitosamente.'
    fetchTraslados()
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al enviar efectivo.'
  }
}

const cancelarTraslado = async (id: number) => {
  if (!confirm('¿Está seguro de que desea cancelar esta solicitud?')) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await axios.delete(`/cajas/traslado-bovedas/${id}`)
    successMsg.value = 'Solicitud de traslado cancelada.'
    fetchTraslados()
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

const getStepClass = (estadoActual: string, targetEstados: string[]) => {
  const isIncluded = targetEstados.includes(estadoActual)
  if (estadoActual === 'cancelado') {
    return 'p-2 rounded-xl bg-red-50 text-red-500 border border-red-200 opacity-60'
  }
  if (isIncluded) {
    if (estadoActual === targetEstados[targetEstados.length - 1]) {
      return 'p-2 rounded-xl bg-green-50 text-green-700 border-2 border-green-500 font-bold shadow-sm'
    }
    return 'p-2 rounded-xl bg-azul-cope/10 text-azul-cope border border-azul-cope font-bold shadow-xs'
  }
  return 'p-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-400 border border-gray-150 dark:border-gray-800'
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
