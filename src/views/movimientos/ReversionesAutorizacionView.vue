<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-750">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Autorizaciones de Reversiones de Caja
        </h1>
        <p class="text-xs text-gray-550 dark:text-gray-400 mt-1">
          Bandeja de aprobación y rechazo de solicitudes de reversión de transacciones.
        </p>
      </div>
      <button 
        @click="fetchSolicitudes"
        class="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-250 dark:border-gray-700 text-gray-750 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
      >
        <span>🔄</span> Actualizar Bandeja
      </button>
    </div>

    <!-- Filtros y estadísticas rápidas -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-700/60 rounded-3xl shadow-md">
      <div class="flex items-center gap-4">
        <span class="text-xs text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap">Ver solicitudes:</span>
        <div class="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-xl gap-1">
          <button 
            @click="filterEstado = 'pendiente'" 
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="filterEstado === 'pendiente' ? 'bg-white dark:bg-gray-850 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'"
          >
            Pendientes ({{ pendientesCount }})
          </button>
          <button 
            @click="filterEstado = 'todos'" 
            class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            :class="filterEstado === 'todos' ? 'bg-white dark:bg-gray-850 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'"
          >
            Historial Completo
          </button>
        </div>
      </div>

      <!-- Buscador -->
      <div class="w-full sm:w-1/3">
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Buscar por caja, cajero o código tx..."
          class="w-full px-3.5 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
        />
      </div>
    </div>

    <!-- Tabla de Solicitudes -->
    <div class="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-700/60 rounded-3xl shadow-xl overflow-hidden">
      <div v-if="loading" class="flex flex-col items-center py-20 space-y-3">
        <div class="w-10 h-10 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
        <p class="text-xs text-gray-400">Cargando bandeja de autorizaciones...</p>
      </div>

      <div v-else-if="filteredSolicitudes.length === 0" class="p-12 text-center space-y-4">
        <div class="inline-flex p-4 bg-gray-55 dark:bg-gray-800 text-gray-400 rounded-full">
          <span class="text-3xl">📥</span>
        </div>
        <div>
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">Sin Solicitudes</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            No hay solicitudes de reversión de caja en la bandeja actual.
          </p>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-55 dark:bg-gray-955 border-b border-gray-150 dark:border-gray-750 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="p-3.5">Fecha</th>
              <th class="p-3.5">Agencia</th>
              <th class="p-3.5">Creador por</th>
              <th class="p-3.5">Caja / Cajero</th>
              <th class="p-3.5">Transacción</th>
              <th class="p-3.5">Estado</th>
              <th class="p-3.5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 dark:divide-gray-750/60 text-gray-750 dark:text-gray-300">
            <tr v-for="sol in filteredSolicitudes" :key="sol.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
              <!-- Fecha -->
              <td class="p-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                {{ formatDateTime(sol.created_at) }}
              </td>

              <!-- Agencia -->
              <td class="p-3.5 font-semibold text-gray-900 dark:text-white">
                {{ sol.agencia?.nombre || 'Agencia ' + sol.agencia_id }}
              </td>

              <!-- Creador -->
              <td class="p-3.5">
                {{ sol.creador?.name || 'Usuario ' + sol.usuario_creador_id }}
              </td>

              <!-- Caja / Cajero -->
              <td class="p-3.5">
                <span class="font-bold text-gray-900 dark:text-white">{{ sol.codigo_caja }}</span>
                <span class="block text-[10px] text-gray-400">{{ sol.nombre_cajero }}</span>
              </td>

              <!-- Transacción -->
              <td class="p-3.5 font-mono">
                <span class="font-bold">{{ sol.codigo_transaccion }}</span>
                <span class="block text-[10px] text-gray-400 font-bold uppercase">{{ sol.tipo_transaccion }}</span>
              </td>

              <!-- Estado -->
              <td class="p-3.5">
                <span 
                  class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider block w-fit"
                  :class="getEstadoClass(sol.estado)"
                >
                  {{ sol.estado }}
                </span>
                <span v-if="sol.estado !== 'pendiente' && sol.autorizador" class="block text-[9px] text-gray-400 mt-1">
                  Por: {{ sol.autorizador.name }}
                </span>
              </td>

              <!-- Acción -->
              <td class="p-3.5 text-center whitespace-nowrap">
                <button
                  @click="openDetailModal(sol)"
                  class="px-3.5 py-1.5 bg-azul-cope hover:bg-azul-cope/95 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
                >
                  🔍 {{ sol.estado === 'pendiente' ? 'Evaluar & Procesar' : 'Ver Detalles' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE DETALLE Y PROCESAMIENTO -->
    <Transition name="fade">
      <div v-if="detailModalOpen && selectedSolicitud" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl border border-gray-250 dark:border-gray-700 shadow-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
          
          <!-- Header Modal -->
          <div class="flex justify-between items-start pb-4 border-b border-gray-150 dark:border-gray-750">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                Detalle de Solicitud de Reversión
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Fecha: <span class="font-mono">{{ formatDateTime(selectedSolicitud.created_at) }}</span>
              </p>
            </div>
            <button @click="detailModalOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 text-xl font-bold cursor-pointer">&times;</button>
          </div>

          <!-- Campos Detalle -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Agencia del Creador</span>
              <span class="text-xs font-bold text-gray-900 dark:text-white">{{ selectedSolicitud.agencia?.nombre }}</span>
            </div>
            
            <div class="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Usuario Creador</span>
              <span class="text-xs font-bold text-gray-900 dark:text-white">{{ selectedSolicitud.creador?.name }}</span>
            </div>

            <div class="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Código de Caja / Cajero</span>
              <span class="text-xs font-bold text-gray-900 dark:text-white">{{ selectedSolicitud.codigo_caja }}</span>
              <span class="block text-[10px] text-gray-400 mt-0.5">{{ selectedSolicitud.nombre_cajero }}</span>
            </div>

            <div class="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Transacción Relacionada</span>
              <span class="text-xs font-bold text-gray-900 dark:text-white font-mono">{{ selectedSolicitud.codigo_transaccion }}</span>
              <span class="block text-[10px] text-gray-400 font-bold uppercase mt-0.5">{{ selectedSolicitud.tipo_transaccion }}</span>
            </div>
          </div>

          <!-- Motivo -->
          <div class="p-4 bg-gray-50 dark:bg-gray-955 border border-gray-150 dark:border-gray-800 rounded-2xl">
            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Motivo de Reversión</span>
            <p class="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {{ selectedSolicitud.motivo_reversion }}
            </p>
          </div>

          <!-- Adjuntos -->
          <div v-if="selectedSolicitud.archivos_adjuntos && selectedSolicitud.archivos_adjuntos.length > 0" class="space-y-2">
            <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Comprobantes Adjuntos</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a 
                v-for="(file, fIdx) in selectedSolicitud.archivos_adjuntos" 
                :key="fIdx"
                :href="file.url"
                target="_blank"
                class="flex items-center gap-2.5 p-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-800 rounded-2xl text-xs text-blue-600 dark:text-blue-400 font-bold transition-all shadow-sm truncate"
              >
                <span class="text-xl">📄</span>
                <span class="truncate">{{ file.nombre }}</span>
              </a>
            </div>
          </div>

          <!-- Estado y Autorización si ya fue procesada -->
          <div v-if="selectedSolicitud.estado !== 'pendiente'" class="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-2">
            <div class="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-2">
              <span class="text-xs font-bold text-gray-500">Estado de Autorización:</span>
              <span 
                class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                :class="getEstadoClass(selectedSolicitud.estado)"
              >
                {{ selectedSolicitud.estado }}
              </span>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>Autorizador: <span class="font-bold text-gray-800 dark:text-gray-200">{{ selectedSolicitud.autorizador?.name }}</span></p>
              <p>Fecha de Acción: <span class="font-mono">{{ formatDateTime(selectedSolicitud.fecha_autorizacion) }}</span></p>
              <p v-if="selectedSolicitud.observaciones_autorizador">
                Observaciones: <span class="text-gray-800 dark:text-gray-200 italic">"{{ selectedSolicitud.observaciones_autorizador }}"</span>
              </p>
            </div>
          </div>

          <!-- Formulario de Evaluación (Solo si está pendiente) -->
          <div v-else class="space-y-4 pt-2">
            <div>
              <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Observaciones / Motivos del Autorizador</label>
              <textarea 
                v-model="observaciones" 
                rows="3"
                placeholder="Ingresa notas aclaratorias u observaciones para la aprobación/rechazo..."
                class="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white resize-none"
              ></textarea>
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center justify-end gap-3">
              <button 
                @click="procesar('rechazado')"
                :disabled="submitting"
                class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                ❌ Rechazar Solicitud
              </button>
              <button 
                @click="procesar('aprobado')"
                :disabled="submitting"
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                ✅ Aprobar Reversión
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import Swal from 'sweetalert2'

interface User {
  id: number
  name: string
}

interface Agencia {
  id: number
  nombre: string
}

interface Adjunto {
  nombre: string
  url: string
  path: string
}

interface SolicitudReversion {
  id: number
  agencia_id: number
  usuario_creador_id: number
  codigo_caja: string
  nombre_cajero: string
  codigo_transaccion: string
  tipo_transaccion: string
  motivo_reversion: string
  archivos_adjuntos: Adjunto[] | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  observaciones_autorizador: string | null
  fecha_autorizacion: string | null
  created_at: string
  agencia?: Agencia
  creador?: User
  autorizador?: User
}

const loading = ref(false)
const submitting = ref(false)
const solicitudes = ref<SolicitudReversion[]>([])
const selectedSolicitud = ref<SolicitudReversion | null>(null)
const detailModalOpen = ref(false)
const observaciones = ref('')
const searchTerm = ref('')
const filterEstado = ref<'pendiente' | 'todos'>('pendiente')

const fetchSolicitudes = async () => {
  loading.value = true
  try {
    const res = await axios.get('/reversiones')
    solicitudes.value = res.data
  } catch (err) {
    console.error('Error al cargar solicitudes de reversión para autorización', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSolicitudes()
})

const openDetailModal = (sol: SolicitudReversion) => {
  selectedSolicitud.value = sol
  detailModalOpen.value = true
  observaciones.value = ''
}

const procesar = async (accion: 'aprobado' | 'rechazado') => {
  if (!selectedSolicitud.value) return

  if (accion === 'rechazado' && !observaciones.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo Requerido',
      text: 'Debes ingresar una justificación u observaciones en caso de rechazo.'
    })
    return
  }

  const confirmAction = await Swal.fire({
    title: `¿Confirmar acción?`,
    text: `Vas a marcar esta solicitud como ${accion.toUpperCase()}.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: accion === 'aprobado' ? '#10b981' : '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  })

  if (!confirmAction.isConfirmed) return

  submitting.value = true
  try {
    const res = await axios.post(`/reversiones/${selectedSolicitud.value.id}/procesar`, {
      accion,
      observaciones: observaciones.value
    })

    Swal.fire({
      icon: 'success',
      title: 'Procesada con éxito',
      text: res.data.message || 'La solicitud ha sido procesada de manera correcta.',
      confirmButtonColor: '#0a4275'
    })

    detailModalOpen.value = false
    selectedSolicitud.value = null
    fetchSolicitudes()
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error de procesamiento',
      text: err.response?.data?.message || 'Ocurrió un error al procesar la solicitud.'
    })
  } finally {
    submitting.value = false
  }
}

// Filtro de listado
const filteredSolicitudes = computed(() => {
  return solicitudes.value.filter((sol) => {
    // Filtro por término de búsqueda
    const textMatch = 
      sol.codigo_transaccion.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      sol.nombre_cajero.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      sol.codigo_caja.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (sol.creador?.name || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    
    // Filtro por estado
    const estadoMatch = 
      filterEstado.value === 'todos' || 
      sol.estado === 'pendiente'

    return textMatch && estadoMatch
  })
})

const pendientesCount = computed(() => {
  return solicitudes.value.filter(s => s.estado === 'pendiente').length
})

const getEstadoClass = (estado: string) => {
  if (estado === 'aprobado') return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-900/50'
  if (estado === 'rechazado') return 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-450 border border-red-250 dark:border-red-900/50'
  return 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-450 border border-amber-250 dark:border-amber-900/50'
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
