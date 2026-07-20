<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Reversiones de Caja
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Registra y consulta tus solicitudes de reversión de transacciones de caja.
        </p>
      </div>
      <button 
        @click="fetchSolicitudes"
        class="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
      >
        <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
        </svg>
        <span>Actualizar Listado</span>
      </button>
    </div>

    <!-- Contenido en 2 Columnas: Formulario a la izquierda, Listado a la derecha -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Formulario de Registro (4 col en lg) -->
      <div class="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-6 shadow-xl h-fit">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-azul-cope dark:text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
          </svg>
          Nueva Solicitud
        </h2>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Código Caja -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Código de Caja</label>
            <input 
              v-model="form.codigo_caja" 
              type="text" 
              required 
              placeholder="Ej. CAJA01"
              class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
            />
          </div>

          <!-- Nombre Cajero -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre del Cajero</label>
            <input 
              v-model="form.nombre_cajero" 
              type="text" 
              required 
              placeholder="Nombre del cajero operador"
              class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
            />
          </div>

          <!-- Código Transacción -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Código de Transacción</label>
            <input 
              v-model="form.codigo_transaccion" 
              type="text" 
              required 
              placeholder="Ej. TX-987452"
              class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
            />
          </div>

          <!-- Tipo Transacción -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Tipo de Transacción</label>
            <select 
              v-model="form.tipo_transaccion" 
              required
              class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white cursor-pointer"
            >
              <option value="" disabled>Seleccione el tipo</option>
              <option value="DEPOSITO">DEPOSITO</option>
              <option value="RETIRO">RETIRO</option>
              <option value="PAGO DE PRESTAMO">PAGO DE PRESTAMO</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              <option value="ENVIO A BOVEDA">ENVIO A BOVEDA</option>
              <option value="RECEPCION DE BOVEDA">RECEPCION DE BOVEDA</option>
              <option value="PAGO TARJETA DE CREDITO">PAGO TARJETA DE CREDITO</option>
              <option value="LIQUIDACION FALTANTE">LIQUIDACION FALTANTE</option>
              <option value="LIQUIDACION SOBRANTE">LIQUIDACION SOBRANTE</option>
              <option value="INGRESOS VARIOS">INGRESOS VARIOS</option>
              <option value="EGRESOS VARIOS">EGRESOS VARIOS</option>
              <option value="REMESAS">REMESAS</option>
            </select>
          </div>

          <!-- Motivo Reversión -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Motivo de Reversión</label>
            <textarea 
              v-model="form.motivo_reversion" 
              required 
              rows="3"
              placeholder="Detalla detalladamente el motivo de la reversión..."
              class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white resize-none"
            ></textarea>
          </div>

          <!-- Archivos Adjuntos -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Archivos Adjuntos (Comprobantes)</label>
            <div class="relative flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-950 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"></path>
                  </svg>
                  <p class="text-xs text-gray-550 dark:text-gray-400 font-medium">Arrastra o haz clic para subir</p>
                  <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Solo PDF (Max. 5MB)</p>
                </div>
                <input 
                  type="file" 
                  multiple 
                  @change="handleFileUpload" 
                  class="hidden" 
                  accept=".pdf"
                />
              </label>
            </div>

            <!-- Listado de archivos seleccionados -->
            <div v-if="selectedFiles.length > 0" class="mt-2 space-y-1.5">
              <div 
                v-for="(file, idx) in selectedFiles" 
                :key="idx" 
                class="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-lg text-gray-700 dark:text-gray-300"
              >
                <span class="truncate max-w-[180px] font-mono">{{ file.name }}</span>
                <button 
                  type="button" 
                  @click="removeFile(idx)"
                  class="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>

          <!-- Botón Enviar -->
          <button 
            type="submit" 
            :disabled="submitting"
            class="w-full py-2.5 bg-azul-cope hover:bg-azul-cope/95 disabled:bg-azul-cope/50 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ submitting ? 'Enviando...' : 'Enviar Solicitud' }}</span>
          </button>
        </form>
      </div>

      <!-- Tabla de Listado (8 col en lg) -->
      <div class="lg:col-span-8 space-y-4">
        
        <!-- Filtros de Búsqueda y Estado -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-md">
          <div class="w-full sm:w-1/3">
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Buscar por código tx o cajero..."
              class="w-full px-3.5 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
            />
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span class="text-xs text-gray-550 dark:text-gray-400 font-bold whitespace-nowrap">Estado:</span>
            <select 
              v-model="filterEstado" 
              class="px-3.5 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <div v-if="loading" class="flex flex-col items-center py-20 space-y-3">
            <div class="w-10 h-10 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
            <p class="text-xs text-gray-400">Cargando solicitudes de reversión...</p>
          </div>

          <div v-else-if="filteredSolicitudes.length === 0" class="p-12 text-center space-y-4">
            <div class="inline-flex p-4 bg-gray-50 dark:bg-gray-800 text-gray-450 rounded-full">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.5A2.25 2.25 0 0118 21H6a2.25 2.25 0 01-2.25-2.25v-4.5a2.25 2.25 0 012.25-2.25zM6.75 10.5h.008v.008H6.75V10.5zm3 0h.008v.008H9.75V10.5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Sin Solicitudes Registradas</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                No se encontraron solicitudes de reversión de caja para los filtros aplicados.
              </p>
            </div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-950 border-b border-gray-250 dark:border-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th class="p-3.5">Fecha</th>
                  <th class="p-3.5">Caja / Cajero</th>
                  <th class="p-3.5">Transacción</th>
                  <th class="p-3.5">Motivo</th>
                  <th class="p-3.5 text-center">Adjuntos</th>
                  <th class="p-3.5 text-center">Estado</th>
                  <th class="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-150 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                <tr v-for="sol in filteredSolicitudes" :key="sol.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                  <!-- Fecha -->
                  <td class="p-3.5 font-mono text-gray-500 whitespace-nowrap">
                    {{ formatDateTime(sol.created_at) }}
                  </td>
                  
                  <!-- Caja / Cajero -->
                  <td class="p-3.5">
                    <span class="font-bold text-gray-900 dark:text-white">{{ sol.codigo_caja }}</span>
                    <span class="block text-[10px] text-gray-400 font-medium">{{ sol.nombre_cajero }}</span>
                  </td>

                  <!-- Transacción -->
                  <td class="p-3.5">
                    <span class="font-bold text-gray-900 dark:text-gray-100 font-mono">{{ sol.codigo_transaccion }}</span>
                    <span class="block text-[10px] text-gray-400 font-bold uppercase">{{ sol.tipo_transaccion }}</span>
                  </td>

                  <!-- Motivo -->
                  <td class="p-3.5 max-w-[150px] truncate" :title="sol.motivo_reversion">
                    {{ sol.motivo_reversion }}
                  </td>

                  <!-- Adjuntos -->
                  <td class="p-3.5 text-center">
                    <div v-if="sol.archivos_adjuntos && sol.archivos_adjuntos.length > 0" class="flex flex-col gap-1 items-center">
                      <a 
                        v-for="(file, fIdx) in sol.archivos_adjuntos" 
                        :key="fIdx"
                        :href="file.url"
                        target="_blank"
                        class="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] text-blue-600 dark:text-blue-400 font-bold rounded-md border border-gray-200 dark:border-gray-700/80 truncate max-w-[110px] flex items-center gap-1"
                        :title="file.nombre"
                      >
                        <svg class="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
                        </svg>
                        <span>{{ file.nombre }}</span>
                      </a>
                    </div>
                    <span v-else class="text-gray-400">-</span>
                  </td>

                  <!-- Estado -->
                  <td class="p-3.5 text-center">
                    <span 
                      class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider block w-fit mx-auto"
                      :class="getEstadoClass(sol.estado)"
                    >
                      {{ sol.estado }}
                    </span>
                    <span 
                      v-if="sol.estado !== 'pendiente' && sol.observaciones_autorizador" 
                      class="block text-[10px] text-gray-400 mt-1 max-w-[120px] truncate mx-auto"
                      :title="sol.observaciones_autorizador"
                    >
                      Obs: {{ sol.observaciones_autorizador }}
                    </span>
                  </td>

                  <!-- Acciones -->
                  <td class="p-3.5 text-center">
                    <button 
                      v-if="sol.estado === 'pendiente' || sol.estado === 'aprobado'"
                      @click="deleteSolicitud(sol.id)"
                      class="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center mx-auto"
                      title="Eliminar Solicitud"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
                      </svg>
                    </button>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import Swal from 'sweetalert2'

