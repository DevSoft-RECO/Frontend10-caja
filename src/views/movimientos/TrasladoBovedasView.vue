<template>
  <div class="p-6 w-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-azul-cope to-verde-cope bg-clip-text text-transparent">
          Mis Traslados de Bóvedas
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Inicia peticiones de efectivo o envíos a otras agencias y realiza el seguimiento de tus solicitudes.
        </p>
      </div>

      <!-- Pestañas de Vista -->
      <div class="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 self-start md:self-auto">
        <button
          @click="activeViewTab = 'nuevo'"
          class="px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all"
          :class="activeViewTab === 'nuevo' ? 'bg-white dark:bg-gray-700 text-azul-cope shadow' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
        >
          Nuevo Traslado
        </button>
        <button
          @click="activeViewTab = 'tracking'"
          class="px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all"
          :class="activeViewTab === 'tracking' ? 'bg-white dark:bg-gray-700 text-azul-cope shadow' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
        >
          Seguimiento Propio
        </button>
      </div>
    </div>

    <!-- Alertas de respuesta -->
    <div v-if="successMsg" class="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400 text-sm font-bold flex items-center gap-2">
      <span>✅</span> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 text-sm font-bold flex items-center gap-2">
      <span>⚠️</span> {{ errorMsg }}
    </div>

    <!-- VISTA: NUEVO TRASLADO -->
    <div v-if="activeViewTab === 'nuevo'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Panel de Configuración -->
      <div class="bg-white/85 dark:bg-gray-800/85 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-lg space-y-4 md:col-span-1">
        <h3 class="text-xs font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-2">Configuración del Traslado</h3>

        <!-- Tipo de Traslado -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">Acción Operativa</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="tipoTraslado = 'pedir'; clearFormValues()"
              class="py-2.5 px-3 rounded-xl text-xs font-bold border transition-all"
              :class="tipoTraslado === 'pedir' ? 'bg-azul-cope/10 border-azul-cope text-azul-cope' : 'border-gray-200 dark:border-gray-700 text-gray-500'"
            >
              Pedir Efectivo
            </button>
            <button
              @click="tipoTraslado = 'enviar'; clearFormValues()"
              class="py-2.5 px-3 rounded-xl text-xs font-bold border transition-all"
              :class="tipoTraslado === 'enviar' ? 'bg-verde-cope/10 border-verde-cope text-verde-cope' : 'border-gray-200 dark:border-gray-700 text-gray-500'"
            >
              Enviar Efectivo
            </button>
          </div>
        </div>

        <!-- Bóveda Origen -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">
            Bóveda Origen (Entrega)
          </label>
          <select
            v-model="bovedaOrigenId"
            @change="onBovedaOrigenChange"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-bold transition-all"
          >
            <option :value="null" disabled class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">Seleccionar origen</option>
            <option v-for="caja in bovedasDisponibles" :key="caja.id" :value="caja.id" class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">
              {{ caja.nombre }} ({{ caja.agencia?.nombre }})
            </option>
          </select>
        </div>

        <!-- Bóveda Destino -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">
            Bóveda Destino (Recibe)
          </label>
          <select
            v-model="bovedaDestinoId"
            class="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent text-sm font-bold transition-all"
          >
            <option :value="null" disabled class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">Seleccionar destino</option>
            <option v-for="caja in bovedasDestinoFiltradas" :key="caja.id" :value="caja.id" class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">
              {{ caja.nombre }} ({{ caja.agencia?.nombre }})
            </option>
          </select>
        </div>

        <!-- Fecha Programada (Solo enviar requiere o permite de una vez) -->
        <div v-if="tipoTraslado === 'enviar'">
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">
            Fecha Programada de Arribo
          </label>
          <input
            v-model="fechaProgramada"
            type="datetime-local"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope text-sm font-bold transition-all"
          />
        </div>

        <!-- Repartidor -->
        <div v-if="tipoTraslado === 'enviar'">
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">
            Nombre del Repartidor
          </label>
          <input
            v-model="repartidor"
            type="text"
            placeholder="Ej. Juan Pérez - Transporte"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope text-sm font-bold transition-all"
          />
        </div>

        <!-- Comentario de Petición o Envío -->
        <div>
          <label class="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2">
            {{ tipoTraslado === 'pedir' ? 'Comentario de Petición' : 'Comentario de Envío' }}
          </label>
          <textarea
            v-model="comentario"
            rows="2"
            :placeholder="tipoTraslado === 'pedir' ? 'Detalla la necesidad del efectivo...' : 'Notas sobre el envío físico...'"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope text-sm font-medium transition-all"
          ></textarea>
        </div>

      <!-- Resumen de Envío -->
        <div class="pt-4 border-t border-gray-150 dark:border-gray-750 text-xs space-y-2">
          <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
            <span>Total de Piezas:</span>
            <span class="font-bold font-mono text-gray-800 dark:text-white">{{ totalPiezas }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
            <span>Monto Total:</span>
            <span class="text-base font-extrabold font-mono text-azul-cope dark:text-cyan-400">{{ formatCurrency(totalMonto) }}</span>
          </div>
        </div>

        <button
          @click="submitTraslado"
          :disabled="loadingSubmit || !bovedaOrigenId || !bovedaDestinoId || totalMonto === 0 || (tipoTraslado === 'enviar' && !repartidor)"
          class="w-full inline-flex items-center justify-center py-3 bg-azul-cope hover:bg-azul-cope/90 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 gap-2 text-sm cursor-pointer"
        >
          <span v-if="loadingSubmit" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ tipoTraslado === 'pedir' ? 'Crear Solicitud de Efectivo' : 'Enviar Efectivo' }}</span>
        </button>
      </div>

      <!-- Panel de Desglose Físico -->
      <div class="bg-white/85 dark:bg-gray-800/85 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-lg md:col-span-2 space-y-4">
        
        <!-- Pestañas Tipo Denominación -->
        <div class="flex border-b border-gray-150 dark:border-gray-750 select-none">
          <button
            @click="activeTab = 'billete'"
            class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
            :class="activeTab === 'billete' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Billetes
          </button>
          <button
            @click="activeTab = 'moneda'"
            class="px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2"
            :class="activeTab === 'moneda' ? 'border-azul-cope text-azul-cope' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'"
          >
            Monedas
          </button>
        </div>

        <div v-if="!bovedaOrigenId" class="text-center py-16 text-gray-450 italic text-sm">
          Por favor, seleccione la Bóveda Origen para verificar la disponibilidad de efectivo.
        </div>

        <div v-else-if="loadingStock" class="flex flex-col items-center justify-center py-16 space-y-3">
          <div class="w-8 h-8 border-3 border-azul-cope border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs font-bold text-gray-400 uppercase">Consultando disponibilidad en Bóveda...</p>
        </div>

        <!-- Inputs de Cantidades -->
        <div v-else class="space-y-3 overflow-y-auto max-h-[50vh] pr-2">
          <div
            v-for="denom in currentList"
            :key="denom.id"
            class="p-3.5 rounded-2xl bg-gray-55 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-750 flex items-center justify-between gap-4 transition-all"
            :class="Number(denom.cantidad_enviar) > (stockDisponible[denom.id] || 0) && tipoTraslado === 'enviar' ? 'border-red-300 bg-red-50/20' : ''"
          >
            <div class="flex-1">
              <span class="block font-bold text-gray-900 dark:text-white">{{ denom.nombre }}</span>
              <span class="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Disponible en Bóveda: {{ stockDisponible[denom.id] || 0 }} piezas
              </span>
            </div>

            <!-- Cantidad input -->
            <div class="flex items-center gap-3 w-48 justify-end">
              <input
                v-model.number="denom.cantidad_enviar"
                type="number"
                min="0"
                :max="tipoTraslado === 'enviar' ? (stockDisponible[denom.id] || 0) : undefined"
                @input="validateInput(denom)"
                class="block w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-655 rounded-xl bg-white dark:bg-gray-750 text-gray-950 dark:text-white font-mono font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-azul-cope focus:border-transparent transition-all"
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

    <!-- VISTA: SEGUIMIENTO PROPIO -->
    <div v-else class="space-y-4">
      <!-- Filtro de Bóveda Local -->
      <div class="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div class="flex-1 w-full">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Seleccione su Bóveda Local para filtrar seguimiento</label>
          <select
            v-model="bovedaLocalFiltroId"
            class="block w-full sm:w-80 px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-azul-cope text-sm font-bold transition-all"
          >
            <option :value="null" class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">-- Ver Todos los Traslados Propios --</option>
            <option v-for="caja in bovedasDisponibles" :key="caja.id" :value="caja.id" class="bg-white dark:bg-gray-800 text-gray-950 dark:text-white">
              {{ caja.nombre }} ({{ caja.agencia?.nombre }})
            </option>
          </select>
        </div>
        <button
          @click="fetchTraslados"
          class="px-5 py-2.5 bg-gray-150 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>🔄</span> Refrescar
        </button>
      </div>

      <!-- Resumen de Efectivo en Tránsito Local -->
      <div v-if="!loadingList && bovedaLocalFiltroId !== null" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Entrante Card -->
        <div class="p-5 bg-amber-50 dark:bg-amber-955/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">📥 Tránsito Entrante</span>
            <span class="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
              {{ formatCurrency(enTransitoEntrante) }}
            </span>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Efectivo enviado por otra bóveda hacia esta sucursal.</p>
          </div>
          <div class="p-3 bg-amber-100 dark:bg-amber-900/25 text-amber-750 dark:text-amber-400 rounded-xl text-2xl select-none">
            🚚
          </div>
        </div>

        <!-- Saliente Card -->
        <div class="p-5 bg-red-50/60 dark:bg-red-955/10 border border-red-200/40 dark:border-red-900/20 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span class="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider block mb-1">📤 Tránsito Saliente</span>
            <span class="text-2xl font-black text-red-650 dark:text-red-400 font-mono">
              {{ formatCurrency(enTransitoSaliente) }}
            </span>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Efectivo despachado por esta sucursal hacia otra bóveda.</p>
          </div>
          <div class="p-3 bg-red-100/70 dark:bg-red-900/25 text-red-500 dark:text-red-400 rounded-xl text-2xl select-none">
            📤
          </div>
        </div>
      </div>

      <div v-if="loadingList" class="flex flex-col items-center justify-center py-20 space-y-3">
        <div class="w-8 h-8 border-3 border-azul-cope border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-500">Cargando traslados propios...</p>
      </div>

      <div v-else-if="trasladosPropiosFiltrados.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-250 dark:border-gray-800 text-gray-450 italic text-sm">
        No se encontraron traslados de bóveda propios para esta selección.
      </div>

      <div v-else class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID / Tipo</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Origen (Entrega)</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destino (Recibe)</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Monto</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Estado</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150 dark:divide-gray-750">
              <tr v-for="traslado in trasladosPropiosFiltrados" :key="traslado.id" class="hover:bg-gray-55/50 dark:hover:bg-gray-700/20 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-gray-400">#{{ traslado.id }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      :class="traslado.tipo_traslado === 'pedir' ? 'bg-azul-cope/10 text-azul-cope' : 'bg-verde-cope/10 text-verde-cope'">
                      {{ traslado.tipo_traslado === 'pedir' ? '📥 Petición' : '📤 Envío' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-gray-800 dark:text-gray-200">{{ traslado.origen_boveda?.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ traslado.origen_boveda?.agencia?.nombre }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-gray-800 dark:text-gray-200">{{ traslado.destino_boveda?.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ traslado.destino_boveda?.agencia?.nombre }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(traslado.monto_total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border"
                    :class="getStatusBadgeClass(traslado.estado)">
                    {{ getStatusLabel(traslado.estado) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    @click="selectedTraslado = traslado"
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

    <!-- MODAL DETALLES DEL TRASLADO -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="selectedTraslado" class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-850 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-750 flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between bg-gray-50 dark:bg-gray-900/30">
            <div class="flex items-center gap-3">
              <span class="text-lg font-extrabold text-gray-900 dark:text-white">Traslado #{{ selectedTraslado.id }}</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                :class="selectedTraslado.tipo_traslado === 'pedir' ? 'bg-azul-cope/10 text-azul-cope' : 'bg-verde-cope/10 text-verde-cope'">
                {{ selectedTraslado.tipo_traslado === 'pedir' ? '📥 Petición' : '📤 Envío' }}
              </span>
            </div>
            <button @click="selectedTraslado = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-xl cursor-pointer p-1">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-6">
            <!-- Grid Información -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/20 p-5 rounded-2xl border border-gray-150 dark:border-gray-800">
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Origen (Entrega)</h4>
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
                      {{ formatDate(selectedTraslado.fecha_programada) }}
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
            <div v-if="selectedTraslado.comentario_peticion || selectedTraslado.comentario_envio" class="space-y-2">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Notas de Operación</h4>
              <div class="p-4 bg-yellow-50/50 dark:bg-yellow-950/10 border-l-4 border-yellow-400 rounded-r-2xl text-sm italic text-gray-700 dark:text-gray-300">
                <p v-if="selectedTraslado.comentario_peticion"><span class="font-bold not-italic text-gray-500">Petición:</span> "{{ selectedTraslado.comentario_peticion }}"</p>
                <p v-if="selectedTraslado.comentario_envio" class="mt-1"><span class="font-bold not-italic text-gray-500">Envío:</span> "{{ selectedTraslado.comentario_envio }}"</p>
              </div>
            </div>

            <!-- Nuevo Diseño de Stepper (Seguimiento del Tracking) -->
            <div class="space-y-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Línea de Tiempo del Traslado</h4>
              
              <div class="relative py-4">
                <!-- Línea de Fondo -->
                <div class="absolute top-1/2 left-4 right-4 h-1 bg-gray-250 dark:bg-gray-700 -translate-y-1/2 rounded-full hidden md:block"></div>

                <!-- Stepper Horizontal (md o mayor) -->
                <div class="relative flex justify-between gap-4 flex-col md:flex-row">
                  <template v-if="selectedTraslado.tipo_traslado === 'pedir'">
                    <div
                      v-for="(step, idx) in stepsPedir"
                      :key="step.key"
                      class="flex md:flex-col items-center flex-1 text-center relative group"
                    >
                      <!-- Línea de progreso activa entre pasos -->
                      <div
                        v-if="idx < stepsPedir.length - 1"
                        class="absolute top-1/2 left-[50%] right-[-50%] h-1 -translate-y-1/2 hidden md:block z-0"
                        :class="isStepActive(selectedTraslado.estado, stepsPedir[idx + 1].states) ? 'bg-emerald-500' : 'bg-gray-250 dark:bg-gray-700'"
                      ></div>

                      <!-- Círculo de Paso -->
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-350 border-2 select-none"
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
                          {{ isStepCurrent(selectedTraslado.estado, step.states) ? 'Activo' : isStepActive(selectedTraslado.estado, step.states) ? 'Completado' : 'Pendiente' }}
                        </p>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div
                      v-for="(step, idx) in stepsEnviar"
                      :key="step.key"
                      class="flex md:flex-col items-center flex-1 text-center relative group"
                    >
                      <!-- Línea de progreso activa entre pasos -->
                      <div
                        v-if="idx < stepsEnviar.length - 1"
                        class="absolute top-1/2 left-[50%] right-[-50%] h-1 -translate-y-1/2 hidden md:block z-0"
                        :class="isStepActive(selectedTraslado.estado, stepsEnviar[idx + 1].states) ? 'bg-emerald-500' : 'bg-gray-250 dark:bg-gray-700'"
                      ></div>

                      <!-- Círculo de Paso -->
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-350 border-2 select-none"
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
                          {{ isStepCurrent(selectedTraslado.estado, step.states) ? 'Activo' : isStepActive(selectedTraslado.estado, step.states) ? 'Completado' : 'Pendiente' }}
                        </p>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Acciones -->
          <div class="px-6 py-5 border-t border-gray-150 dark:border-gray-750 flex flex-wrap items-center justify-end gap-3 bg-gray-55 dark:bg-gray-900/30">
            <!-- Acción: Confirmar Recepción Paquete (Solo pedir, estado enviado) -->
            <button
              v-if="selectedTraslado.tipo_traslado === 'pedir' && selectedTraslado.estado === 'enviado'"
              @click="updateStatus(selectedTraslado.id, 'confirmar-recepcion-paquete')"
              class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Confirmar Recepción Paquete
            </button>

            <!-- Acción: Confirmar Ingreso Efectivo (Solo para el flujo PEDIR, cuando ya tiene el paquete recibido) -->
            <button
              v-if="selectedTraslado.tipo_traslado === 'pedir' && selectedTraslado.estado === 'paquete_recibido'"
              @click="updateStatus(selectedTraslado.id, 'confirmar-ingreso')"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Confirmar Ingreso a Bóveda (Acreditar)
            </button>

            <!-- Acción: Cancelar Solicitud -->
            <button
              v-if="!['ingresado', 'cancelado'].includes(selectedTraslado.estado)"
              @click="cancelarTraslado(selectedTraslado.id)"
              class="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar Traslado
            </button>

            <button @click="selectedTraslado = null" class="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
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

interface Caja {
  id: number
  nombre: string
  tipo_caja: string
  agencia_id: number
  agencia?: {
    id: number
    nombre: string
  }
}

interface Denominacion {
  id: number
  nombre: string
  valor: number
  tipo: 'billete' | 'moneda'
  cantidad_enviar?: number
}

interface Traslado {
  id: number
  origen_boveda_id: number
  destino_boveda_id: number
  tipo_traslado: 'pedir' | 'enviar'
  monto_total: number
  fecha_programada?: string
  repartidor?: string
  comentario_peticion?: string
  comentario_envio?: string
  usuario_creador_id: number
  estado: string
  origen_boveda?: Caja
  destino_boveda?: Caja
  creador?: {
    id: number
    name: string
  }
}

const activeViewTab = ref<'nuevo' | 'tracking'>('nuevo')
const activeTab = ref<'billete' | 'moneda'>('billete')
const loadingStock = ref(false)
const loadingSubmit = ref(false)
const loadingList = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const bovedaOrigenId = ref<number | null>(null)
const bovedaDestinoId = ref<number | null>(null)
const bovedaLocalFiltroId = ref<number | null>(null)
const tipoTraslado = ref<'pedir' | 'enviar'>('pedir')
const fechaProgramada = ref<string>('')
const repartidor = ref<string>('')
const comentario = ref<string>('')

const cajasList = ref<Caja[]>([])
const denominacionesList = ref<Denominacion[]>([])
const stockDisponible = ref<Record<number, number>>({})
const trasladosList = ref<Traslado[]>([])

const selectedTraslado = ref<Traslado | null>(null)

const stepsPedir = [
  { key: 'solicitado', states: ['pendiente', 'solicitud_recibida', 'programado', 'enviado', 'paquete_recibido', 'ingresado'], label: 'Solicitado', icon: '📝' },
  { key: 'recibido', states: ['solicitud_recibida', 'programado', 'enviado', 'paquete_recibido', 'ingresado'], label: 'Recibido', icon: '🤝' },
  { key: 'programado', states: ['programado', 'enviado', 'paquete_recibido', 'ingresado'], label: 'Programado', icon: '📅' },
  { key: 'enviado', states: ['enviado', 'paquete_recibido', 'ingresado'], label: 'Enviado', icon: '🚚' },
  { key: 'paquete_recibido', states: ['paquete_recibido', 'ingresado'], label: 'En Destino', icon: '📦' },
  { key: 'ingresado', states: ['ingresado'], label: 'Depositado', icon: '🏦' }
]

const stepsEnviar = [
  { key: 'enviado', states: ['enviado', 'enterado', 'ingresado'], label: 'Enviado', icon: '🚚' },
  { key: 'enterado', states: ['enterado', 'ingresado'], label: 'Enterado', icon: '👀' },
  { key: 'ingresado', states: ['ingresado'], label: 'Depositado', icon: '🏦' }
]

const getStatusLabel = (estado: string) => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    solicitud_recibida: 'Recibido',
    programado: 'Programado',
    enviado: 'Enviado',
    paquete_recibido: 'En Destino',
    ingresado: 'Depositado',
    cancelado: 'Cancelado',
    enterado: 'Enterado'
  }
  return labels[estado] || estado
}

const getStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'ingresado':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
    case 'cancelado':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
    case 'pendiente':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30'
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
  }
}

const isStepActive = (estadoActual: string, targetEstados: string[]) => {
  return targetEstados.includes(estadoActual)
}

const isStepCurrent = (estadoActual: string, targetEstados: string[]) => {
  return estadoActual === targetEstados[targetEstados.length - 1]
}

// Computeds
const bovedasDisponibles = computed(() => {
  return cajasList.value.filter(c => c.tipo_caja === 'boveda')
})

const bovedasDestinoFiltradas = computed(() => {
  return bovedasDisponibles.value.filter(c => c.id !== bovedaOrigenId.value)
})

const currentList = computed(() => {
  return denominacionesList.value.filter(d => d.tipo === activeTab.value)
})

const totalPiezas = computed(() => {
  return denominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_enviar) || 0), 0)
})

