<template>
  <Transition name="fade">
    <div v-if="isOpen && movimiento" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl border border-gray-250 dark:border-gray-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between shrink-0">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Desglose de Movimiento
              <span class="font-mono text-sm text-gray-400 dark:text-gray-500">#{{ String(movimiento.id).padStart(6, '0') }}</span>
            </h2>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Firma auditora inmutable registrada en el sistema</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-705 transition-all cursor-pointer"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 flex-1 min-h-0 overflow-y-auto space-y-6 custom-scrollbar">
          <!-- Metadata Grid -->
          <div class="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-750">
            <div>
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Caja Origen</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ movimiento.origen_caja?.nombre || 'Externo (Banco)' }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Caja Destino</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white">{{ movimiento.destino_caja?.nombre || 'Externo (Banco)' }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Categoría del Flujo</span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ formatCategoria(movimiento.categoria_movimiento) }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Fecha de Registro</span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ formatDateTime(movimiento.fecha_transaccion) }}</span>
            </div>
            <div class="col-span-2" v-if="movimiento.descripcion">
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Descripción / Bitácora</span>
              <p class="text-xs text-gray-600 dark:text-gray-350 italic">{{ movimiento.descripcion }}</p>
            </div>
          </div>

          <!-- Denomination Breakdown Table -->
          <div>
            <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Billetes y Monedas Trasladadas</h3>
            <div class="border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-100 dark:bg-gray-900 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-150 dark:border-gray-700">
                    <th class="p-3">Denominación</th>
                    <th class="p-3">Estado</th>
                    <th class="p-3 text-center">Cantidad</th>
                    <th class="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-150 dark:divide-gray-700 text-sm">
                  <tr v-for="det in movimiento.detalles" :key="det.id">
                    <td class="p-3 font-semibold text-gray-800 dark:text-gray-250">
                      {{ det.denominacion?.nombre || ('Q ' + formatNumber(det.denominacion?.valor || 0)) }} ({{ formatCurrency(det.denominacion?.valor) }})
                    </td>
                    <td class="p-3">
                      <span
                        v-if="det.estado_dinero === 'bueno'"
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30"
                      >
                        Buen estado
                      </span>
                      <span
                        v-else-if="det.estado_dinero === 'cajillas'"
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                      >
                        Cajillas (Tránsito)
                      </span>
                      <span
                        v-else
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30"
                      >
                        Deteriorado
                      </span>
                    </td>
                    <td class="p-3 text-center font-mono font-semibold text-gray-855 dark:text-gray-250">
                      {{ det.cantidad }}
                    </td>
                    <td class="p-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                      {{ formatCurrency(det.subtotal) }}
                    </td>
                  </tr>
                  <tr class="bg-gray-50 dark:bg-gray-900 font-bold border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <td colspan="3" class="p-3 text-right uppercase tracking-wider text-xs">Total Trasladado</td>
                    <td class="p-3 text-right font-mono text-base">{{ formatCurrency(movimiento.monto_total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-150 dark:border-gray-750 flex justify-end shrink-0">
          <button
            @click="$emit('close')"
            class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-800 dark:text-white font-semibold rounded-xl text-sm transition-all cursor-pointer"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  movimiento: any
}>()

defineEmits<{
  (e: 'close'): void
}>()

const formatCategoria = (cat: string) => {
  if (cat === 'billetes') return 'Billetes'
  if (cat === 'monedas') return 'Monedas'
  if (cat === 'cajilla') return 'Cajilla'
  if (cat === 'deteriorados') return 'Deteriorados'
  return cat
}

const formatCurrency = (val: number | undefined) => {
  if (val === undefined) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const formatNumber = (val: number) => {
  return Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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