interface Adjunto {
  nombre: string
  url: string
  path: string
}

interface SolicitudReversion {
  id: number
  codigo_caja: string
  nombre_cajero: string
  codigo_transaccion: string
  tipo_transaccion: string
  motivo_reversion: string
  archivos_adjuntos: Adjunto[] | null
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  observaciones_autorizador: string | null
  created_at: string
}

// Estados reactivos
const loading = ref(false)
const submitting = ref(false)
const solicitudes = ref<SolicitudReversion[]>([])
const selectedFiles = ref<File[]>([])
const searchTerm = ref('')
const filterEstado = ref('todos')

// Formulario reactivo
const form = ref({
  codigo_caja: '',
  nombre_cajero: '',
  codigo_transaccion: '',
  tipo_transaccion: '',
  motivo_reversion: ''
})

const fetchSolicitudes = async () => {
  loading.value = true
  try {
    const res = await axios.get('/reversiones')
    solicitudes.value = res.data
  } catch (err) {
    console.error('Error al cargar solicitudes de reversión', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSolicitudes()
})

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i]
      
      // Validar formato PDF
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo no permitido',
          text: `El archivo "${file.name}" no es un PDF válido. Solo se permiten archivos PDF.`
        })
        continue
      }

      // Validar tamaño máximo de 5MB
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo demasiado grande',
          text: `El archivo "${file.name}" supera el límite máximo permitido de 5MB.`
        })
        continue
      }

      selectedFiles.value.push(file)
    }
  }
  target.value = '' // Resetear para permitir subir el mismo archivo si se elimina
}

