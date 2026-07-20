<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Reporte de Descuadres de Agencia
        </h1>
        <p class="text-xs text-gray-550 dark:text-gray-400 mt-1">
          Visualiza los registros de descuadres de caja y reporta nuevos incidentes.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="fetchDescuadres"
          class="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
          </svg>
          <span>Actualizar Listado</span>
        </button>
        <button 
          @click="openModal"
          class="p-2.5 bg-azul-cope hover:bg-azul-cope/95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
          <span>Registrar Descuadre</span>
        </button>
      </div>
    </div>

    <!-- Contenido Principal: Listado y Buscador -->
    <div class="space-y-4">
      <!-- Filtros de Búsqueda -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-md">
        <div class="w-full sm:w-1/3">
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Buscar por receptor o código caja..."
            class="w-full px-3.5 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
          />
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span class="text-xs text-gray-550 dark:text-gray-400 font-bold whitespace-nowrap">Tipo Descuadre:</span>
          <select 
            v-model="filterTipo" 
            class="px-3.5 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="FALTANTE">Faltantes</option>
            <option value="SOBRANTE">Sobrantes</option>
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        <div v-if="loading" class="flex flex-col items-center py-20 space-y-3">
          <div class="w-10 h-10 rounded-full border-4 border-azul-cope border-t-transparent animate-spin"></div>
          <p class="text-xs text-gray-400">Cargando reporte de descuadres...</p>
        </div>

        <div v-else-if="filteredDescuadres.length === 0" class="p-12 text-center space-y-4">
          <div class="inline-flex p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-full">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18a2.25 2.25 0 012.25 2.25v4.5A2.25 2.25 0 0118 21H6a2.25 2.25 0 01-2.25-2.25v-4.5a2.25 2.25 0 012.25-2.25zM6.75 10.5h.008v.008H6.75V10.5zm3 0h.008v.008H9.75V10.5z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Sin Descuadres Registrados</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              No se encontraron registros de descuadres para los criterios seleccionados.
            </p>
          </div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-gray-55 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th class="p-3.5">Fecha Reporte</th>
                <th class="p-3.5">Fecha Descuadre</th>
                <th class="p-3.5">Caja</th>
                <th class="p-3.5">Receptor</th>
                <th class="p-3.5">Tipo</th>
                <th class="p-3.5">Monto</th>
                <th class="p-3.5 text-center">Declarado</th>
                <th class="p-3.5">Solución</th>
                <th class="p-3.5">Comentario</th>
                <th class="p-3.5 text-center">Adjuntos</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              <tr v-for="desc in filteredDescuadres" :key="desc.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                <!-- Fecha Reporte -->
                <td class="p-3.5 font-mono text-gray-500 whitespace-nowrap">
                  {{ formatDateTime(desc.created_at) }}
                </td>

                <!-- Fecha Descuadre -->
                <td class="p-3.5 font-mono text-gray-500 whitespace-nowrap">
                  {{ formatDate(desc.fecha_descuadre) }}
                </td>

                <!-- Caja -->
                <td class="p-3.5 font-bold text-gray-900 dark:text-white">
                  {{ desc.codigo_caja }}
                </td>

                <!-- Receptor -->
                <td class="p-3.5 font-medium">
                  {{ desc.nombre_receptor }}
                </td>

                <!-- Tipo -->
                <td class="p-3.5">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider block w-fit"
                    :class="desc.tipo_descuadre === 'FALTANTE' ? 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-250'"
                  >
                    {{ desc.tipo_descuadre }}
                  </span>
                </td>

                <!-- Monto -->
                <td class="p-3.5 font-mono font-bold">
                  Q {{ parseFloat(String(desc.monto_descuadre)).toFixed(2) }}
                </td>

                <!-- Declarado -->
                <td class="p-3.5 text-center">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block"
                    :class="desc.descuadre_declarado === 'SI' ? 'bg-emerald-55/15 text-emerald-600' : 'bg-amber-55/15 text-amber-600'"
                  >
                    {{ desc.descuadre_declarado }}
                  </span>
                </td>

                <!-- Solución -->
                <td class="p-3.5 max-w-[150px] truncate" :title="desc.solucion || undefined">
                  {{ desc.solucion || '-' }}
                </td>

                <!-- Comentario -->
                <td class="p-3.5 max-w-[150px] truncate" :title="desc.comentario || undefined">
                  {{ desc.comentario || '-' }}
                </td>

                <!-- Adjuntos -->
                <td class="p-3.5 text-center">
                  <div v-if="desc.archivos_adjuntos && desc.archivos_adjuntos.length > 0" class="flex flex-col gap-1 items-center">
                    <a 
                      v-for="(file, fIdx) in desc.archivos_adjuntos" 
                      :key="fIdx"
                      :href="file.url"
                      target="_blank"
                      class="px-2 py-0.5 bg-gray-55 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] text-blue-600 dark:text-blue-400 font-bold rounded-md border border-gray-200 dark:border-gray-700/80 truncate max-w-[110px] cursor-pointer flex items-center gap-1"
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Registro -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" @click="closeModal"></div>

        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
          <div class="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
            <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-azul-cope dark:text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
              </svg>
              Registrar Descuadre de Agencia
            </h3>
            <button @click="closeModal" class="text-gray-450 hover:text-gray-600 dark:hover:text-gray-300 font-bold text-lg cursor-pointer">
              &times;
            </button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Agencia (Deshabilitado / Autofill) -->
            <div>
              <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Agencia (Usuario Logueado)</label>
              <input 
                :value="authStore.user?.agencia?.nombre || authStore.user?.id_agencia || authStore.user?.idagencia || 'No Asignada'" 
                type="text" 
                disabled 
                class="w-full px-3.5 py-2 bg-gray-100 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Código Caja -->
              <div>
                <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Código Caja</label>
                <input 
                  v-model="form.codigo_caja" 
                  type="text" 
                  required 
                  placeholder="Ej. CAJA01"
                  class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
                />
              </div>

              <!-- Nombre Receptor -->
              <div>
                <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Nombre Receptor</label>
                <input 
                  v-model="form.nombre_receptor" 
                  type="text" 
                  required 
                  placeholder="Nombre del receptor"
                  class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Tipo Descuadre -->
              <div>
                <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Tipo de Descuadre</label>
                <select 
                  v-model="form.tipo_descuadre" 
                  required
                  class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white cursor-pointer"
                >
                  <option value="" disabled>Seleccione...</option>
                  <option value="FALTANTE">FALTANTE</option>
                  <option value="SOBRANTE">SOBRANTE</option>
                </select>
              </div>

              <!-- Monto Descuadre -->
              <div>
                <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Monto Descuadre</label>
                <input 
                  v-model.number="form.monto_descuadre" 
                  type="number" 
                  step="0.01"
                  min="0"
                  required 
                  placeholder="0.00"
                  class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Descuadre Declarado -->
              <div>
                <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Descuadre Declarado</label>
                <select 
                  v-model="form.descuadre_declarado" 
                  required
                  class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white cursor-pointer"
                >
                  <option value="" disabled>Seleccione...</option>
                  <option value="SI">SI</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              <!-- Fecha Descuadre -->
              <div>
                <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Fecha Descuadre</label>
                <input 
                  v-model="form.fecha_descuadre" 
                  type="date" 
                  required 
                  class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white cursor-pointer"
                />
              </div>
            </div>

            <!-- Solución -->
            <div>
              <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Solución</label>
              <textarea 
                v-model="form.solucion" 
                rows="2"
                placeholder="Indica la solución aplicada o propuesta..."
                class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white resize-none"
              ></textarea>
            </div>

            <!-- Comentario -->
            <div>
              <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Comentario</label>
              <textarea 
                v-model="form.comentario" 
                rows="2"
                placeholder="Comentarios adicionales..."
                class="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-verde-cope outline-none transition-all dark:text-white resize-none"
              ></textarea>
            </div>

            <!-- Datos Adjuntos -->
            <div>
              <label class="block text-xs font-bold text-gray-450 uppercase mb-1">Datos Adjuntos (PDF Máx. 5MB)</label>
              <div class="relative flex items-center justify-center w-full">
                <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-950 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all">
                  <div class="flex flex-col items-center justify-center pt-2 pb-2">
                    <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"></path>
                    </svg>
                    <p class="text-[11px] text-gray-550 dark:text-gray-450 font-medium">Seleccionar PDF</p>
                    <p class="text-[9px] text-gray-400 dark:text-gray-500">Máx. 5MB</p>
                  </div>
                  <input 
                    type="file" 
                    @change="handleFileUpload" 
                    class="hidden" 
                    accept=".pdf"
                  />
                </label>
              </div>

              <!-- Archivo Seleccionado -->
              <div v-if="selectedFile" class="mt-2 flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-lg text-gray-700 dark:text-gray-300">
                <span class="truncate max-w-[280px] font-mono">{{ selectedFile.name }}</span>
                <button 
                  type="button" 
                  @click="removeFile"
                  class="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- Botones Guardar/Cancelar -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button 
                type="button" 
                @click="closeModal" 
                class="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                :disabled="submitting"
                class="px-4 py-2 bg-azul-cope hover:bg-azul-cope/95 disabled:bg-azul-cope/50 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ submitting ? 'Guardando...' : 'Registrar' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const authStore = useAuthStore()