const totalMonto = computed(() => {
  return denominacionesList.value.reduce((sum, d) => sum + (Number(d.cantidad_enviar) || 0) * d.valor, 0)
})

// Filtrar traslados propios iniciados:
// - Para 'pedir': la bóveda local es la DESTINO (quien inició la petición).
// - Para 'enviar': la bóveda local es la ORIGEN (quien inició el envío).
const trasladosPropiosFiltrados = computed(() => {
  return trasladosList.value.filter(t => {
    if (bovedaLocalFiltroId.value === null) {
      return true
    }
    if (t.tipo_traslado === 'pedir') {
      return t.destino_boveda_id === bovedaLocalFiltroId.value
    } else {
      return t.origen_boveda_id === bovedaLocalFiltroId.value
    }
  })
})

const enTransitoEntrante = computed(() => {
  if (bovedaLocalFiltroId.value === null) return 0
  return trasladosList.value.reduce((sum, t) => {
    const esDestino = t.destino_boveda_id === bovedaLocalFiltroId.value
    const enTransito = ['enviado', 'enterado', 'paquete_recibido'].includes(t.estado)
    return sum + (esDestino && enTransito ? t.monto_total : 0)
  }, 0)
})

const enTransitoSaliente = computed(() => {
  if (bovedaLocalFiltroId.value === null) return 0
  return trasladosList.value.reduce((sum, t) => {
    const esOrigen = t.origen_boveda_id === bovedaLocalFiltroId.value
    const enTransito = ['enviado', 'enterado', 'paquete_recibido'].includes(t.estado)
    return sum + (esOrigen && enTransito ? t.monto_total : 0)
  }, 0)
})

