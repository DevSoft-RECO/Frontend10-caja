<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[85vh] transform transition-all duration-300 scale-100"
        @click.stop
      >
        <!-- Cabecera -->
        <div class="px-6 py-4 bg-gradient-to-r from-azul-cope to-azul-cope/90 text-white flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold">{{ title }}</h3>
            <p class="text-xs text-white/80 font-semibold uppercase tracking-wider mt-0.5">{{ cajaNombre }}</p>
          </div>
          <button 
            @click="close"
            class="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Contenido -->
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          <!-- Billetes -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Desglose de Billetes</h4>
            <div class="overflow-hidden border border-gray-150 dark:border-gray-700 rounded-2xl">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-150 dark:border-gray-700">
                    <th class="p-2.5 pl-4">Denominación</th>
                    <th class="p-2.5 text-center">Inicial</th>
                    <th class="p-2.5 text-center">Ingresos</th>
                    <th class="p-2.5 text-center">Egresos</th>
                    <th class="p-2.5 text-center pr-4">Disponible</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-750 text-xs font-semibold">
                  <tr v-for="d in billetes" :key="d.id" class="hover:bg-slate-50/50 dark:hover:bg-gray-750/30 transition-colors">
                    <td class="p-2.5 pl-4 font-bold text-gray-800 dark:text-gray-200">
                      {{ d.nombre || (d.tipo === 'billete' ? 'Billete Q' + d.valor : 'Moneda Q' + d.valor) }}
                    </td>
                    <td class="p-2.5 text-center font-mono text-gray-500">{{ getVal(d.id, 'inicial') }}</td>
                    <td class="p-2.5 text-center font-mono text-green-600 dark:text-green-400">+{{ getVal(d.id, 'ingresos') }}</td>
                    <td class="p-2.5 text-center font-mono text-red-600 dark:text-red-400">-{{ getVal(d.id, 'egresos') }}</td>
                    <td class="p-2.5 text-center font-mono font-bold text-gray-900 dark:text-white pr-4">{{ getVal(d.id, 'disponible') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Monedas -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">Desglose de Monedas</h4>
            <div class="overflow-hidden border border-gray-150 dark:border-gray-700 rounded-2xl">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-150 dark:border-gray-700">
                    <th class="p-2.5 pl-4">Denominación</th>
                    <th class="p-2.5 text-center">Inicial</th>
                    <th class="p-2.5 text-center">Ingresos</th>
                    <th class="p-2.5 text-center">Egresos</th>
                    <th class="p-2.5 text-center pr-4">Disponible</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-750 text-xs font-semibold">
                  <tr v-for="d in monedas" :key="d.id" class="hover:bg-slate-50/50 dark:hover:bg-gray-750/30 transition-colors">
                    <td class="p-2.5 pl-4 font-bold text-gray-800 dark:text-gray-200">
                      {{ d.nombre || (d.tipo === 'billete' ? 'Billete Q' + d.valor : 'Moneda Q' + d.valor) }}
                    </td>
                    <td class="p-2.5 text-center font-mono text-gray-500">{{ getVal(d.id, 'inicial') }}</td>
                    <td class="p-2.5 text-center font-mono text-green-600 dark:text-green-400">+{{ getVal(d.id, 'ingresos') }}</td>
                    <td class="p-2.5 text-center font-mono text-red-600 dark:text-red-400">-{{ getVal(d.id, 'egresos') }}</td>
                    <td class="p-2.5 text-center font-mono font-bold text-gray-900 dark:text-white pr-4">{{ getVal(d.id, 'disponible') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-150 dark:border-gray-700 flex justify-end">
          <button 
            @click="close"
            class="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-655 text-gray-800 dark:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
  cajaNombre: string
  cajaId: number | null
  denominaciones: Array<{ id: number; nombre: string; valor: number; tipo: 'billete' | 'moneda' }>
  matriz: Record<number, Record<number, any>>
  tipoInventario: 'cajillas' | 'deteriorado' // Identifica qué columnas mapear de la matriz
}>()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Clasificaciones de denominación
const billetes = computed(() => props.denominaciones.filter(d => d.tipo === 'billete'))
const monedas = computed(() => props.denominaciones.filter(d => d.tipo === 'moneda'))

// Función de mapeo dinámico del saldo de la matriz para cajillas o deteriorado
const getVal = (denomId: number, col: 'inicial' | 'ingresos' | 'egresos' | 'disponible'): number => {
  if (!props.cajaId) return 0
  const row = props.matriz[props.cajaId]?.[denomId]
  if (!row) return 0

  if (props.tipoInventario === 'cajillas') {
    switch (col) {
      case 'inicial': return Number(row.cajillas_inicial_cantidad) || 0
      case 'ingresos': return Number(row.cajillas_ingresos_cantidad) || 0
      case 'egresos': return Number(row.cajillas_egresos_cantidad) || 0
      case 'disponible': 
        return (Number(row.cajillas_inicial_cantidad) || 0) + 
               (Number(row.cajillas_ingresos_cantidad) || 0) - 
               (Number(row.cajillas_egresos_cantidad) || 0)
    }
  } else {
    // deteriorado
    switch (col) {
      case 'inicial': return Number(row.deteriorado_inicial_cantidad) || 0
      case 'ingresos': return Number(row.deteriorado_ingreso_cantidad) || 0
      case 'egresos': return Number(row.deteriorado_egreso_cantidad) || 0
      case 'disponible': 
        return (Number(row.deteriorado_inicial_cantidad) || 0) + 
               (Number(row.deteriorado_ingreso_cantidad) || 0) - 
               (Number(row.deteriorado_egreso_cantidad) || 0)
    }
  }
}
</script>