interface Adjunto {
  nombre: string
  url: string
  path: string
}

interface DescuadreAgencia {
  id: number
  codigo_caja: string
  nombre_receptor: string
  tipo_descuadre: 'FALTANTE' | 'SOBRANTE'
  monto_descuadre: number | string
  descuadre_declarado: 'SI' | 'NO'
  solucion: string | null
  fecha_descuadre: string
  comentario: string | null
  archivos_adjuntos: Adjunto[] | null
  created_at: string
}

// Estados reactivos
const loading = ref(false)
const submitting = ref(false)
const descuadres = ref<DescuadreAgencia[]>([])
const isModalOpen = ref(false)
const selectedFile = ref<File | null>(null)
const searchTerm = ref('')
const filterTipo = ref('todos')

// Formulario reactivo
const form = ref({
  codigo_caja: '',
  nombre_receptor: '',
  tipo_descuadre: '',
  monto_descuadre: null as number | null,
  descuadre_declarado: '',
  solucion: '',
  fecha_descuadre: new Date().toISOString().split('T')[0],
  comentario: ''
})

const fetchDescuadres = async () => {
  loading.value = true
  try {
    const res = await api.get('/descuadres')
    descuadres.value = res.data
  } catch (err) {
    console.error('Error al cargar descuadres de agencia', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDescuadres()
})

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  // Resetear formulario
  form.value = {
    codigo_caja: '',
    nombre_receptor: '',
    tipo_descuadre: '',
    monto_descuadre: null,
    descuadre_declarado: '',
    solucion: '',
    fecha_descuadre: new Date().toISOString().split('T')[0],
    comentario: ''
  }
  selectedFile.value = null
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Validar PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo no permitido',
        text: 'Solo se permiten archivos PDF.'
      })
      return
    }

    // Validar tamaño máximo 5MB
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo demasiado grande',
        text: 'El archivo supera el límite de 5MB.'
      })
      return
    }

    selectedFile.value = file
  }
  target.value = ''
}

