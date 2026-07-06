<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Autorizaciones de Apertura de Caja
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Flujo de control dual: Revisa y aprueba o rechaza las solicitudes de apertura enviadas por los cajeros de la sucursal.
        </p>
      </div>
    </div>

    <!-- Main Table -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-4">
      <div class="flex justify-between items-center pb-2">
        <h2 class="text-lg font-bold text-gray-950 dark:text-white">Solicitudes Pendientes</h2>
        <button
          @click="fetchSolicitudes"
          class="px-4 py-2 border border-gray-250 dark:border-gray-650 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-800 dark:text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          🔄 Actualizar Bandeja
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center py-12 space-y-2">
        <div class="w-8 h-8 rounded-full border-2 border-azul-cope border-t-transparent animate-spin"></div>
        <p class="text-xs text-gray-450 dark:text-gray-500">Cargando bandeja de solicitudes...</p>
      </div>

      <div v-else-if="solicitudes.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500 italic text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        🎉 No hay solicitudes de apertura pendientes de revisión.
      </div>

      <div v-else class="overflow-x-auto border border-gray-150 dark:border-gray-700 rounded-2xl">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="p-3">Agencia</th>
              <th class="p-3">Caja</th>
              <th class="p-3">Cajero Solicitante</th>
              <th class="p-3 text-right">Monto Declarado</th>
              <th class="p-3 text-center">Firma Supervisor</th>
              <th class="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-sm">
            <tr v-for="sol in solicitudes" :key="sol.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-750/30 transition-colors">
              <td class="p-3 font-semibold text-gray-800 dark:text-gray-200">
                {{ sol.caja?.agencia?.nombre || 'N/A' }}
              </td>
              <td class="p-3 font-bold text-azul-cope dark:text-blue-450">
                {{ sol.caja?.nombre }}
              </td>
              <td class="p-3 text-gray-650 dark:text-gray-300">
                {{ sol.usuario?.name }}
              </td>
              <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(sol.monto_total) }}
              </td>
              <td class="p-3 text-center">
                <span v-if="sol.supervisor" class="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 rounded-full text-[10px] font-bold">
                  ✓ {{ sol.supervisor.name }} (Descuadre)
                </span>
                <span v-else class="text-gray-400 dark:text-gray-500 text-xs">-</span>
              </td>
              <td class="p-3 text-center">
                <button
                  @click="openComparadorModal(sol)"
                  class="px-4 py-1.5 bg-azul-cope hover:bg-azul-cope/90 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer"
                >
                  🔍 Auditar & Procesar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- COMPARADOR / MODAL DE AUTORIZACION -->
    <Transition name="fade">
      <div v-if="comparadorModalOpen && selectedSolicitud" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl border border-gray-250 dark:border-gray-700 shadow-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
          
          <!-- Header Modal -->
          <div class="flex justify-between items-start pb-4 border-b border-gray-150 dark:border-gray-750">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Auditoría de Apertura: {{ selectedSolicitud.caja?.nombre }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Solicitado por <span class="font-semibold">{{ selectedSolicitud.usuario?.name }}</span> • Monto Declarado: <span class="font-mono font-bold text-azul-cope">{{ formatCurrency(selectedSolicitud.monto_total) }}</span>
              </p>
            </div>
            <button @click="comparadorModalOpen = false" class="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 text-xl font-bold cursor-pointer">&times;</button>
          </div>

          <!-- Comparación de Cierre Anterior contra Declarado -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Desglose Físico por Denominación</h4>
            
            <div v-if="loadingDetalle" class="flex flex-col items-center py-12 space-y-2">
              <div class="w-8 h-8 rounded-full border-2 border-azul-cope border-t-transparent animate-spin"></div>
              <p class="text-xs text-gray-400">Consultando desgloses históricos...</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Billetes -->
              <div class="space-y-3">
                <h5 class="text-xs font-bold text-azul-cope uppercase tracking-wider">Billetes</h5>
                <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 font-bold text-gray-500 dark:text-gray-400 uppercase">
                        <th class="p-2.5">Denominación</th>
                        <th class="p-2.5 text-center">Saldo de cierre anterior</th>
                        <th class="p-2.5 text-center">Saldo Solicitado</th>
                        <th class="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-150 dark:divide-gray-750">
                      <tr v-for="denom in auditBilletes" :key="denom.id">
                        <td class="p-2.5 font-bold text-gray-900 dark:text-gray-100">{{ denom.nombre }}</td>
                        <td class="p-2.5 text-center font-mono text-gray-500">{{ denom.esperado }}</td>
                        <td class="p-2.5 text-center font-mono font-bold" :class="denom.declarado !== denom.esperado ? 'text-amber-600 bg-amber-50/50 dark:bg-amber-950/20' : 'text-gray-900 dark:text-white'">
                          {{ denom.declarado }}
                        </td>
                        <td class="p-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">{{ formatCurrency(denom.subtotal) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Monedas -->
              <div class="space-y-3">
                <h5 class="text-xs font-bold text-azul-cope uppercase tracking-wider">Monedas</h5>
                <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-gray-55 dark:bg-gray-900/80 border-b border-gray-150 dark:border-gray-700 font-bold text-gray-500 dark:text-gray-400 uppercase">
                        <th class="p-2.5">Denominación</th>
                        <th class="p-2.5 text-center">Saldo de cierre anterior</th>
                        <th class="p-2.5 text-center">Saldo Solicitado</th>
                        <th class="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-150 dark:divide-gray-750">
                      <tr v-for="denom in auditMonedas" :key="denom.id">
                        <td class="p-2.5 font-bold text-gray-900 dark:text-gray-100">{{ denom.nombre }}</td>
                        <td class="p-2.5 text-center font-mono text-gray-500">{{ denom.esperado }}</td>
                        <td class="p-2.5 text-center font-mono font-bold" :class="denom.declarado !== denom.esperado ? 'text-amber-600 bg-amber-50/50 dark:bg-amber-950/20' : 'text-gray-900 dark:text-white'">
                          {{ denom.declarado }}
                        </td>
                        <td class="p-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">{{ formatCurrency(denom.subtotal) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Comparador de Totales -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-150 dark:border-gray-750">
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl flex flex-col items-center">
              <span class="text-[10px] font-bold text-gray-450 uppercase mb-1">Saldo de cierre anterior</span>
              <span class="text-lg font-bold font-mono text-gray-900 dark:text-white">{{ formatCurrency(montoEsperado) }}</span>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-750 rounded-2xl flex flex-col items-center">
              <span class="text-[10px] font-bold text-gray-450 uppercase mb-1">Saldo Solicitado</span>
              <span class="text-lg font-bold font-mono text-azul-cope dark:text-blue-400">{{ formatCurrency(selectedSolicitud.monto_total) }}</span>
            </div>
            <div class="p-4 border rounded-2xl flex flex-col items-center justify-center" :class="diferencia === 0 ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900/35' : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/35'">
              <span class="text-[10px] font-bold uppercase mb-1" :class="diferencia === 0 ? 'text-green-700' : 'text-amber-700'">Diferencia contra ayer</span>
              <span class="text-lg font-extrabold font-mono" :class="diferencia === 0 ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'">
                {{ diferencia > 0 ? '+' : '' }}{{ formatCurrency(diferencia) }}
              </span>
            </div>
          </div>

          <!-- Observaciones / Feedback -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-gray-500 uppercase">Observaciones o Motivo de Rechazo</label>
            <textarea
              v-model="observaciones"
              rows="2"
              placeholder="Escribe observaciones adicionales para el cajero..."
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-gray-900 dark:text-white"
            ></textarea>
          </div>

          <!-- Acciones de Aprobación -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              @click="procesarSolicitud('rechazado')"
              :disabled="submitting"
              class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer disabled:opacity-40"
            >
              Rechazar Solicitud
            </button>
            <button
              @click="procesarSolicitud('aprobado')"
              :disabled="submitting"
              class="px-5 py-2.5 bg-verde-cope hover:bg-verde-cope/90 text-white font-bold rounded-xl text-xs shadow transition-all cursor-pointer disabled:opacity-40"
            >
              Aprobar Apertura
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

interface User {
  id: number
  name: string
}

interface Agencia {
  id: number
  nombre: string
}

interface Caja {
  id: number
  nombre: string
  agencia?: Agencia
}

interface SolicitudDetalle {
  id: number
  denominacion_id: number
  cantidad: number
  subtotal: number
  estado_dinero: 'bueno' | 'deteriorado'
  denominacion?: {
    id: number
    nombre: string
    valor: number
    tipo: 'billete' | 'moneda'
  }
}

interface SolicitudApertura {
  id: number
  caja_id: number
  caja?: Caja
  usuario?: User
  supervisor?: User
  monto_total: number
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  observaciones?: string
  detalles?: SolicitudDetalle[]
}

const solicitudes = ref<SolicitudApertura[]>([])
const loading = ref(false)
const submitting = ref(false)

const comparadorModalOpen = ref(false)
const selectedSolicitud = ref<SolicitudApertura | null>(null)
const loadingDetalle = ref(false)
const montoEsperado = ref(0.00)
const auditDenominaciones = ref<any[]>([])
const observaciones = ref('')

// Categorizar para el modal
const auditBilletes = computed(() => auditDenominaciones.value.filter(d => d.tipo === 'billete'))
const auditMonedas = computed(() => auditDenominaciones.value.filter(d => d.tipo === 'moneda'))

const diferencia = computed(() => {
  if (!selectedSolicitud.value) return 0
  return selectedSolicitud.value.monto_total - montoEsperado.value
})

const fetchSolicitudes = async () => {
  loading.value = true
  try {
    const res = await axios.get('/cajas/solicitudes/pendientes')
    solicitudes.value = res.data
  } catch (err) {
    console.error('Error al cargar bandeja de autorizaciones')
  } finally {
    loading.value = false
  }
}

const openComparadorModal = async (sol: SolicitudApertura) => {
  selectedSolicitud.value = sol
  comparadorModalOpen.value = true
  loadingDetalle.value = true
  observaciones.value = ''
  montoEsperado.value = 0.00
  auditDenominaciones.value = []

  try {
    // 1. Obtener el estado del cierre de ayer
    const cierreRes = await axios.get(`/cajas/${sol.caja_id}/estado-apertura`)
    const cierreInfo = cierreRes.data
    montoEsperado.value = cierreInfo.saldo_final_fisico_declarado

    // 2. Obtener denominaciones y la solicitud fresca con sus detalles
    const [denomsRes, solicitudesRes] = await Promise.all([
      axios.get('/denominaciones'),
      axios.get('/cajas/solicitudes/pendientes')
    ])
    
    const denoms = denomsRes.data.filter((d: any) => d.activo)
    
    // Encontrar la solicitud fresca con la relación detalles cargada
    const freshSol = solicitudesRes.data.find((s: any) => s.id === sol.id)
    if (freshSol) {
      selectedSolicitud.value = freshSol
    }

    // Llenar el audit list
    auditDenominaciones.value = denoms.map((d: any) => {
      // Buscar lo que declaró el cajero
      const detSol = selectedSolicitud.value?.detalles?.find((x: any) => x.denominacion_id === d.id && x.estado_dinero === 'bueno')
      const declaradoCant = detSol ? detSol.cantidad : 0

      // Buscar lo esperado en el cierre anterior
      const detCierre = cierreInfo.detalles?.find((x: any) => x.denominacion_id === d.id && x.estado_dinero === 'bueno')
      const esperadoCant = detCierre ? detCierre.cantidad : 0

      return {
        id: d.id,
        nombre: d.nombre,
        valor: d.valor,
        tipo: d.tipo,
        esperado: esperadoCant,
        declarado: declaradoCant,
        subtotal: d.valor * declaradoCant
      }
    })

  } catch (err) {
    console.error('Error al recuperar detalles de la auditoría')
  } finally {
    loadingDetalle.value = false
  }
}

const procesarSolicitud = async (accion: 'aprobado' | 'rechazado') => {
  if (!selectedSolicitud.value) return
  submitting.value = true

  try {
    await axios.post(`/cajas/solicitudes/${selectedSolicitud.value.id}/procesar`, {
      accion: accion,
      observaciones: observaciones.value
    })
    
    comparadorModalOpen.value = false
    fetchSolicitudes()
  } catch (err) {
    console.error('Error al procesar la solicitud')
  } finally {
    submitting.value = false
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

onMounted(() => {
  fetchSolicitudes()
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