const removeFile = (idx: number) => {
  selectedFiles.value.splice(idx, 1)
}

const submitForm = async () => {
  submitting.value = true
  
  // Utilizar FormData para soportar subida de archivos adjuntos
  const formData = new FormData()
  formData.append('codigo_caja', form.value.codigo_caja)
  formData.append('nombre_cajero', form.value.nombre_cajero)
  formData.append('codigo_transaccion', form.value.codigo_transaccion)
  formData.append('tipo_transaccion', form.value.tipo_transaccion)
  formData.append('motivo_reversion', form.value.motivo_reversion)
  
  selectedFiles.value.forEach((file) => {
    formData.append('archivos[]', file)
  })

  try {
    const res = await axios.post('/reversiones', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    Swal.fire({
      icon: 'success',
      title: '¡Solicitud Creada!',
      text: res.data.message || 'La solicitud de reversión se ha registrado exitosamente.',
      confirmButtonColor: '#0a4275'
    })

    // Resetear formulario
    form.value = {
      codigo_caja: '',
      nombre_cajero: '',
      codigo_transaccion: '',
      tipo_transaccion: '',
      motivo_reversion: ''
    }
    selectedFiles.value = []
    
    // Recargar tabla
    fetchSolicitudes()
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error de envío',
      text: err.response?.data?.message || 'Ocurrió un error al enviar la solicitud.'
    })
  } finally {
    submitting.value = false
  }
}

// Filtro de listado
const filteredSolicitudes = computed(() => {
  return solicitudes.value.filter((sol) => {
    // Filtro por término de búsqueda
    const textMatch = 
      sol.codigo_transaccion.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      sol.nombre_cajero.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      sol.codigo_caja.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    // Filtro por estado
    const estadoMatch = 
      filterEstado.value === 'todos' || 
      sol.estado === filterEstado.value

    return textMatch && estadoMatch
  })
})

const getEstadoClass = (estado: string) => {
  if (estado === 'aprobado') return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-900/50'
  if (estado === 'rechazado') return 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-450 border border-red-250 dark:border-red-900/50'
  return 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-450 border border-amber-250 dark:border-amber-900/50'
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

const deleteSolicitud = async (id: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la solicitud y sus comprobantes de Google Cloud de forma permanente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })

  if (!result.isConfirmed) return

  try {
    const res = await axios.delete(`/reversiones/${id}`)
    Swal.fire({
      icon: 'success',
      title: 'Eliminada',
      text: res.data.message || 'La solicitud se ha eliminado correctamente.'
    })
    fetchSolicitudes()
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: err.response?.data?.message || 'No se pudo eliminar la solicitud.'
    })
  }
}
</script>

<style scoped>
/* Transición premium */
select, input, textarea {
  transition: all 0.25s ease-in-out;
}
</style>
