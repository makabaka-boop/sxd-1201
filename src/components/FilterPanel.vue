<script setup lang="ts">
import { Filter, X, ChevronDown, ChevronUp } from "lucide-vue-next";
import { ref } from "vue";
import { useFilter } from "@/composables/useFilter";
import { useMaterials } from "@/composables/useMaterials";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  ARRIVAL_STATUS_LABELS,
  ARRIVAL_STATUS_COLORS,
} from "@/types";
import type { MaterialStatus, ArrivalStatus } from "@/types";

const {
  filter,
  toggleStatus,
  setTheme,
  setArea,
  setQuantityMin,
  setQuantityMax,
  setArrivalBatch,
  toggleArrivalStatus,
  clearFilters,
  hasActiveFilters,
} = useFilter();
const { themes, areas, arrivalBatches } = useMaterials();

const showThemeDropdown = ref(false);
const showAreaDropdown = ref(false);
const showArrivalBatchDropdown = ref(false);

const statusOptions: MaterialStatus[] = ["pending-prep", "pending-review", "ready", "hold"];
const arrivalStatusOptions: ArrivalStatus[] = ["pending", "arrived", "overdue", "not-set"];

function selectTheme(theme: string) {
  setTheme(theme === filter.value.theme ? "" : theme);
  showThemeDropdown.value = false;
}

function selectArea(area: string) {
  setArea(area === filter.value.area ? "" : area);
  showAreaDropdown.value = false;
}

function selectArrivalBatch(batch: string) {
  setArrivalBatch(batch === filter.value.arrivalBatch ? "" : batch);
  showArrivalBatchDropdown.value = false;
}

function handleQuantityMinInput(event: Event) {
  const target = event.target as HTMLInputElement;
  setQuantityMin(target.value === "" ? null : Number(target.value));
}

function handleQuantityMaxInput(event: Event) {
  const target = event.target as HTMLInputElement;
  setQuantityMax(target.value === "" ? null : Number(target.value));
}
</script>

