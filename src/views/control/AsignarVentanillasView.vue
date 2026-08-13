<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Asignar Ventanillas
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Asigna los responsables de las ventanillas para la operativa diaria.
        </p>
      </div>
    </div>

    <!-- Filtros y Barra de Búsqueda -->
    <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div class="relative w-full sm:w-64">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar ventanilla..."
            class="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-650 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm transition-all"
          />
        </div>
      </div>
      <div class="text-xs text-gray-550 dark:text-gray-400">
        Mostrando <span class="font-bold text-gray-850 dark:text-white">{{ filteredVentanillas.length }}</span> ventanillas
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
      </div>
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Cargando ventanillas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-5 flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
      <div class="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h3 class="text-sm font-bold text-red-800 dark:text-red-300">Error al cargar datos</h3>
        <p class="text-xs text-red-700 dark:text-red-400 mt-1">{{ error }}</p>
        <button
          @click="fetchData"
          class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-800 dark:text-red-300 hover:underline cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
          </svg>
          Reintentar
        </button>
      </div>
    </div>

    <!-- GRID VIEW -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="caja in filteredVentanillas"
        :key="caja.id"
        class="group relative bg-white dark:bg-gray-800 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        :class="[
          caja.estado ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200/50 dark:border-gray-800/50 opacity-70',
          !caja.usuario_en_turno && caja.estado ? 'ring-2 ring-red-400 dark:ring-red-500 shadow-red-100 dark:shadow-red-900/20' : ''
        ]"
      >
        <div v-if="!caja.usuario_en_turno && caja.estado" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span class="flex h-6 items-center px-3 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md shadow-red-500/30 animate-pulse whitespace-nowrap">
            Asignación Pendiente
          </span>
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-250 dark:border-emerald-800/30">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Ventanilla
            </span>
            <span
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="caja.estado ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="caja.estado ? 'bg-green-500 animate-pulse' : 'bg-red-500'"></span>
              {{ caja.estado ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <div>
            <h3 class="text-xl font-black text-gray-900 dark:text-white group-hover:text-azul-cope dark:group-hover:text-white transition-colors duration-200">
              {{ caja.nombre }}
            </h3>
            <div class="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ caja.agencia?.nombre || 'Sin Agencia' }}</span>
            </div>
          </div>

          <!-- Cajero en Turno Section -->
          <div class="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border flex flex-col justify-between"
               :class="!caja.usuario_en_turno ? 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-150 dark:border-gray-750'">
            <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Cajero en Turno</span>
            
            <div v-if="caja.usuario_en_turno" class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                <img v-if="caja.usuario_en_turno.avatar" :src="getAvatarUrl(caja.usuario_en_turno.avatar)" class="w-full h-full object-cover" alt="Avatar" />
                <div v-else class="w-full h-full bg-azul-cope/10 dark:bg-azul-cope/20 text-azul-cope dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  {{ caja.usuario_en_turno.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="overflow-hidden">
                <div class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ caja.usuario_en_turno.name }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500 truncate">@{{ caja.usuario_en_turno.username }}</div>
              </div>
            </div>
            
            <div v-else class="flex flex-col items-center justify-center py-4 border border-dashed border-red-300 dark:border-red-700/50 rounded-lg text-center bg-white dark:bg-gray-800">
              <span class="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Sin Asignar</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 mb-3">Esta ventanilla requiere un cajero</span>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <button
            @click="openAssignModal(caja)"
            class="w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            :class="!caja.usuario_en_turno 
              ? 'bg-verde-cope hover:bg-verde-cope/90 text-white shadow-verde-cope/30 hover:shadow-md'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 hover:text-azul-cope dark:hover:text-blue-400'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {{ !caja.usuario_en_turno ? 'Asignar Cajero Ahora' : 'Reasignar Cajero' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE ASIGNACIÓN -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isAssignModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">
              Asignar Responsable
            </h3>
            <button @click="closeAssignModal" class="text-gray-400 dark:text-gray-550 hover:text-gray-650 dark:hover:text-white transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveAssignUser" class="p-6 space-y-4">
            <div class="text-sm text-gray-600 dark:text-gray-300">
              Ventanilla: <span class="font-bold text-gray-905 dark:text-white">{{ activeCaja?.nombre }}</span>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Usuario Cajero</label>
              
              <div v-if="loadingUsers" class="py-2 text-sm text-gray-500 animate-pulse">Cargando usuarios...</div>
              <div class="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                <!-- Opción Ninguno -->
                <label class="flex items-center p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-750"
                       :class="assignForm.usuario_id === null ? 'border-azul-cope bg-azul-cope/5 dark:bg-azul-cope/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'">
                  <input type="radio" :value="null" v-model="assignForm.usuario_id" class="hidden" />
                  <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mr-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">Desasignar / Ninguno</span>
                    <span class="text-xs text-gray-500">Dejar ventanilla vacía</span>
                  </div>
                  <div v-if="assignForm.usuario_id === null" class="ml-auto text-azul-cope">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </label>

                <!-- Usuarios -->
                <label v-for="user in usuariosAgencia" :key="user.id" 
                       class="flex items-center p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-750"
                       :class="assignForm.usuario_id === user.id ? 'border-azul-cope bg-azul-cope/5 dark:bg-azul-cope/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'">
                  <input type="radio" :value="user.id" v-model="assignForm.usuario_id" class="hidden" />
                  
                  <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0 mr-3">
                    <img v-if="user.avatar" :src="getAvatarUrl(user.avatar)" class="w-full h-full object-cover" alt="Avatar" />
                    <div v-else class="w-full h-full bg-azul-cope/10 text-azul-cope flex items-center justify-center font-bold">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                  </div>

                  <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ user.name }}</span>
                    <span class="text-xs text-gray-500 truncate">@{{ user.username }}</span>
                  </div>

                  <div v-if="assignForm.usuario_id === user.id" class="ml-auto text-azul-cope">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-5 border-t border-gray-150 dark:border-gray-700">
              <button
                type="button"
                @click="closeAssignModal"
                class="px-4 py-2 border border-gray-300 dark:border-gray-650 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submittingAssign"
                class="px-4 py-2 bg-verde-cope hover:bg-verde-cope/90 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span v-if="submittingAssign" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ submittingAssign ? 'Asignando...' : 'Asignar' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