const clearFormValues = () => {
  bovedaOrigenId.value = null
  bovedaDestinoId.value = null
  fechaProgramada.value = ''
  repartidor.value = ''
  comentario.value = ''
  denominacionesList.value.forEach(d => {
    d.cantidad_enviar = undefined
  })
}

// Acciones de stock
const onBovedaOrigenChange = async () => {
  if (!bovedaOrigenId.value) return
  bovedaDestinoId.value = null
  loadingStock.value = true
  errorMsg.value = ''
  successMsg.value = ''

  // Limpiar inputs
  denominacionesList.value.forEach(d => {
    d.cantidad_enviar = undefined
  })

  try {
    const res = await axios.get('/reportes/dashboard-general', {
      params: { agencia_id: cajasList.value.find(c => c.id === bovedaOrigenId.value)?.agencia_id }
    })

    const matriz = res.data.matriz
    const bovedaId = bovedaOrigenId.value

    const tempStock: Record<number, number> = {}
    denominacionesList.value.forEach(d => {
      const row = matriz[bovedaId]?.[d.id]
      if (row) {
        tempStock[d.id] = Number(row.saldo_inicial_cantidad || 0) + Number(row.ingresos_cantidad || 0) - Number(row.egresos_cantidad || 0)
      } else {
        tempStock[d.id] = 0
      }
    })
    stockDisponible.value = tempStock

  } catch (err) {
    errorMsg.value = 'No se pudo cargar el saldo disponible de la Bóveda origen.'
  } finally {
    loadingStock.value = false
  }
}

