<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Card 1: Operaciones -->
    <div class="relative overflow-hidden bg-gradient-to-br from-azul-cope/95 to-[#0b2238] dark:from-gray-800 dark:to-gray-900 border border-white/10 dark:border-gray-700 rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
      <!-- Background decoration -->
      <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
      
      <div class="flex justify-between items-start">
        <div class="space-y-0.5">
          <p class="text-[9px] font-extrabold uppercase tracking-widest text-azul-cope/40 dark:text-gray-400">Panel Principal</p>
          <h3 class="text-base font-black tracking-tight text-white flex items-center gap-1.5">
            💼 Operaciones
          </h3>
        </div>
        <span class="p-1.5 bg-white/10 rounded-xl text-white">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>

      <div class="mt-3 space-y-2">
        <div class="flex justify-between items-baseline border-b border-white/5 pb-1">
          <span class="text-xs font-semibold text-white/70">Saldo Inicial:</span>
          <span class="font-mono text-xs font-bold text-white/90">{{ formatCurrency(saldoInicialOperaciones) }}</span>
        </div>
        <div class="flex justify-between items-baseline pt-0.5">
          <span class="text-xs font-semibold text-white/70">Disponible:</span>
          <span class="font-mono text-xl font-black text-emerald-455 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">{{ formatCurrency(saldoDisponibleOperaciones) }}</span>
        </div>
      </div>
    </div>

    <!-- Card 2: Cajillas -->
    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-[#1e1b4b] dark:from-gray-800 dark:to-gray-900 border border-white/10 dark:border-gray-700 rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
      <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>

      <div class="flex justify-between items-start">
        <div class="space-y-0.5">
          <p class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-300/40 dark:text-gray-400">Resguardo Especial</p>
          <h3 class="text-base font-black tracking-tight text-white flex items-center gap-1.5">
            🔑 Cajillas
          </h3>
        </div>
        <span class="p-1.5 bg-white/10 rounded-xl text-white">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </span>
      </div>

      <div class="mt-3 space-y-2">
        <div class="flex justify-between items-baseline border-b border-white/5 pb-1">
          <span class="text-xs font-semibold text-white/70">Saldo Inicial:</span>
          <span class="font-mono text-xs font-bold text-white/90">{{ formatCurrency(saldoInicialCajillas) }}</span>
        </div>
        <div class="flex justify-between items-baseline pt-0.5">
          <span class="text-xs font-semibold text-white/70">Disponible:</span>
          <span class="font-mono text-xl font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-400/20">{{ formatCurrency(saldoDisponibleCajillas) }}</span>
        </div>
      </div>
    </div>

    <!-- Card 3: Efectivo Deteriorado -->
    <div class="relative overflow-hidden bg-gradient-to-br from-amber-900 to-[#451a03] dark:from-gray-800 dark:to-gray-900 border border-white/10 dark:border-gray-700 rounded-2xl p-4 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">
      <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>

      <div class="flex justify-between items-start">
        <div class="space-y-0.5">
          <p class="text-[9px] font-extrabold uppercase tracking-widest text-amber-300/40 dark:text-gray-400">Merma Física</p>
          <h3 class="text-base font-black tracking-tight text-white flex items-center gap-1.5">
            🍂 Deteriorado
          </h3>
        </div>
        <span class="p-1.5 bg-white/10 rounded-xl text-white">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </span>
      </div>

      <div class="mt-3 space-y-2">
        <div class="flex justify-between items-baseline border-b border-white/5 pb-1">
          <span class="text-xs font-semibold text-white/70">Saldo Inicial:</span>
          <span class="font-mono text-xs font-bold text-white/90">{{ formatCurrency(saldoInicialDeteriorado) }}</span>
        </div>
        <div class="flex justify-between items-baseline pt-0.5">
          <span class="text-xs font-semibold text-white/70">Disponible:</span>
          <span class="font-mono text-xl font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-400/20">{{ formatCurrency(saldoDisponibleDeteriorado) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bovedaId: number | null
  billetes: any[]
  monedas: any[]
  matriz: Record<number, Record<number, any>>
  totalesCajillas: Record<number, any>
  totalesDeteriorados: Record<number, any>
  formatCurrency: (val: number) => string
}>()

// Helper calculations
const getSaldoInicialCantidad = (cajaId: number, denomId: number): number => {
  const row = props.matriz[cajaId]?.[denomId]
  return row ? row.saldo_inicial_cantidad : 0
}

const getSaldoDisponibleCantidad = (cajaId: number, denomId: number): number => {
  const row = props.matriz[cajaId]?.[denomId]
  if (!row) return 0
  return row.saldo_inicial_cantidad + row.ingresos_cantidad - row.egresos_cantidad
}

const saldoInicialOperaciones = computed(() => {
  if (!props.bovedaId) return 0
  let total = 0
  props.billetes.forEach(d => {
    total += getSaldoInicialCantidad(props.bovedaId!, d.id) * d.valor
  })
  props.monedas.forEach(d => {
    total += getSaldoInicialCantidad(props.bovedaId!, d.id) * d.valor
  })
  return total
})

const saldoDisponibleOperaciones = computed(() => {
  if (!props.bovedaId) return 0
  let total = 0
  props.billetes.forEach(d => {
    total += getSaldoDisponibleCantidad(props.bovedaId!, d.id) * d.valor
  })
  props.monedas.forEach(d => {
    total += getSaldoDisponibleCantidad(props.bovedaId!, d.id) * d.valor
  })
  return total
})

const saldoInicialCajillas = computed(() => {
  if (!props.bovedaId) return 0
  return Number(props.totalesCajillas[props.bovedaId]?.['saldo_inicial']) || 0
})

const saldoDisponibleCajillas = computed(() => {
  if (!props.bovedaId) return 0
  const ini = Number(props.totalesCajillas[props.bovedaId]?.['saldo_inicial']) || 0
  const ing = Number(props.totalesCajillas[props.bovedaId]?.['ingresos']) || 0
  const egr = Number(props.totalesCajillas[props.bovedaId]?.['egresos']) || 0
  return ini + ing - egr
})

const saldoInicialDeteriorado = computed(() => {
  if (!props.bovedaId) return 0
  return Number(props.totalesDeteriorados[props.bovedaId]?.['saldo_inicial']) || 0
})

const saldoDisponibleDeteriorado = computed(() => {
  if (!props.bovedaId) return 0
  const ini = Number(props.totalesDeteriorados[props.bovedaId]?.['saldo_inicial']) || 0
  const ing = Number(props.totalesDeteriorados[props.bovedaId]?.['ingresos']) || 0
  const egr = Number(props.totalesDeteriorados[props.bovedaId]?.['egresos']) || 0
  return ini + ing - egr
})
</script>
