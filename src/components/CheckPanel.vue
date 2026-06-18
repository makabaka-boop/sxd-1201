<script setup lang="ts">
import { ref } from "vue";
import {
  AlertTriangle,
  AlertCircle,
  Hash,
  Ruler,
  FileWarning,
  ChevronDown,
  ChevronUp,
  Clock,
  Truck,
} from "lucide-vue-next";
import { useChecker } from "@/composables/useChecker";
import type { Material } from "@/types";

const emit = defineEmits<{
  (e: "edit", material: Material): void;
  (e: "scroll-to", id: string): void;
}>();

const { checkResult, totalIssues } = useChecker();

const expandedSections = ref({
  zeroQuantity: true,
  duplicateOrder: true,
  missingSize: true,
  missingRisk: true,
  missingExpectedArrival: true,
  overdueNotArrived: true,
});

type SectionKey = keyof typeof expandedSections.value;

function toggleSection(key: SectionKey) {
  expandedSections.value[key] = !expandedSections.value[key];
}

function handleItemClick(material: Material) {
  emit("edit", material);
}
</script>

<template>
  <aside class="w-72 bg-dark-800 border-l border-dark-700 p-4 overflow-y-auto">
    <div class="flex items-center gap-2 mb-4">
      <AlertTriangle class="w-4 h-4 text-primary-400" />
      <h2 class="text-sm font-medium text-white">自动检查</h2>
      <span
        v-if="totalIssues > 0"
        class="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400"
      >
        {{ totalIssues }} 项
      </span>
    </div>

    <div v-if="totalIssues === 0" class="py-8 text-center">
      <div class="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="text-sm text-dark-300">所有检查通过</p>
      <p class="text-xs text-dark-500 mt-1">物料数据完整无误</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="section in [
          { key: 'zeroQuantity', title: '数量为零', icon: AlertCircle, color: 'text-red-400', data: checkResult.zeroQuantity },
          { key: 'duplicateOrder', title: '顺序重复', icon: Hash, color: 'text-orange-400', data: checkResult.duplicateOrder },
          { key: 'missingSize', title: '尺寸缺失', icon: Ruler, color: 'text-yellow-400', data: checkResult.missingSize },
          { key: 'missingRisk', title: '风险未填', icon: FileWarning, color: 'text-blue-400', data: checkResult.missingRisk },
          { key: 'missingExpectedArrival', title: '预计到场时间缺失', icon: Clock, color: 'text-purple-400', data: checkResult.missingExpectedArrival },
          { key: 'overdueNotArrived', title: '已逾期未到场', icon: Truck, color: 'text-red-400', data: checkResult.overdueNotArrived },
        ]"
        :key="section.key"
        class="rounded-lg border border-dark-700 overflow-hidden"
      >
        <button
          @click="toggleSection(section.key as SectionKey)"
          class="w-full flex items-center justify-between px-3 py-2.5 bg-dark-750 hover:bg-dark-700 transition-colors"
        >
          <div class="flex items-center gap-2">
            <component :is="section.icon" class="w-4 h-4" :class="section.color" />
            <span class="text-sm text-dark-200">{{ section.title }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-dark-400">{{ section.data.length }} 项</span>
            <ChevronUp
              v-if="expandedSections[section.key as SectionKey]"
              class="w-4 h-4 text-dark-400"
            />
            <ChevronDown v-else class="w-4 h-4 text-dark-400" />
          </div>
        </button>

        <div v-if="expandedSections[section.key as SectionKey]" class="border-t border-dark-700">
          <div v-if="section.data.length === 0" class="px-3 py-4 text-center text-xs text-dark-500">
            暂无异常
          </div>
          <div v-else class="divide-y divide-dark-700/50">
            <button
              v-for="item in section.data"
              :key="item.id"
              @click="handleItemClick(item)"
              class="w-full text-left px-3 py-2 hover:bg-dark-700/50 transition-colors"
            >
              <p class="text-sm text-dark-200 truncate">{{ item.name || '未命名物料' }}</p>
              <p class="text-xs text-dark-500">
                <span v-if="item.theme">{{ item.theme }} · </span>
                <span v-if="item.area">{{ item.area }} · </span>
                <span v-if="item.arrivalBatch">批次 {{ item.arrivalBatch }} · </span>
                顺序 {{ item.order }}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