interface User {
  id: number
  name: string
  username: string
  avatar: string | null
}

interface Agencia {
  id: number
  nombre: string
  codigo: string
}

interface Caja {
  id: number
  agencia_id: number
  nombre: string
  tipo_caja: string
  estado: boolean
  agencia?: Agencia
  usuario_id: number | null
  usuario_en_turno: User | null
}

const authStore = useAuthStore()
const cajas = ref<Caja[]>([])
const usuariosAgencia = ref<User[]>([])
const loading = ref(true)
const loadingUsers = ref(false)
const error = ref('')
const searchQuery = ref('')

const isAssignModalOpen = ref(false)
const submittingAssign = ref(false)
const activeCaja = ref<Caja | null>(null)
const assignForm = ref({
  usuario_id: null as number | null
})

const motherUrl = import.meta.env.VITE_MOTHER_API_URL

const getAvatarUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  
  // Las imágenes las sirve el backend (App Madre)
  return `${motherUrl}/${path.replace(/^\//, '')}`
}

const filteredVentanillas = computed(() => {
  let result = cajas.value.filter(c => c.tipo_caja === 'ventanilla')
  
  const userAgencia = authStore.user?.agencia_id || authStore.user?.id_agencia || authStore.user?.agencia?.id
  if (userAgencia) {
    result = result.filter(c => c.agencia_id === Number(userAgencia))
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => c.nombre.toLowerCase().includes(q))
  }
  return result
})

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const params: any = {}
    const userAgencia = authStore.user?.agencia_id || authStore.user?.id_agencia || authStore.user?.agencia?.id
    if (userAgencia) {
      params.agencia_id = userAgencia
    }
    const { data } = await api.get('/cajas', { params })
    cajas.value = data.data || data
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.message || 'Hubo un error al obtener las ventanillas.'
  } finally {
    loading.value = false
  }
}

const fetchUsuariosAgencia = async (agenciaId: number) => {
  loadingUsers.value = true
  try {
    const { data } = await api.get('/usuarios', { params: { agencia_id: agenciaId } })
    usuariosAgencia.value = data
  } catch (err: any) {
    console.error('Error cargando usuarios:', err)
  } finally {
    loadingUsers.value = false
  }
}

const openAssignModal = async (caja: Caja) => {
  activeCaja.value = caja
  assignForm.value = {
    usuario_id: caja.usuario_id
  }
  isAssignModalOpen.value = true
  
  // Cargar usuarios si aún no se han cargado para esta agencia
  await fetchUsuariosAgencia(caja.agencia_id)
}

const closeAssignModal = () => {
  isAssignModalOpen.value = false
}

const saveAssignUser = async () => {
  if (!activeCaja.value) return
  submittingAssign.value = true
  try {
    const response = await api.post(`/cajas/${activeCaja.value.id}/asignar-usuario`, assignForm.value)
    
    // Actualizar la lista local
    const index = cajas.value.findIndex(c => c.id === activeCaja.value!.id)
    if (index !== -1) {
      cajas.value[index] = {
        ...cajas.value[index],
        usuario_id: response.data.caja.usuario_id,
        usuario_en_turno: response.data.caja.usuario_en_turno
      }
    }
    
    closeAssignModal()
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Responsable asignado',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (err: any) {
    console.error(err)
    Swal.fire('Error', err.response?.data?.message || 'Error al asignar usuario.', 'error')
  } finally {
    submittingAssign.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