<template>
  <aside class="w-64 bg-dark-800 border-r border-dark-700 p-4 overflow-y-auto">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <Filter class="w-4 h-4 text-primary-400" />
        <h2 class="text-sm font-medium text-white">筛选条件</h2>
      </div>
      <button
        v-if="hasActiveFilters()"
        @click="clearFilters"
        class="text-xs text-dark-400 hover:text-dark-200 flex items-center gap-1"
      >
        <X class="w-3 h-3" />
        清除
      </button>
    </div>

    <div class="space-y-5">
      <div>
        <label class="text-xs text-dark-400 mb-2 block">展示主题</label>
        <div class="relative">
          <button
            @click="showThemeDropdown = !showThemeDropdown"
            class="w-full px-3 py-2 text-sm bg-dark-700 border border-dark-600 rounded-lg text-left text-dark-200 flex items-center justify-between hover:border-dark-500 transition-colors"
          >
            <span :class="{ 'text-dark-500': !filter.theme }">
              {{ filter.theme || "全部主题" }}
            </span>
            <ChevronDown v-if="!showThemeDropdown" class="w-4 h-4 text-dark-400" />
            <ChevronUp v-else class="w-4 h-4 text-dark-400" />
          </button>
          <div
            v-if="showThemeDropdown"
            class="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          >
            <button
              @click="selectTheme('')"
              class="w-full px-3 py-2 text-sm text-left text-dark-300 hover:bg-dark-600 transition-colors"
            >
              全部主题
            </button>
            <button
              v-for="theme in themes"
              :key="theme"
              @click="selectTheme(theme)"
              class="w-full px-3 py-2 text-sm text-left hover:bg-dark-600 transition-colors"
              :class="filter.theme === theme ? 'text-primary-400' : 'text-dark-200'"
            >
              {{ theme }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="text-xs text-dark-400 mb-2 block">所在区域</label>
        <div class="relative">
          <button
            @click="showAreaDropdown = !showAreaDropdown"
            class="w-full px-3 py-2 text-sm bg-dark-700 border border-dark-600 rounded-lg text-left text-dark-200 flex items-center justify-between hover:border-dark-500 transition-colors"
          >
            <span :class="{ 'text-dark-500': !filter.area }">
              {{ filter.area || "全部区域" }}
            </span>
            <ChevronDown v-if="!showAreaDropdown" class="w-4 h-4 text-dark-400" />
            <ChevronUp v-else class="w-4 h-4 text-dark-400" />
          </button>
          <div
            v-if="showAreaDropdown"
            class="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          >
            <button
              @click="selectArea('')"
              class="w-full px-3 py-2 text-sm text-left text-dark-300 hover:bg-dark-600 transition-colors"
            >
              全部区域
            </button>
            <button
              v-for="area in areas"
              :key="area"
              @click="selectArea(area)"
              class="w-full px-3 py-2 text-sm text-left hover:bg-dark-600 transition-colors"
              :class="filter.area === area ? 'text-primary-400' : 'text-dark-200'"
            >
              {{ area }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="text-xs text-dark-400 mb-2 block">到场批次</label>
        <div class="relative">
          <button
            @click="showArrivalBatchDropdown = !showArrivalBatchDropdown"
            class="w-full px-3 py-2 text-sm bg-dark-700 border border-dark-600 rounded-lg text-left text-dark-200 flex items-center justify-between hover:border-dark-500 transition-colors"
          >
            <span :class="{ 'text-dark-500': !filter.arrivalBatch }">
              {{ filter.arrivalBatch || "全部批次" }}
            </span>
            <ChevronDown v-if="!showArrivalBatchDropdown" class="w-4 h-4 text-dark-400" />
            <ChevronUp v-else class="w-4 h-4 text-dark-400" />
          </button>
          <div
            v-if="showArrivalBatchDropdown"
            class="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          >
            <button
              @click="selectArrivalBatch('')"
              class="w-full px-3 py-2 text-sm text-left text-dark-300 hover:bg-dark-600 transition-colors"
            >
              全部批次
            </button>
            <button
              v-for="batch in arrivalBatches"
              :key="batch"
              @click="selectArrivalBatch(batch)"
              class="w-full px-3 py-2 text-sm text-left hover:bg-dark-600 transition-colors"
              :class="filter.arrivalBatch === batch ? 'text-primary-400' : 'text-dark-200'"
            >
              {{ batch }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="text-xs text-dark-400 mb-2 block">复核状态</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in statusOptions"
            :key="status"
            @click="toggleStatus(status)"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="[
              filter.statuses.includes(status)
                ? `${STATUS_COLORS[status]} text-white`
                : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
            ]"
          >
            {{ STATUS_LABELS[status] }}
          </button>
        </div>
      </div>

      <div>
        <label class="text-xs text-dark-400 mb-2 block">到场状态</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in arrivalStatusOptions"
            :key="status"
            @click="toggleArrivalStatus(status)"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="[
              filter.arrivalStatuses.includes(status)
                ? `${ARRIVAL_STATUS_COLORS[status]} text-white`
                : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
            ]"
          >
            {{ ARRIVAL_STATUS_LABELS[status] }}
          </button>
        </div>
      </div>

      <div>
        <label class="text-xs text-dark-400 mb-2 block">数量区间</label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            :value="filter.quantityMin ?? ''"
            @input="handleQuantityMinInput"
            placeholder="最小"
            class="w-full px-3 py-2 text-sm bg-dark-700 border border-dark-600 rounded-lg text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
            min="0"
          />
          <span class="text-dark-500">-</span>
          <input
            type="number"
            :value="filter.quantityMax ?? ''"
            @input="handleQuantityMaxInput"
            placeholder="最大"
            class="w-full px-3 py-2 text-sm bg-dark-700 border border-dark-600 rounded-lg text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
            min="0"
          />
        </div>
      </div>
    </div>
  </aside>
</template>