const validateInput = (denom: Denominacion) => {
  if (tipoTraslado.value === 'enviar') {
    const stock = stockDisponible.value[denom.id] || 0
    if (denom.cantidad_enviar && denom.cantidad_enviar > stock) {
      denom.cantidad_enviar = stock
    }
  }
  if (denom.cantidad_enviar && denom.cantidad_enviar < 0) {
    denom.cantidad_enviar = 0
  }
}

// Envío de Formulario
const submitTraslado = async () => {
  if (!bovedaOrigenId.value || !bovedaDestinoId.value || totalMonto.value === 0) return

  loadingSubmit.value = true
  successMsg.value = ''
  errorMsg.value = ''

  const detalles = denominacionesList.value
    .filter(d => Number(d.cantidad_enviar) > 0)
    .map(d => ({
      denominacion_id: d.id,
      cantidad: Number(d.cantidad_enviar)
    }))

  try {
    await axios.post('/cajas/traslado-bovedas', {
      boveda_origen_id: bovedaOrigenId.value,
      boveda_destino_id: bovedaDestinoId.value,
      tipo_traslado: tipoTraslado.value,
      fecha_programada: fechaProgramada.value || null,
      repartidor: repartidor.value || null,
      comentario_peticion: tipoTraslado.value === 'pedir' ? comentario.value : null,
      comentario_envio: tipoTraslado.value === 'enviar' ? comentario.value : null,
      detalles: detalles
    })

    successMsg.value = `¡Operación de traslado registrada exitosamente!`
    clearFormValues()
    fetchTraslados()
    activeViewTab.value = 'tracking'
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al ejecutar el traslado de bóveda.'
  } finally {
    loadingSubmit.value = false
  }
}

