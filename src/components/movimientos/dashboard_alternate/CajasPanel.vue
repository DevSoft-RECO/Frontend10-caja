<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
    <!-- Header -->
    <div class="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 dark:from-gray-900/50 dark:via-gray-800 dark:to-gray-900/50">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Detalle de Movimientos
          </h2>
          <p class="text-xs text-gray-550 dark:text-gray-400">Seleccione una caja o ventanilla para ver sus flujos</p>
        </div>
      </div>

      <!-- Selector de Caja / Ventanilla -->
      <div class="flex items-center gap-2 bg-slate-50 dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
        <label class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">Caja:</label>
        <select
          v-model="selectedCajaId"
          class="bg-transparent text-gray-900 dark:text-white focus:outline-none text-xs font-bold cursor-pointer transition-all border-none pr-6 dark:bg-gray-900"
        >
          <option class="dark:bg-gray-900" v-if="cajasGenerales.length > 0" :value="cajasGenerales[0].id">
            🏢 Caja General
          </option>
          <option class="dark:bg-gray-900" v-for="vent in ventanillas" :key="vent.id" :value="vent.id">
            🏪 {{ vent.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Contenido dinámico según categoría seleccionada -->
    <div class="p-6">
      <!-- 1. Si la categoría es Operaciones (Billetes y Monedas) -->
      <div v-if="category === 'operaciones'" class="space-y-6">
        <!-- Billetes -->
        <div>
          <h3 class="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest mb-3 pl-1">💵 Billetes</h3>
          <div class="overflow-x-auto border border-gray-150 dark:border-gray-700 rounded-2xl">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-150 dark:border-gray-700">
                  <th class="p-2.5 pl-4">Denominación</th>
                  <th class="p-2.5 text-center text-green-600 dark:text-green-455">Ingresos</th>
                  <th class="p-2.5 text-center text-red-500">Egresos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-750 text-xs font-semibold">
                <tr v-for="d in billetes" :key="d.id" class="hover:bg-slate-50/50 dark:hover:bg-gray-750/30 transition-colors">
                  <td class="p-2.5 pl-4 font-bold text-gray-800 dark:text-gray-200">
                    {{ d.nombre }}
                  </td>
                  <td class="p-2.5 text-center font-mono text-gray-550 dark:text-gray-400">
                    {{ getCantidadMatriz(selectedCajaId, d.id, 'ingresos') }}
                  </td>
                  <td class="p-2.5 text-center font-mono text-gray-555 dark:text-gray-400">
                    {{ getCantidadMatriz(selectedCajaId, d.id, 'egresos') }}
                  </td>
                </tr>
                <!-- Fila Total Billetes -->
                <tr class="bg-gray-50/30 dark:bg-slate-900/30 font-bold text-gray-900 dark:text-white">
                  <td class="p-2.5 pl-4 uppercase tracking-wider text-[10px]">Total Billetes</td>
                  <td class="p-2.5 text-center font-mono text-green-600 dark:text-green-455">
                    {{ formatCurrency(getBilletesMontoCaja(selectedCajaId, 'ingresos')) }}
                  </td>
                  <td class="p-2.5 text-center font-mono text-red-500">
                    {{ formatCurrency(getBilletesMontoCaja(selectedCajaId, 'egresos')) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Monedas -->
        <div>
          <h3 class="text-xs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-widest mb-3 pl-1">🪙 Monedas</h3>
          <div class="overflow-x-auto border border-gray-150 dark:border-gray-700 rounded-2xl">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-150 dark:border-gray-700">
                  <th class="p-2.5 pl-4">Denominación</th>
                  <th class="p-2.5 text-center text-green-600 dark:text-green-455">Ingresos</th>
                  <th class="p-2.5 text-center text-red-500">Egresos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-750 text-xs font-semibold">
                <tr v-for="d in monedas" :key="d.id" class="hover:bg-slate-50/50 dark:hover:bg-gray-750/30 transition-colors">
                  <td class="p-2.5 pl-4 font-bold text-gray-800 dark:text-gray-200">
                    {{ d.nombre }}
                  </td>
                  <td class="p-2.5 text-center font-mono text-gray-550 dark:text-gray-400">
                    {{ getCantidadMatriz(selectedCajaId, d.id, 'ingresos') }}
                  </td>
                  <td class="p-2.5 text-center font-mono text-gray-555 dark:text-gray-400">
                    {{ getCantidadMatriz(selectedCajaId, d.id, 'egresos') }}
                  </td>
                </tr>
                <!-- Fila Total Monedas -->
                <tr class="bg-gray-50/30 dark:bg-slate-900/30 font-bold text-gray-900 dark:text-white">
                  <td class="p-2.5 pl-4 uppercase tracking-wider text-[10px]">Total Monedas</td>
                  <td class="p-2.5 text-center font-mono text-green-600 dark:text-green-455">
                    {{ formatCurrency(getMonedasMontoCaja(selectedCajaId, 'ingresos')) }}
                  </td>
                  <td class="p-2.5 text-center font-mono text-red-500">
                    {{ formatCurrency(getMonedasMontoCaja(selectedCajaId, 'egresos')) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 2. Si la categoría es Cajillas -->
      <div v-else-if="category === 'cajillas'" class="space-y-4">
        <div class="p-6 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 class="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              🔑 Cajillas (Aperturas / Cierres)
            </h4>
            <p class="text-xs text-indigo-750 dark:text-indigo-400 mt-1">
              Flujos consolidados de cajillas de seguridad en el día.
            </p>
          </div>
          <div class="flex gap-4">
            <div class="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-xs border border-indigo-100 dark:border-indigo-900/30">
              <span class="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-550">Ingresos</span>
              <span class="font-mono text-sm font-bold text-green-600 dark:text-green-400">
                {{ formatCurrency(getCajillasMonto(selectedCajaId, 'ingresos')) }}
              </span>
            </div>
            <div class="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-xs border border-indigo-100 dark:border-indigo-900/30">
              <span class="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-555">Egresos</span>
              <span class="font-mono text-sm font-bold text-red-600 dark:text-red-400">
                {{ formatCurrency(getCajillasMonto(selectedCajaId, 'egresos')) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Si la categoría es Deteriorado -->
      <div v-else-if="category === 'deteriorado'" class="space-y-4">
        <div class="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 class="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              🍂 Efectivo Deteriorado
            </h4>
            <p class="text-xs text-amber-750 dark:text-amber-400 mt-1">
              Efectivo en mal estado o fuera de circulación física.
            </p>
          </div>
          <div class="flex gap-4">
            <div class="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-xs border border-amber-100 dark:border-amber-900/30">
              <span class="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-550">Ingresos</span>
              <span class="font-mono text-sm font-bold text-green-600 dark:text-green-400">
                {{ formatCurrency(getDeterioradosMonto(selectedCajaId, 'ingresos')) }}
              </span>
            </div>
            <div class="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-xs border border-amber-100 dark:border-amber-900/30">
              <span class="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-555">Egresos</span>
              <span class="font-mono text-sm font-bold text-red-600 dark:text-red-400">
                {{ formatCurrency(getDeterioradosMonto(selectedCajaId, 'egresos')) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila de Total General Caja Seleccionada -->
      <div class="mt-6 pt-4 border-t border-gray-250 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-2xl">
        <span class="text-xs font-black uppercase text-gray-600 dark:text-gray-400 tracking-wider">Total Caja Seleccionada</span>
        <div class="flex gap-6 font-mono text-xs font-black">
          <span class="text-green-600 dark:text-green-400">
            Ingresos: {{ formatCurrency(getTotalMontoCaja(selectedCajaId, 'ingresos')) }}
          </span>
          <span class="text-red-600 dark:text-red-400">
            Egresos: {{ formatCurrency(getTotalMontoCaja(selectedCajaId, 'egresos')) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  cajasGenerales: any[]
  ventanillas: any[]
  billetes: any[]
  monedas: any[]
  matriz: Record<number, Record<number, any>>
  totalesCajillas: Record<number, any>
  totalesDeteriorados: Record<number, any>
  category: 'operaciones' | 'cajillas' | 'deteriorado'
  formatCurrency: (val: number) => string
}>()

const selectedCajaId = ref<number | null>(null)

// Initialize default selected caja
const initSelectedCaja = () => {
  if (props.cajasGenerales.length > 0) {
    selectedCajaId.value = props.cajasGenerales[0].id
  } else if (props.ventanillas.length > 0) {
    selectedCajaId.value = props.ventanillas[0].id
  }
}

initSelectedCaja()

// Watch ventanillas or cajasGenerales changes to reset selected ID if it doesn't exist
watch(() => [props.cajasGenerales, props.ventanillas], () => {
  const allCajas = [...props.cajasGenerales, ...props.ventanillas]
  const exists = allCajas.some(c => c.id === selectedCajaId.value)
  if (!exists) {
    initSelectedCaja()
  }
}, { deep: true })

// Helper functions for data lookup
const getCantidadMatriz = (cajaId: number | null, denomId: number, tipo: 'ingresos' | 'egresos'): number => {
  if (!cajaId) return 0
  const row = props.matriz[cajaId]?.[denomId]
  if (!row) return 0
  return tipo === 'ingresos' ? row.ingresos_cantidad : row.egresos_cantidad
}

const getBilletesMontoCaja = (cajaId: number | null, tipo: 'ingresos' | 'egresos'): number => {
  if (!cajaId) return 0
  let total = 0
  props.billetes.forEach(d => {
    const row = props.matriz[cajaId]?.[d.id]
    if (row) {
      total += tipo === 'ingresos' ? Number(row.ingresos_monto) : Number(row.egresos_monto)
    }
  })
  return total
}

const getMonedasMontoCaja = (cajaId: number | null, tipo: 'ingresos' | 'egresos'): number => {
  if (!cajaId) return 0
  let total = 0
  props.monedas.forEach(d => {
    const row = props.matriz[cajaId]?.[d.id]
    if (row) {
      total += tipo === 'ingresos' ? Number(row.ingresos_monto) : Number(row.egresos_monto)
    }
  })
  return total
}

const getCajillasMonto = (cajaId: number | null, tipo: 'ingresos' | 'egresos'): number => {
  if (!cajaId) return 0
  return Number(props.totalesCajillas[cajaId]?.[tipo]) || 0
}

const getDeterioradosMonto = (cajaId: number | null, tipo: 'ingresos' | 'egresos'): number => {
  if (!cajaId) return 0
  return Number(props.totalesDeteriorados[cajaId]?.[tipo]) || 0
}

const getTotalMontoCaja = (cajaId: number | null, tipo: 'ingresos' | 'egresos'): number => {
  if (!cajaId) return 0
  let total = 0
  props.billetes.forEach(d => {
    const row = props.matriz[cajaId]?.[d.id]
    if (row) {
      total += tipo === 'ingresos' ? Number(row.ingresos_monto) : Number(row.egresos_monto)
    }
  })
  props.monedas.forEach(d => {
    const row = props.matriz[cajaId]?.[d.id]
    if (row) {
      total += tipo === 'ingresos' ? Number(row.ingresos_monto) : Number(row.egresos_monto)
    }
  })
  total += getCajillasMonto(cajaId, tipo)
  total += getDeterioradosMonto(cajaId, tipo)
  return total
}
</script>
