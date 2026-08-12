<template>
  <div class="p-6 w-full space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Buzón de Tesorería
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Asigna las peticiones de efectivo entrantes a las agencias proveedoras con mayor liquidez.
        </p>
      </div>
    </div>

    <div v-if="successMsg" class="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-bold flex items-center gap-2">
      <span>✅</span> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-center gap-2">
      <span>⚠️</span> {{ errorMsg }}
    </div>

    <div v-if="loadingList" class="flex justify-center py-20"><div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>
    
    <div v-else-if="trasladosList.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-250 text-gray-450 italic text-sm">
      No hay peticiones de efectivo pendientes de asignación.
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="t in trasladosList" :key="t.id" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-mono font-bold text-gray-400 block mb-1">PETICIÓN #{{ t.id }}</span>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t.destino_boveda?.agencia?.nombre }}</h3>
            <p class="text-xs text-gray-500">{{ t.destino_boveda?.nombre }}</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-gray-500 block">Monto Solicitado</span>
            <span class="text-xl font-black text-purple-600 font-mono">{{ formatCurrency(t.monto_total) }}</span>
          </div>
        </div>

        <div v-if="t.comentario_peticion" class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-sm italic text-gray-600">
          "{{ t.comentario_peticion }}"
        </div>

        <div class="border-t border-gray-150 dark:border-gray-750 pt-4">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Asignar Agencia Proveedora</label>
          <div class="flex gap-2">
            <select
              v-model="asignaciones[t.id]"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold"
            >
              <option :value="null" disabled>Seleccionar Agencia...</option>
              <option v-for="caja in bovedasDisponibles" :key="caja.id" :value="caja.id" :disabled="caja.id === t.destino_boveda_id">
                {{ caja.nombre }} ({{ caja.agencia?.nombre }})
              </option>
            </select>
            <button
              @click="asignarAgencia(t.id)"
              :disabled="!asignaciones[t.id]"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
            >
              Asignar
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

const loadingList = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const trasladosList = ref<any[]>([])
const cajasList = ref<any[]>([])
const asignaciones = ref<Record<number, number | null>>({})

const bovedasDisponibles = computed(() => {
  return cajasList.value.filter(c => c.tipo_caja === 'boveda')
})

const formatCurrency = (val: number) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)

const fetchInitialData = async () => {
  try {
    const res = await axios.get('/cajas')
    cajasList.value = res.data
  } catch (error) {}
}

const fetchTraslados = async () => {
  loadingList.value = true
  try {
    const res = await axios.get('/cajas/peticiones-efectivo/tesoreria')
    trasladosList.value = res.data
    // Inicializar asignaciones
    res.data.forEach((t: any) => {
      if (!(t.id in asignaciones.value)) asignaciones.value[t.id] = null
    })
  } catch (error) {} finally { loadingList.value = false }
}

const asignarAgencia = async (id: number) => {
  const bovedaOrigenId = asignaciones.value[id]
  if (!bovedaOrigenId) return
  errorMsg.value = ''; successMsg.value = ''
  try {
    await axios.post(`/cajas/peticiones-efectivo/${id}/asignar-agencia`, {
      boveda_origen_id: bovedaOrigenId
    })
    successMsg.value = `Petición #${id} asignada exitosamente.`
    fetchTraslados()
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Error al asignar agencia'
  }
}

onMounted(() => {
  fetchInitialData()
  fetchTraslados()
})
</script>