const removeFile = () => {
  selectedFile.value = null
}

const submitForm = async () => {
  submitting.value = true
  
  const formData = new FormData()
  formData.append('codigo_caja', form.value.codigo_caja)
  formData.append('nombre_receptor', form.value.nombre_receptor)
  formData.append('tipo_descuadre', form.value.tipo_descuadre)
  formData.append('monto_descuadre', String(form.value.monto_descuadre || 0))
  formData.append('descuadre_declarado', form.value.descuadre_declarado)
  formData.append('fecha_descuadre', form.value.fecha_descuadre)
  
  if (form.value.solucion) formData.append('solucion', form.value.solucion)
  if (form.value.comentario) formData.append('comentario', form.value.comentario)
  
  if (selectedFile.value) {
    formData.append('archivos[]', selectedFile.value)
  }

  try {
    const res = await api.post('/descuadres', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    Swal.fire({
      icon: 'success',
      title: '¡Descuadre Registrado!',
      text: res.data.message || 'El reporte de descuadre se ha registrado exitosamente.',
      confirmButtonColor: '#0a4275'
    })

    closeModal()
    fetchDescuadres()
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error al registrar',
      text: err.response?.data?.message || 'Ocurrió un error al enviar el reporte.'
    })
  } finally {
    submitting.value = false
  }
}

// Filtro de listado
const filteredDescuadres = computed(() => {
  return descuadres.value.filter((desc) => {
    const textMatch = 
      desc.codigo_caja.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      desc.nombre_receptor.toLowerCase().includes(searchTerm.value.toLowerCase())
    
    const tipoMatch = 
      filterTipo.value === 'todos' || 
      desc.tipo_descuadre === filterTipo.value

    return textMatch && tipoMatch
  })
})

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateStr: string) => {
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return new Date(dateStr).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
select, input, textarea {
  transition: all 0.25s ease-in-out;
}
</style>
