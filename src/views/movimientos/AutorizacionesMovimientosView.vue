<template>
  <div class="space-y-6 w-full">
    <!-- Header -->
    <div class="flex items-center justify-between pb-2 border-b border-gray-150 dark:border-gray-750">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Autorizaciones de Movimientos
        </h1>
        <p class="text-xs text-gray-550 dark:text-gray-400 mt-1">
          Bandeja de auditoría dual para la aprobación de traslados ordinarios y abastecimientos
        </p>
      </div>
      <button 
        @click="fetchSolicitudes"
        class="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-250 dark:border-gray-700 text-gray-750 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
      >
        <span>🔄</span> Actualizar Bandeja
      </button>
    </div>

    <!-- Bandeja vacía -->
    <div v-if="!loading && solicitudes.length === 0" class="p-12 text-center bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700/60 rounded-3xl space-y-4">
      <div class="inline-flex p-4 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-full">
        <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">Sin Solicitudes Pendientes</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          No hay solicitudes de movimientos ordinarios o abastecimientos en cola por el momento.
        </p>
      </div>
    </div>

    <!-- Spinner cargando -->
    <div v-else-if="loading" class="flex flex-col items-center py-20 space-y-3">
      <div class="w-10 h-10 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      <p class="text-xs text-gray-400">Auditando transacciones activas de la sucursal...</p>
    </div>

    <!-- Tabla de Solicitudes -->
    <div v-else class="bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700/60 rounded-3xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-750 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="p-3.5">Fecha</th>
              <th class="p-3.5">Solicitante</th>
              <th class="p-3.5">Origen</th>
              <th class="p-3.5">Destino</th>
              <th class="p-3.5">Categoría</th>
              <th class="p-3.5 text-right">Monto Total</th>
              <th class="p-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 dark:divide-gray-750/60 text-gray-700 dark:text-gray-300">
            <tr v-for="sol in solicitudes" :key="sol.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-750/15">
              <td class="p-3.5 font-mono text-xs text-gray-500">
                {{ formatDateTime(sol.created_at) }}
              </td>
              <td class="p-3.5 font-semibold text-gray-900 dark:text-white">
                {{ sol.solicitante?.name }}
              </td>
              <td class="p-3.5">
                {{ sol.origen?.nombre || 'Bancos / Externo' }}
                <span class="text-[10px] font-bold text-gray-400 uppercase block">
                  {{ formatTipo(sol.origen?.tipo_caja) }}
                </span>
              </td>
              <td class="p-3.5">
                {{ sol.destino?.nombre }}
                <span class="text-[10px] font-bold text-gray-400 uppercase block">
                  {{ formatTipo(sol.destino?.tipo_caja) }}
                </span>
              </td>
              <td class="p-3.5">
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  :class="getLabelClass(sol.categoria_movimiento)"
                >
                  {{ sol.categoria_movimiento }}
                </span>
              </td>
              <td class="p-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(sol.monto_total) }}
              </td>
              <td class="p-3.5 text-center flex items-center justify-center gap-2">
                <button
                  @click="openAuditarModal(sol)"
                  class="px-4 py-1.5 bg-azul-cope hover:bg-azul-cope/95 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer flex items-center gap-1"
                >
                  🔍 Auditar & Procesar
                </button>
                <button
                  v-if="esSuperAdmin"
                  @click="confirmEliminar(sol.id)"
                  class="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Eliminar Solicitud"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE AUDITORÍA Y APROBACIÓN DUAL -->
    <Transition name="fade">
      <div v-if="comparadorModalOpen && selectedSolicitud" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl border border-gray-250 dark:border-gray-700 shadow-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
          
          <!-- Header Modal -->
          <div class="flex justify-between items-start pb-4 border-b border-gray-150 dark:border-gray-750">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Auditoría de Traslado Ordinario
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maker: <span class="font-bold text-gray-750 dark:text-gray-200">{{ selectedSolicitud.solicitante?.name }}</span> • Categoría: <span class="font-bold uppercase text-azul-cope">{{ selectedSolicitud.categoria_movimiento }}</span>
              </p>
            </div>
            <button @click="comparadorModalOpen = false" class="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 text-xl font-bold cursor-pointer">&times;</button>
          </div>

          <!-- Detalles Físicos y Estados -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Caja/Bóveda Origen</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ selectedSolicitud.origen?.nombre || 'Bancos / Externo' }}</span>
              <span class="text-xs text-gray-500 block mt-0.5">{{ formatTipo(selectedSolicitud.origen?.tipo_caja) }}</span>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Caja/Bóveda Destino</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ selectedSolicitud.destino?.nombre }}</span>
              <span class="text-xs text-gray-500 block mt-0.5">{{ formatTipo(selectedSolicitud.destino?.tipo_caja) }}</span>
            </div>
          </div>

          <!-- Desglose físico solicitado -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-gray-450 uppercase tracking-wider">Desglose Físico por Denominación</h4>
            
            <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-700 font-bold text-gray-500 dark:text-gray-400 uppercase">
                    <th class="p-2.5">Denominación</th>
                    <th v-if="selectedSolicitud.categoria_movimiento !== 'deteriorado'" class="p-2.5 text-center">Cant. Buena Solicitada</th>
                    <th v-if="selectedSolicitud.categoria_movimiento === 'deteriorado'" class="p-2.5 text-center">Cant. Deteriorada Solicitada</th>
                    <th class="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-150 dark:divide-gray-750 font-semibold text-gray-800 dark:text-gray-250">
                  <tr v-for="det in selectedSolicitud.detalles" :key="det.id" class="hover:bg-gray-55/50">
                    <td class="p-2.5 font-bold text-gray-900 dark:text-gray-100">
                      {{ det.denominacion?.nombre }}
                    </td>
                    <td v-if="selectedSolicitud.categoria_movimiento !== 'deteriorado'" class="p-2.5 text-center font-mono" :class="det.cantidad_buena > 0 ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400'">
                      {{ det.cantidad_buena }}
                    </td>
                    <td v-if="selectedSolicitud.categoria_movimiento === 'deteriorado'" class="p-2.5 text-center font-mono" :class="det.cantidad_deteriorada > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'">
                      {{ det.cantidad_deteriorada }}
                    </td>
                    <td class="p-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                      {{ formatCurrency(det.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resumen de totales -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-150 dark:border-gray-750">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl flex flex-col items-center justify-center">
              <span class="text-[10px] font-bold text-gray-450 uppercase mb-1">Monto Total de Traslado</span>
              <span class="text-2xl font-black font-mono text-azul-cope dark:text-blue-400">{{ formatCurrency(selectedSolicitud.monto_total) }}</span>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl flex flex-col">
              <span class="text-[10px] font-bold text-gray-450 uppercase mb-1">Bitácora del Cajero</span>
              <p class="text-xs text-gray-600 dark:text-gray-450 leading-relaxed font-semibold italic">
                {{ selectedSolicitud.descripcion || '(Sin comentarios adicionales del cajero)' }}
              </p>
            </div>
          </div>

          <!-- Observaciones / Feedback -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-500 uppercase">Observaciones de Aprobación o Motivo de Rechazo</label>
            <textarea
              v-model="observaciones"
              rows="2"
              placeholder="Añade justificación o comentarios sobre esta revisión (Obligatorio en caso de rechazo)..."
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-gray-900 dark:text-white font-semibold"
            ></textarea>
          </div>

          <!-- Acciones de Aprobación -->
          <div class="flex justify-end gap-3 pt-2 border-t border-gray-150 dark:border-gray-750/70">
            <button
              @click="procesar('rechazado')"
              :disabled="submitting || (selectedSolicitud.categoria_movimiento === 'deteriorado' && !observaciones)"
              class="px-5 py-2.5 bg-red-650 hover:bg-red-600 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer disabled:opacity-40"
            >
              Rechazar Solicitud
            </button>
            <button
              @click="procesar('aprobado')"
              :disabled="submitting"
              class="px-6 py-2.5 bg-verde-cope hover:bg-verde-cope/95 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer disabled:opacity-40"
            >
              Autorizar Traslado
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

