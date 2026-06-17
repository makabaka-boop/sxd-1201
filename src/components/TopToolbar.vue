<script setup lang="ts">
import { Plus, Download, FileCheck, AlertTriangle } from "lucide-vue-next";
import { useChecker } from "@/composables/useChecker";
import { useExport } from "@/composables/useExport";
import { useMaterials } from "@/composables/useMaterials";
import { useRouter } from "vue-router";

const emit = defineEmits<{
  (e: "add"): void;
}>();

const router = useRouter();
const { totalIssues } = useChecker();
const { materials } = useMaterials();
const { exportCSV } = useExport();

function handleExport() {
  exportCSV(materials.value);
}

function goToReview() {
  router.push("/review");
}
</script>

<template>
  <header class="bg-dark-800 border-b border-dark-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <FileCheck class="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h1 class="text-lg font-serif font-semibold text-white">
            品牌快闪物料计划
          </h1>
          <p class="text-xs text-dark-400">桌面陈列物料规划与复核工具</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="goToReview"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 text-dark-200 hover:bg-dark-600 transition-colors text-sm"
        >
          <FileCheck class="w-4 h-4" />
          <span>现场复核表</span>
        </button>

        <button
          @click="handleExport"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 text-dark-200 hover:bg-dark-600 transition-colors text-sm"
        >
          <Download class="w-4 h-4" />
          <span>导出 CSV</span>
        </button>

        <button
          @click="emit('add')"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-dark-900 hover:bg-primary-400 transition-colors text-sm font-medium"
        >
          <Plus class="w-4 h-4" />
          <span>新增物料</span>
        </button>

        <div
          v-if="totalIssues > 0"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <AlertTriangle class="w-4 h-4 text-red-400" />
          <span class="text-sm text-red-400 font-medium">{{ totalIssues }} 项异常</span>
        </div>
      </div>
    </div>
  </header>
</template>
