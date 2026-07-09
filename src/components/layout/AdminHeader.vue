<template>
  <header
    class="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-6
           bg-azul-cope dark:bg-gray-900
           border-none shadow-xs transition-all duration-300"
  >
    <div class="flex items-center gap-4">

      <!-- Mobile Sidebar Toggle -->
      <button
        @click="layoutStore.toggleSidebar"
        class="md:hidden p-2 rounded-xl text-gray-200 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <svg class="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <!-- Desktop Sidebar Toggle -->
      <button
        @click="layoutStore.toggleCollapse"
        class="hidden md:flex p-2 rounded-xl text-gray-200 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <svg
            class="w-5.5 h-5.5 transition-transform duration-300"
            :class="layoutStore.isCollapsed ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      <!-- Branding / Left side -->
      <div class="flex flex-col ml-1">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-verde-cope animate-pulse"></span>
          <span class="text-[9px] font-bold text-gray-300/80 dark:text-gray-500 uppercase tracking-widest leading-none">
            Sistema Centralizado
          </span>
        </div>
      </div>
    </div>

    <!-- Centered Protruding Notch -->
    <div
      class="absolute left-1/2 -translate-x-1/2 top-full bg-azul-cope dark:bg-gray-900
             px-8 py-2 rounded-b-2xl flex items-center justify-center gap-2 z-20 transition-all duration-300"
    >
      <!-- Left Inverted Curve (iPhone Notch style) -->
      <svg class="absolute right-full top-0 -mr-[1px] -mt-[1px] w-3.5 h-3.5 text-azul-cope dark:text-gray-900 fill-current pointer-events-none" viewBox="0 0 10 10">
        <path d="M 0 0 L 10 0 L 10 10 A 10 10 0 0 0 0 0 Z" />
      </svg>

      <!-- Right Inverted Curve (iPhone Notch style) -->
      <svg class="absolute left-full top-0 -ml-[1px] -mt-[1px] w-3.5 h-3.5 text-azul-cope dark:text-gray-900 fill-current pointer-events-none" viewBox="0 0 10 10">
        <path d="M 10 0 L 0 0 L 0 10 A 10 10 0 0 1 10 0 Z" />
      </svg>

      <span class="w-1.5 h-1.5 rounded-full bg-verde-cope"></span>
      <span class="text-xs font-black text-white uppercase tracking-wider select-none leading-none">
        {{ currentRouteTitle }}
      </span>
    </div>

    <!-- Right Side Actions -->
    <div class="flex items-center gap-3">

       <!-- Theme Toggle -->
       <button
        @click="layoutStore.toggleTheme"
        class="p-2 rounded-xl text-gray-250 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white active:scale-95 transition-all duration-250 focus:outline-none cursor-pointer"
        title="Cambiar Tema"
      >
        <svg v-if="layoutStore.isDark" class="w-5.5 h-5.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <span class="w-px h-6 bg-white/10 dark:bg-gray-800 hidden md:block"></span>

      <!-- Perfil y Logout Directo (Según Guía PKCE) -->
      <div class="flex items-center gap-3">
          <div class="hidden md:block text-right">
              <p class="text-xs font-extrabold text-white dark:text-gray-250 leading-tight">{{ userName }}</p>
              <p class="text-[10px] font-bold text-gray-300/80 dark:text-gray-550 uppercase tracking-wider leading-none mt-0.5">{{ userAgencia }}</p>
          </div>

          <div class="relative group/avatar">
            <img
                v-if="userPhoto"
                :src="userPhoto"
                class="h-8.5 w-8.5 rounded-full object-cover border border-verde-cope/40 group-hover/avatar:border-verde-cope shadow-xs transition-all duration-300"
                alt="Avatar"
            >
            <div
                v-else
                class="h-8.5 w-8.5 rounded-full bg-white/10 text-white flex items-center justify-center font-black text-xs border border-verde-cope/35 group-hover/avatar:border-verde-cope transition-all duration-300"
            >
                {{ userInitials }}
            </div>
          </div>

          <span class="w-px h-6 bg-white/10 dark:bg-gray-800"></span>

          <!-- Botón Destructivo (A la vista, SIN dropdowns) -->
          <button
            @click="handleReturnToMother"
            class="p-2 rounded-xl text-red-300 hover:bg-white/10 dark:text-red-400 dark:hover:bg-gray-800/60 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Regresar al portal"
          >
            <!-- Icono de Salir/Logout Seguido -->
            <svg class="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
      </div>
    </div>

  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useLayoutStore } from "@/stores/layout"
import { useAuthStore } from "@/stores/auth"
import { getAvatarUrl } from "@/utils/imageUtils"

const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const route = useRoute()

const isDropdownOpen = ref(false)

// Datos del usuario (Protegidos contra null)
const userName = computed(() => authStore.user?.name || "Usuario")

/**
 * TOGGLE DE BACKEND: 
 * Descomenta la línea según el backend que estés utilizando.
 */
// const userAgencia = computed(() => authStore.user?.agencia || "Sin Agencia") // BACKEND GO (Retorna String)
const userAgencia = computed(() => authStore.user?.agencia?.nombre || "Sin Agencia") // BACKEND LARAVEL (Retorna Objeto)

const userPhoto = computed(() => getAvatarUrl(authStore.user?.avatar) || null)

// Título dinámico
const currentRouteTitle = computed(() => route.meta?.title || 'Panel')

// Iniciales
const userInitials = computed(() => {
    return (userName.value || "U").substring(0, 2).toUpperCase()
})

const handleReturnToMother = () => {
    isDropdownOpen.value = false
    // 1. Destrucción local profunda (sessionStorage) para garantizar recarga SSO al volver
    authStore.logoutLocal() 
    
    // 2. Redirección limpia a la URL visual de la Madre
    window.location.href = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
}


// Asegurar que tenemos datos al cargar
onMounted(async () => {
    if (!authStore.user) {
        // Intentamos recuperar la sesión si existe token
        await authStore.checkAuth()
    }
})
</script>