interface User {
  id: number
  name: string
}

interface Caja {
  id: number
  nombre: string
  tipo_caja: string
}

interface Denominacion {
  nombre: string
}

interface SolicitudDetalle {
  id: number
  denominacion_id: number
  cantidad_buena: number
  cantidad_deteriorada: number
  subtotal: number
  denominacion?: Denominacion
}

interface SolicitudMovimiento {
  id: number
  origen_caja_id?: number
  destino_caja_id?: number
  tipo_operacion: string
  categoria_movimiento: string
  monto_total: number
  descripcion?: string
  usuario_solicitante_id: number
  created_at: string
  solicitante?: User
  origen?: Caja
  destino?: Caja
  detalles?: SolicitudDetalle[]
}

const loading = ref(false)
const submitting = ref(false)
const solicitudes = ref<SolicitudMovimiento[]>([])
const selectedSolicitud = ref<SolicitudMovimiento | null>(null)
const comparadorModalOpen = ref(false)
const observaciones = ref('')

const fetchSolicitudes = async () => {
  loading.value = true
  try {
    const res = await axios.get('/movimientos/solicitudes/pendientes')
    solicitudes.value = res.data
  } catch (err) {
    console.error('Error al cargar bandeja de solicitudes de movimientos')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSolicitudes()
})

