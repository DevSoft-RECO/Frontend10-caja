<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Envío de Efectivo Entre Agencias
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona los envíos directos de efectivo hacia y desde otras agencias.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="fetchTraslados"
          class="px-4 py-2 bg-gray-150 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>🔄</span> Refrescar
        </button>
        <button
          @click="showCreateModal = true"
          class="px-5 py-2.5 bg-azul-cope hover:bg-azul-cope/90 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>➕</span> Nuevo Envío
        </button>
      </div>
    </div>

    <!-- Pestañas de Seguimiento -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 select-none">
      <button
        @click="activeTrackingTab = 'enviados'"
        class="px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer"
        :class="activeTrackingTab === 'enviados' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
      >
        📤 Mis Envíos Directos
      </button>
      <button
        @click="activeTrackingTab = 'recibidos'"
        class="px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 cursor-pointer"
        :class="activeTrackingTab === 'recibidos' ? 'border-verde-cope text-verde-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
      >
        📥 Envíos Entrantes
      </button>
    </div>

    <div v-if="successMsg" class="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 text-sm font-bold flex items-center gap-2">
      <span>✅</span> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 text-sm font-bold flex items-center gap-2">
      <span>⚠️</span> {{ errorMsg }}
    </div>

    <!-- Tabla de Seguimiento -->
    <div class="space-y-4">
      <div v-if="loadingList" class="flex justify-center py-20"><div class="w-8 h-8 border-3 border-azul-cope border-t-transparent rounded-full animate-spin"></div></div>
      
      <div v-else-if="filteredTraslados.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-250 text-gray-450 italic text-sm">
        No se encontraron operaciones en esta categoría.
      </div>
      
      <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{{ activeTrackingTab === 'enviados' ? 'Destino (Recibe)' : 'Origen (Envía)' }}</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Monto</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150 dark:divide-gray-750">
              <tr v-for="t in filteredTraslados" :key="t.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-xs font-mono font-bold text-gray-500">#{{ t.id }}</span>
                </td>
                <td class="px-6 py-4">
                  <template v-if="activeTrackingTab === 'enviados'">
                    <p class="font-bold text-gray-800 dark:text-gray-200">{{ t.destino_boveda?.nombre }}</p>
                    <p class="text-xs text-gray-500">{{ t.destino_boveda?.agencia?.nombre }}</p>
                  </template>
                  <template v-else>
                    <p class="font-bold text-gray-800 dark:text-gray-200">{{ t.origen_boveda?.nombre }}</p>
                    <p class="text-xs text-gray-500">{{ t.origen_boveda?.agencia?.nombre }}</p>
                  </template>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-azul-cope dark:text-cyan-400">
                  {{ formatCurrency(t.monto_total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border" :class="getStatusBadgeClass(t.estado)">
                    {{ formatEstado(t.estado) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    @click="openDetails(t)"
                    class="px-4 py-2 bg-azul-cope/10 hover:bg-azul-cope hover:text-white text-azul-cope font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL: NUEVO ENVÍO DIRECTO -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white dark:bg-gray-850 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh]">
        
        <!-- Modal Header -->
        <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="text-azul-cope">📤</span> Programar Nuevo Envío Directo
          </h2>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-xl cursor-pointer p-1">
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-900/30">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Panel Detalle -->
            <div class="space-y-4 lg:col-span-1">
              <div>
                <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">Bóveda Origen (Mi Agencia)</label>
                <select
                  v-model="bovedaOrigenId"
                  disabled
                  class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800/50 text-gray-950 dark:text-gray-300 focus:outline-none text-sm font-bold transition-all cursor-not-allowed opacity-80"
                >
                  <option :value="null" disabled>Cargando bóveda...</option>
                  <option v-for="caja in bovedasLocales" :key="caja.id" :value="caja.id">
                    {{ caja.nombre }} ({{ caja.agencia?.nombre }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">Bóveda Destino (Recibe)</label>
                <select
                  v-model="bovedaDestinoId"
                  class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope text-sm font-bold transition-all"
                >
                  <option :value="null" disabled>Seleccione bóveda destino...</option>
                  <option v-for="caja in bovedasDestinoDisponibles" :key="caja.id" :value="caja.id">
                    {{ caja.nombre }} ({{ caja.agencia?.nombre }})
                  </option>
                </select>
              </div>

              <div class="pt-4 border-t border-gray-200 dark:border-gray-750 space-y-4">
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Datos de Despacho</h3>
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Programada</label>
                  <input type="datetime-local" v-model="fechaProgramada" class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Repartidor</label>
                  <input type="text" v-model="repartidor" placeholder="Transporte de valores..." class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Comentarios</label>
                  <input type="text" v-model="comentarioEnvio" placeholder="Opcional..." class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold" />
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200 dark:border-gray-750 text-xs space-y-2">
                <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
                  <span>Monto Total a Enviar:</span>
                  <span class="text-base font-extrabold font-mono text-azul-cope dark:text-cyan-400">{{ formatCurrency(totalMonto) }}</span>
                </div>
              </div>
            </div>

            <!-- Panel Denominaciones -->
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col">
              <div class="flex border-b border-gray-150 dark:border-gray-750 select-none mb-4">
                <button
                  @click="activeTab = 'billete'"
                  class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
                  :class="activeTab === 'billete' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
                >Billetes</button>
                <button
                  @click="activeTab = 'moneda'"
                  class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
                  :class="activeTab === 'moneda' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
                >Monedas</button>
              </div>

              <div class="space-y-3 overflow-y-auto pr-2 max-h-[50vh] custom-scrollbar">
                <div
                  v-for="denom in currentList"
                  :key="denom.id"
                  class="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-750 flex items-center justify-between gap-4"
                >
                  <div class="flex-1"><span class="block font-bold text-gray-900 dark:text-white">{{ denom.nombre }}</span></div>
                  <div class="flex items-center gap-3 w-48 justify-end">
                    <input
                      v-model.number="denom.cantidad_enviar"
                      type="number"
                      min="0"
                      class="block w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-azul-cope"
                      placeholder="0"
                    />
                    <span class="w-20 text-right font-mono font-bold text-gray-700 dark:text-gray-350 text-xs">
                      {{ formatCurrency((denom.cantidad_enviar || 0) * denom.valor) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-5 border-t border-gray-150 dark:border-gray-750 bg-gray-50 dark:bg-gray-900/30 flex justify-end gap-3 rounded-b-3xl">
          <button @click="showCreateModal = false" class="px-5 py-2.5 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            @click="submitEnvio"
            :disabled="loadingSubmit || !bovedaOrigenId || !bovedaDestinoId || !fechaProgramada || !repartidor || totalMonto === 0"
            class="px-6 py-2.5 bg-azul-cope hover:bg-azul-cope/90 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all text-xs flex items-center gap-2 cursor-pointer"
          >
            <span v-if="loadingSubmit" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Registrar Envío
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLES DEL ENVÍO -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="selectedTraslado" class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-[70] flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white dark:bg-gray-850 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-750 flex flex-col my-auto max-h-[95vh]">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between bg-gray-50 dark:bg-gray-900/30">
            <div class="flex items-center gap-3">
              <span class="text-lg font-extrabold text-gray-900 dark:text-white">Envío #{{ selectedTraslado.id }}</span>
              <span class="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-azul-cope/10 text-azul-cope">
                {{ activeTrackingTab === 'recibidos' ? 'Entrante' : 'Saliente' }}
              </span>
            </div>
            <button @click="selectedTraslado = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-xl cursor-pointer p-1">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            <!-- Grid Información -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/20 p-5 rounded-2xl border border-gray-150 dark:border-gray-800">
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Origen (Envía)</h4>
                  <p class="font-extrabold text-gray-800 dark:text-white text-base">
                    {{ selectedTraslado.origen_boveda?.nombre }}
                  </p>
                  <p class="text-xs text-gray-500 font-semibold">{{ selectedTraslado.origen_boveda?.agencia?.nombre }}</p>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Destino (Recibe)</h4>
                  <p class="font-extrabold text-gray-800 dark:text-white text-base">
                    {{ selectedTraslado.destino_boveda?.nombre }}
                  </p>
                  <p class="text-xs text-gray-500 font-semibold">{{ selectedTraslado.destino_boveda?.agencia?.nombre }}</p>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monto de Operación</h4>
                  <p class="text-xl font-extrabold text-azul-cope dark:text-cyan-400 font-mono">
                    {{ formatCurrency(selectedTraslado.monto_total) }}
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div v-if="selectedTraslado.fecha_programada">
                    <span class="font-bold text-gray-400 block">Programado:</span>
                    <span class="font-extrabold text-gray-800 dark:text-gray-200">
                      {{ new Date(selectedTraslado.fecha_programada).toLocaleString('es-GT') }}
                    </span>
                  </div>
                  <div v-if="selectedTraslado.repartidor">
                    <span class="font-bold text-gray-400 block">Repartidor:</span>
                    <span class="font-extrabold text-gray-800 dark:text-gray-200">
                      {{ selectedTraslado.repartidor }}
                    </span>
                  </div>
                  <div>
                    <span class="font-bold text-gray-400 block">Creado Por:</span>
                    <span class="font-semibold text-gray-700 dark:text-gray-300">
                      {{ selectedTraslado.creador?.name || 'Sistema' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comentarios -->
            <div v-if="selectedTraslado.comentario_envio" class="space-y-2">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Notas de Operación</h4>
              <div class="p-4 bg-yellow-50/50 dark:bg-yellow-950/10 border-l-4 border-yellow-400 rounded-r-2xl text-sm italic text-gray-700 dark:text-gray-300">
                <p><span class="font-bold not-italic text-gray-500">Envío:</span> "{{ selectedTraslado.comentario_envio }}"</p>
              </div>
            </div>

            <!-- Stepper de Seguimiento (Envíos Directos) -->
            <div class="space-y-4 pt-2">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Progreso del Envío</h4>
              
              <div class="relative py-4">
                <div class="absolute top-1/2 left-4 right-4 h-1 bg-gray-250 dark:bg-gray-700 -translate-y-1/2 rounded-full hidden md:block"></div>

                <div class="relative flex justify-between gap-4 flex-col md:flex-row">
                    <div
                      v-for="(step, idx) in stepsEnvio"
                      :key="step.key"
                      class="flex md:flex-col items-center flex-1 text-center relative group"
                    >
                      <!-- Línea de progreso activa -->
                      <div
                        v-if="idx < stepsEnvio.length - 1"
                        class="absolute top-1/2 left-[50%] right-[-50%] h-1 -translate-y-1/2 hidden md:block z-0 transition-colors"
                        :class="isStepActive(selectedTraslado.estado, stepsEnvio[idx + 1].states) ? 'bg-emerald-500' : 'bg-transparent'"
                      ></div>

                      <!-- Círculo -->
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-300 border-2 select-none"
                        :class="[
                          isStepCurrent(selectedTraslado.estado, step.states)
                            ? 'bg-emerald-500 border-emerald-600 text-white scale-110 shadow-lg ring-4 ring-emerald-500/20'
                            : isStepActive(selectedTraslado.estado, step.states)
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'
                        ]"
                      >
                        {{ step.icon }}
                      </div>

                      <div class="ml-4 md:ml-0 md:mt-2 text-left md:text-center z-10">
                        <p
                          class="text-xs font-bold"
                          :class="isStepActive(selectedTraslado.estado, step.states) ? 'text-gray-900 dark:text-white' : 'text-gray-450 dark:text-gray-500'"
                        >
                          {{ step.label }}
                        </p>
                        <p class="text-[9px] font-semibold text-gray-400 dark:text-gray-500">
                          {{ isStepCurrent(selectedTraslado.estado, step.states) ? 'Actual' : isStepActive(selectedTraslado.estado, step.states) ? 'Completado' : 'Pendiente' }}
                        </p>
                      </div>
                    </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer Acciones -->
          <div class="px-6 py-5 border-t border-gray-150 dark:border-gray-750 flex flex-wrap items-center justify-end gap-3 bg-gray-55 dark:bg-gray-900/30 shrink-0">
            
            <!-- Acciones si el usuario es "Destino" (Envíos Entrantes) -->
            <template v-if="activeTrackingTab === 'recibidos'">
              <button
                v-if="selectedTraslado.estado === 'enviado'"
                @click="marcarEnterado(selectedTraslado.id)"
                class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                📦 Confirmar Recepción
              </button>
              <button
                v-if="selectedTraslado.estado === 'enterado'"
                @click="ingresarEfectivo(selectedTraslado.id)"
                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                🏦 Ingresar a Bóveda
              </button>
            </template>

            <!-- Acciones si el usuario es "Origen" (Mis Envíos) -->
            <template v-if="activeTrackingTab === 'enviados'">
              <button
                v-if="selectedTraslado.estado === 'enviado'"
                @click="cancelarTraslado(selectedTraslado.id)"
                class="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar Envío
              </button>
            </template>

            <button @click="selectedTraslado = null" class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const activeTrackingTab = ref<'enviados' | 'recibidos'>('enviados')
const showCreateModal = ref(false)
const selectedTraslado = ref<any>(null)
const activeTab = ref<'billete' | 'moneda'>('billete')
const loadingSubmit = ref(false)
const loadingList = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const bovedaOrigenId = ref<number | null>(null)
const bovedaDestinoId = ref<number | null>(null)
const fechaProgramada = ref<string>('')
const repartidor = ref<string>('')
const comentarioEnvio = ref<string>('')

const cajasList = ref<any[]>([])
const denominacionesList = ref<any[]>([])
const trasladosList = ref<any[]>([])

const stepsEnvio = [
  { key: 'enviado', states: ['enviado', 'enterado', 'ingresado'], label: 'Despachado', icon: '🚚' },
  { key: 'enterado', states: ['enterado', 'ingresado'], label: 'Recibido', icon: '📦' },
  { key: 'ingresado', states: ['ingresado'], label: 'Depositado', icon: '🏦' }
]

const isStepActive = (estadoActual: string, targetEstados: string[]) => targetEstados.includes(estadoActual)
const isStepCurrent = (estadoActual: string, targetEstados: string[]) => estadoActual === targetEstados[0]

const bovedasLocales = computed(() => {
  const userAgenciaId = authStore.user?.agencia_id || authStore.user?.agencia?.id
  return cajasList.value.filter(c => c.tipo_caja === 'boveda' && Number(c.agencia_id) === Number(userAgenciaId))
})

const bovedasDestinoDisponibles = computed(() => {
  return cajasList.value.filter(c => c.tipo_caja === 'boveda' && c.id !== bovedaOrigenId.value)
})

const currentList = computed(() => denominacionesList.value.filter(d => d.tipo === activeTab.value))
const totalMonto = computed(() => denominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_enviar) || 0) * d.valor, 0))

const filteredTraslados = computed(() => {
  return trasladosList.value.filter(t => {
    if (activeTrackingTab.value === 'enviados') {
      return bovedasLocales.value.some(b => b.id === t.origen_boveda_id)
    } else {
      return bovedasLocales.value.some(b => b.id === t.destino_boveda_id)
    }
  })
})

const formatCurrency = (val: number) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)

const formatEstado = (estado: string) => {
  const labels: Record<string, string> = {
    enviado: 'Enviado',
    enterado: 'Recibido',
    ingresado: 'Depositado',
    cancelado: 'Cancelado'
  }
  return labels[estado] || estado.replace('_', ' ')
}

const getStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'ingresado':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400'
    case 'cancelado':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400'
    case 'enviado':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400'
    default:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400'
  }
}

const fetchInitialData = async () => {
  try {
    const [cajasRes, denomsRes] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    cajasList.value = cajasRes.data
    denominacionesList.value = denomsRes.data.map((d: any) => ({ ...d, cantidad_enviar: undefined }))
    if(bovedasLocales.value.length > 0) {
      bovedaOrigenId.value = bovedasLocales.value[0].id
      fetchTraslados()
    }
  } catch (error) {}
}

const fetchTraslados = async () => {
  if (!bovedaOrigenId.value && bovedasLocales.value.length > 0) {
    bovedaOrigenId.value = bovedasLocales.value[0].id
  }
  if (!bovedaOrigenId.value) return
  loadingList.value = true
  try {
    const res = await axios.get('/cajas/traslado-bovedas', { params: { caja_id: bovedaOrigenId.value } })
    trasladosList.value = res.data
  } catch (error) {} finally { loadingList.value = false }
}

const submitEnvio = async () => {
  const detalles = denominacionesList.value.filter(d => Number(d.cantidad_enviar) > 0).map(d => ({ denominacion_id: d.id, cantidad: Number(d.cantidad_enviar) }))
  if (detalles.length === 0) return
  loadingSubmit.value = true
  errorMsg.value = ''; successMsg.value = ''
  try {
    await axios.post('/cajas/traslado-bovedas', {
      boveda_origen_id: bovedaOrigenId.value,
      boveda_destino_id: bovedaDestinoId.value,
      tipo_traslado: 'enviar',
      fecha_programada: fechaProgramada.value,
      repartidor: repartidor.value,
      comentario_envio: comentarioEnvio.value,
      detalles
    })
    successMsg.value = 'Envío de efectivo registrado exitosamente.'
    
    // Limpiar formulario
    bovedaDestinoId.value = null
    fechaProgramada.value = ''
    repartidor.value = ''
    comentarioEnvio.value = ''
    denominacionesList.value.forEach(d => d.cantidad_enviar = undefined)
    showCreateModal.value = false
    activeTrackingTab.value = 'enviados'
    
    fetchTraslados()
    setTimeout(() => successMsg.value = '', 5000)
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Error al registrar el envío'
    setTimeout(() => errorMsg.value = '', 5000)
  } finally { loadingSubmit.value = false }
}

const cancelarTraslado = async (id: number) => {
  if (!confirm('¿Seguro que deseas cancelar este traslado?')) return
  try {
    await axios.delete(`/cajas/traslado-bovedas/${id}`)
    successMsg.value = `Envío #${id} cancelado correctamente.`
    selectedTraslado.value = null
    fetchTraslados()
    setTimeout(() => successMsg.value = '', 5000)
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Error al cancelar'
    setTimeout(() => errorMsg.value = '', 5000)
  }
}

const marcarEnterado = async (id: number) => {
  try {
    await axios.post(`/cajas/traslado-bovedas/${id}/marcar-enterado`)
    successMsg.value = 'Recepción confirmada. El paquete físico ha sido recibido.'
    selectedTraslado.value = null
    fetchTraslados()
    setTimeout(() => successMsg.value = '', 5000)
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Error al confirmar recepción'
    setTimeout(() => errorMsg.value = '', 5000)
  }
}

const ingresarEfectivo = async (id: number) => {
  try {
    await axios.post(`/cajas/traslado-bovedas/${id}/confirmar-ingreso`)
    successMsg.value = 'Efectivo ingresado a la bóveda correctamente.'
    selectedTraslado.value = null
    fetchTraslados()
    setTimeout(() => successMsg.value = '', 5000)
  } catch (error: any) {
    errorMsg.value = error.response?.data?.message || 'Error al ingresar efectivo'
    setTimeout(() => errorMsg.value = '', 5000)
  }
}

const openDetails = (t: any) => {
  selectedTraslado.value = t
}

onMounted(() => fetchInitialData())
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
</style>