// Acciones sobre traslados específicos
const updateStatus = async (id: number, endpoint: string) => {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await axios.post(`/cajas/traslado-bovedas/${id}/${endpoint}`)
    successMsg.value = 'Estado de traslado actualizado exitosamente.'
    await fetchTraslados()
    if (selectedTraslado.value && selectedTraslado.value.id === id) {
      selectedTraslado.value = trasladosList.value.find(t => t.id === id) || null
    }
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al actualizar el estado de traslado.'
  }
}

const cancelarTraslado = async (id: number) => {
  if (!confirm('¿Está seguro de que desea cancelar esta solicitud?')) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await axios.delete(`/cajas/traslado-bovedas/${id}`)
    successMsg.value = 'Solicitud de traslado cancelada.'
    await fetchTraslados()
    if (selectedTraslado.value && selectedTraslado.value.id === id) {
      selectedTraslado.value = trasladosList.value.find(t => t.id === id) || null
    }
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Error al cancelar la solicitud.'
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val)
}

const formatDate = (val: string) => {
  return new Date(val).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
}


const fetchTraslados = async () => {
  loadingList.value = true
  try {
    const res = await axios.get('/cajas/traslado-bovedas')
    trasladosList.value = res.data
  } catch (err) {
    errorMsg.value = 'Error al cargar el historial de traslados.'
  } finally {
    loadingList.value = false
  }
}

const fetchData = async () => {
  try {
    const [resCajas, resDenom] = await Promise.all([
      axios.get('/cajas'),
      axios.get('/denominaciones')
    ])
    cajasList.value = resCajas.data
    denominacionesList.value = resDenom.data.map((d: any) => ({
      ...d,
      cantidad_enviar: undefined
    }))
  } catch (err) {
    errorMsg.value = 'Error al precargar agencias y denominaciones.'
  }
}

onMounted(() => {
  fetchData()
  fetchTraslados()
})
</script>
