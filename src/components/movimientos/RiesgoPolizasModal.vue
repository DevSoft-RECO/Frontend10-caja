<template>
  <Transition
    enter-active-class="transition duration-250 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 class="text-base font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              Estado de Pólizas - Todas las Agencias
            </h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Listado consolidado de agencias con su respectivo consumo de póliza de seguridad.
            </p>
          </div>
          <button @click="$emit('close')" class="text-gray-400 dark:text-gray-500 hover:text-gray-650 dark:hover:text-white transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search and Filter -->
        <div class="p-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-3">
          <div class="relative w-72">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar agencia por nombre..."
              class="block w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-xs font-semibold transition-all"
            />
          </div>
        </div>

        <!-- Table Body -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="paginatedAgencias.length === 0" class="py-16 text-center text-xs text-gray-400 font-medium">
            No se encontraron registros que coincidan con la búsqueda.
          </div>
          <table v-else class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-150 dark:border-gray-750 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th class="p-4">Ránking</th>
                <th class="p-4">Agencia</th>
                <th class="p-4 text-right">Saldo Disponible</th>
                <th class="p-4 text-right">Límite de Póliza</th>
                <th class="p-4 text-center">Consumo</th>
                <th class="p-4 text-center">Nivel de Riesgo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150 dark:divide-gray-750 text-gray-750 dark:text-gray-300">
              <tr v-for="(agencia, idx) in paginatedAgencias" :key="agencia.id" class="hover:bg-gray-55/50 dark:hover:bg-gray-750/30 transition-colors">
                <td class="p-4 font-mono font-bold">
                  #{{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                </td>
                <td class="p-4">
                  <div class="font-bold text-gray-900 dark:text-white text-sm">
                    {{ agencia.nombre }}
                  </div>
                </td>
                <td class="p-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(agencia.saldo_disponible) }}
                </td>
                <td class="p-4 text-right font-mono font-semibold text-gray-600 dark:text-gray-400">
                  {{ formatCurrency(agencia.poliza_limite) }}
                </td>
                <td class="p-4 text-center">
                  <div class="w-32 mx-auto flex items-center gap-2">
                    <div class="flex-1 h-1.5 bg-gray-100 dark:bg-gray-750 rounded-full overflow-hidden relative">
                      <div
                        class="h-full rounded-full"
                        :class="
                          agencia.porcentaje_poliza >= 90
                            ? 'bg-red-500'
                            : agencia.porcentaje_poliza >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        "
                        :style="{ width: `${Math.min(agencia.porcentaje_poliza, 100)}%` }"
                      ></div>
                    </div>
                    <span class="font-mono font-bold text-[10px] min-w-[34px] text-right">
                      {{ (agencia.porcentaje_poliza || 0).toFixed(1) }}%
                    </span>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    :class="
                      agencia.porcentaje_poliza >= 90
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                        : agencia.porcentaje_poliza >= 75
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20 dark:text-emerald-450'
                    "
                  >
                    {{ agencia.porcentaje_poliza >= 90 ? 'Crítico' : agencia.porcentaje_poliza >= 75 ? 'Advertencia' : 'Seguro' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-150 dark:border-gray-700 flex items-center justify-between">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Mostrando <span class="font-extrabold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> - <span class="font-extrabold">{{ Math.min(currentPage * itemsPerPage, filteredAgencias.length) }}</span> de <span class="font-extrabold">{{ filteredAgencias.length }}</span> agencias
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Anterior
            </button>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  agencias: any[]
}>()

defineEmits<{
  (e: 'close'): void
}>()

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

const filteredAgencias = computed(() => {
  return props.agencias.filter(a =>
    a.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredAgencias.value.length / itemsPerPage)
})

const paginatedAgencias = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAgencias.value.slice(start, start + itemsPerPage)
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined) return 'Q0.00'
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}
</script>