const openAuditarModal = async (sol: SolicitudMovimiento) => {
  selectedSolicitud.value = sol
  comparadorModalOpen.value = true
  observaciones.value = ''
  
  // Realizar consulta fresca para asegurar la carga completa de relaciones anidadas
  try {
    const res = await axios.get('/movimientos/solicitudes/pendientes')
    const fresh = res.data.find((s: any) => s.id === sol.id)
    if (fresh) {
      selectedSolicitud.value = fresh
    }
  } catch (err) {
    console.error('Error al sincronizar datos frescos del movimiento')
  }
}

const procesar = async (accion: 'aprobado' | 'rechazado') => {
  if (!selectedSolicitud.value) return

  if (accion === 'rechazado' && !observaciones.value.trim()) {
    alert('Debe ingresar un motivo de rechazo en las observaciones.')
    return
  }

  submitting.value = true
  try {
    const res = await axios.post(`/movimientos/solicitudes/${selectedSolicitud.value.id}/procesar`, {
      accion,
      observaciones: observaciones.value
    })
    
    alert(res.data.message || 'Solicitud procesada correctamente.')
    comparadorModalOpen.value = false
    selectedSolicitud.value = null
    fetchSolicitudes()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error al procesar la solicitud.')
  } finally {
    submitting.value = false
  }
}

const formatTipo = (tipo: string | undefined) => {
  if (!tipo) return '-'
  if (tipo === 'boveda') return 'Bóveda'
  if (tipo === 'general') return 'Caja General'
  return 'Ventanilla'
}

const getLabelClass = (cat: string) => {
  if (cat === 'abastecimiento') return 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400'
  if (cat === 'devolucion') return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400'
  return 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400'
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (val: number | undefined) => {
  if (val === undefined) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const esSuperAdmin = computed(() => {
  const authStore = useAuthStore()
  return authStore.user?.roles_list?.includes('Super Admin') ?? false
})

const confirmEliminar = async (id: number) => {
  if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta solicitud de movimiento? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    const res = await axios.delete(`/movimientos/solicitudes/${id}`)
    alert(res.data.message || 'Solicitud eliminada con éxito.')
    fetchSolicitudes()
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error al eliminar la solicitud.')
  }
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
