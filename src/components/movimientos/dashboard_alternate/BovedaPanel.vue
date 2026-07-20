<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
    <!-- Header Panel -->
    <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 dark:from-gray-900/50 dark:via-gray-800 dark:to-gray-900/50">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-azul-cope/10 text-azul-cope rounded-xl">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Bóveda Principal
            <span class="text-xs font-normal text-gray-500 dark:text-gray-400">({{ bovedaNombre }})</span>
          </h2>
          <p class="text-xs text-gray-550 dark:text-gray-400">Flujos físicos y arqueo detallado de Bóveda</p>
        </div>
      </div>

      <!-- Dropdown selector de categoría -->
      <div class="flex items-center gap-2 bg-slate-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
        <label class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">Ver categoría:</label>
        <select
          v-model="localCategory"
          @change="$emit('category-change', localCategory)"
          class="bg-transparent text-gray-900 dark:text-white focus:outline-none text-xs font-bold cursor-pointer transition-all border-none pr-6 dark:bg-gray-900"
        >
          <option class="dark:bg-gray-900" value="operaciones">💼 Operaciones</option>
          <option class="dark:bg-gray-900" value="cajillas">🔑 Cajillas</option>
          <option class="dark:bg-gray-900" value="deteriorado">🍂 Efectivo Deteriorado</option>
        </select>
      </div>
    </div>

    <!-- Table Section -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr class="bg-gray-50/80 dark:bg-gray-950 text-[10px] font-black text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 uppercase tracking-wider select-none">
            <th class="p-3 pl-6">Denominación</th>
            <th class="p-3 text-center">Cant. Inicial</th>
            <th class="p-3 text-center text-green-600 dark:text-green-455">Cant. Ingresos</th>
            <th class="p-3 text-center text-red-500">Cant. Egresos</th>
            <th class="p-3 text-center text-azul-cope font-bold bg-slate-50/50 dark:bg-slate-900/30">Cant. Disponible</th>
            <th class="p-3 text-right pr-6 bg-slate-100/50 dark:bg-slate-900/60 font-bold">Monto Disponible</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium">
          <!-- Billetes Header -->
          <tr class="bg-slate-50 dark:bg-gray-900 text-xs font-extrabold text-slate-700 dark:text-slate-300 border-y border-gray-200 dark:border-gray-700 select-none">
            <td colspan="6" class="p-3 pl-6 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors" @click="colapsarBilletes = !colapsarBilletes">
              <span class="flex items-center justify-between">
                <span>💵 Billetes</span>
                <span class="text-xs text-gray-400 font-bold transition-transform duration-300" :class="colapsarBilletes ? 'rotate-180' : ''">▲</span>
              </span>
            </td>
          </tr>

          <!-- Billetes Rows -->
          <tr
            v-for="denom in billetes"
            :key="denom.id"
            v-show="!colapsarBilletes"
            class="hover:bg-slate-50/40 dark:hover:bg-gray-750/30 transition-colors"
          >
            <td class="p-3 pl-6 border-r border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
              <div class="flex items-center justify-between">
                <span>{{ denom.nombre }}</span>
                <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {{ formatCurrency(denom.valor) }}
                </span>
              </div>
            </td>
            <td class="p-2 text-center font-mono text-gray-550 dark:text-gray-400">
              {{ getVal(denom.id, 'inicial') }}
            </td>
            <td class="p-2 text-center font-mono text-green-600 dark:text-green-455">
              +{{ getVal(denom.id, 'ingresos') }}
            </td>
            <td class="p-2 text-center font-mono text-red-500">
              -{{ getVal(denom.id, 'egresos') }}
            </td>
            <td class="p-2 text-center font-mono font-bold text-slate-850 dark:text-slate-150 bg-slate-55/40 dark:bg-slate-900/10">
              {{ getVal(denom.id, 'disponible') }}
            </td>
            <td class="p-2 text-right pr-6 font-mono font-bold text-slate-950 dark:text-white bg-slate-100/30 dark:bg-slate-900/20">
              {{ formatCurrency(getVal(denom.id, 'disponible') * denom.valor) }}
            </td>
          </tr>

          <!-- Total Billetes Row -->
          <tr class="bg-gray-50/30 dark:bg-slate-900/30 font-bold text-gray-950 dark:text-white border-t border-gray-300 dark:border-gray-700 text-xs">
            <td class="p-3 pl-6 uppercase tracking-wider text-gray-700 dark:text-gray-400">Total Billetes</td>
            <td class="p-2 text-center font-mono text-gray-700 dark:text-gray-400">-</td>
            <td class="p-2 text-center font-mono text-green-600 dark:text-green-455">-</td>
            <td class="p-2 text-center font-mono text-red-555">-</td>
            <td class="p-2 text-center font-mono text-slate-900 dark:text-white bg-slate-55/40 dark:bg-slate-900/20">-</td>
            <td class="p-2 text-right pr-6 font-mono text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-900/40 font-black">
              {{ formatCurrency(totalMontoBilletes) }}
            </td>
          </tr>

          <!-- Monedas Header -->
          <tr class="bg-slate-50 dark:bg-gray-900 text-xs font-extrabold text-slate-700 dark:text-slate-300 border-y border-gray-200 dark:border-gray-700 select-none">
            <td colspan="6" class="p-3 pl-6 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors" @click="colapsarMonedas = !colapsarMonedas">
              <span class="flex items-center justify-between">
                <span>🪙 Monedas</span>
                <span class="text-xs text-gray-400 font-bold transition-transform duration-300" :class="colapsarMonedas ? 'rotate-180' : ''">▲</span>
              </span>
            </td>
          </tr>

          <!-- Monedas Rows -->
          <tr
            v-for="denom in monedas"
            :key="denom.id"
            v-show="!colapsarMonedas"
            class="hover:bg-slate-50/40 dark:hover:bg-gray-750/30 transition-colors"
          >
            <td class="p-3 pl-6 border-r border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
              <div class="flex items-center justify-between">
                <span>{{ denom.nombre }}</span>
                <span class="text-[10px] font-semibold text-gray-400 dark:text-gray-550 font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {{ formatCurrency(denom.valor) }}
                </span>
              </div>
            </td>
            <td class="p-2 text-center font-mono text-gray-550 dark:text-gray-400">
              {{ getVal(denom.id, 'inicial') }}
            </td>
            <td class="p-2 text-center font-mono text-green-600 dark:text-green-455">
              +{{ getVal(denom.id, 'ingresos') }}
            </td>
            <td class="p-2 text-center font-mono text-red-500">
              -{{ getVal(denom.id, 'egresos') }}
            </td>
            <td class="p-2 text-center font-mono font-bold text-slate-850 dark:text-slate-150 bg-slate-55/40 dark:bg-slate-900/10">
              {{ getVal(denom.id, 'disponible') }}
            </td>
            <td class="p-2 text-right pr-6 font-mono font-bold text-slate-950 dark:text-white bg-slate-100/30 dark:bg-slate-900/20">
              {{ formatCurrency(getVal(denom.id, 'disponible') * denom.valor) }}
            </td>
          </tr>

          <!-- Total Monedas Row -->
          <tr class="bg-gray-50/30 dark:bg-slate-900/30 font-bold text-gray-955 dark:text-white border-t border-gray-300 dark:border-gray-700 text-xs">
            <td class="p-3 pl-6 uppercase tracking-wider text-gray-700 dark:text-gray-450">Total Monedas</td>
            <td class="p-2 text-center font-mono text-gray-700 dark:text-gray-450">-</td>
            <td class="p-2 text-center font-mono text-green-600 dark:text-green-455">-</td>
            <td class="p-2 text-center font-mono text-red-555">-</td>
            <td class="p-2 text-center font-mono text-slate-900 dark:text-white bg-slate-55/40 dark:bg-slate-900/20">-</td>
            <td class="p-2 text-right pr-6 font-mono text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-900/40 font-black">
              {{ formatCurrency(totalMontoMonedas) }}
            </td>
          </tr>

          <!-- Total General Bóveda Row -->
          <tr class="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-gray-900 dark:to-gray-850 font-black border-t-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-xs select-none">
            <td class="p-4 pl-6 text-sm uppercase tracking-wide">Total General Bóveda</td>
            <td class="p-2 text-center font-mono">-</td>
            <td class="p-2 text-center font-mono">-</td>
            <td class="p-2 text-center font-mono">-</td>
            <td class="p-2 text-center font-mono">-</td>
            <td class="p-2 text-right pr-6 font-mono text-azul-cope dark:text-emerald-400 text-sm font-extrabold">
              {{ formatCurrency(totalMontoBoveda) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  bovedaId: number | null
  bovedaNombre: string
  billetes: any[]
  monedas: any[]
  matriz: Record<number, Record<number, any>>
  category: 'operaciones' | 'cajillas' | 'deteriorado'
  formatCurrency: (val: number) => string
}>()

const emit = defineEmits(['category-change'])

const localCategory = ref(props.category)
watch(() => props.category, (newVal) => {
  localCategory.value = newVal
})

const colapsarBilletes = ref(false)
const colapsarMonedas = ref(false)

// Mapeo dinámico del valor por celda según la categoría
const getVal = (denomId: number, col: 'inicial' | 'ingresos' | 'egresos' | 'disponible'): number => {
  if (!props.bovedaId) return 0
  const row = props.matriz[props.bovedaId]?.[denomId]
  if (!row) return 0

  if (localCategory.value === 'cajillas') {
    switch (col) {
      case 'inicial': return Number(row.cajillas_inicial_cantidad) || 0
      case 'ingresos': return Number(row.cajillas_ingresos_cantidad) || 0
      case 'egresos': return Number(row.cajillas_egresos_cantidad) || 0
      case 'disponible': 
        return (Number(row.cajillas_inicial_cantidad) || 0) + 
               (Number(row.cajillas_ingresos_cantidad) || 0) - 
               (Number(row.cajillas_egresos_cantidad) || 0)
    }
  } else if (localCategory.value === 'deteriorado') {
    switch (col) {
      case 'inicial': return Number(row.deteriorado_inicial_cantidad) || 0
      case 'ingresos': return Number(row.deteriorado_ingreso_cantidad) || 0
      case 'egresos': return Number(row.deteriorado_egreso_cantidad) || 0
      case 'disponible': 
        return (Number(row.deteriorado_inicial_cantidad) || 0) + 
               (Number(row.deteriorado_ingreso_cantidad) || 0) - 
               (Number(row.deteriorado_egreso_cantidad) || 0)
    }
  } else {
    // operaciones
    switch (col) {
      case 'inicial': return Number(row.saldo_inicial_cantidad) || 0
      case 'ingresos': return Number(row.ingresos_cantidad) || 0
      case 'egresos': return Number(row.egresos_cantidad) || 0
      case 'disponible': 
        return (Number(row.saldo_inicial_cantidad) || 0) + 
               (Number(row.ingresos_cantidad) || 0) - 
               (Number(row.egresos_cantidad) || 0)
    }
  }
}

// Totales de la Bóveda
const totalMontoBilletes = computed(() => {
  let total = 0
  props.billetes.forEach(d => {
    total += getVal(d.id, 'disponible') * d.valor
  })
  return total
})

const totalMontoMonedas = computed(() => {
  let total = 0
  props.monedas.forEach(d => {
    total += getVal(d.id, 'disponible') * d.valor
  })
  return total
})

const totalMontoBoveda = computed(() => {
  return totalMontoBilletes.value + totalMontoMonedas.value
})
</script>
