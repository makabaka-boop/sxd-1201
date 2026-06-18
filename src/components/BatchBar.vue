<script setup lang="ts">
import { X, Check, Package, Eye, Pause, XCircle, CheckSquare } from "lucide-vue-next";
import { STATUS_LABELS } from "@/types";
import type { MaterialStatus } from "@/types";
import { useMaterials } from "@/composables/useMaterials";

const props = defineProps<{
  selectedCount: number;
  selectedIds: string[];
}>();

const emit = defineEmits<{
  (e: "clear"): void;
  (e: "updated"): void;
  (e: "batch-sign"): void;
}>();

const { batchUpdateStatus } = useMaterials();

const statusActions: { status: MaterialStatus; label: string; icon: any; color: string }[] = [
  { status: "pending-prep", label: "待准备", icon: Package, color: "bg-gray-500 hover:bg-gray-400" },
  { status: "pending-review", label: "待复核", icon: Eye, color: "bg-blue-500 hover:bg-blue-400" },
  { status: "ready", label: "可摆放", icon: Check, color: "bg-green-500 hover:bg-green-400" },
  { status: "hold", label: "暂不使用", icon: Pause, color: "bg-red-500 hover:bg-red-400" },
];

function handleBatchStatus(status: MaterialStatus) {
  if (props.selectedIds.length === 0) return;
  batchUpdateStatus(props.selectedIds, status);
  emit("updated");
}

function handleBatchSign() {
  if (props.selectedIds.length === 0) return;
  emit("batch-sign");
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div class="bg-dark-800 border border-dark-600 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-white font-medium">已选 {{ selectedCount }} 项</span>
          <button
            @click="emit('clear')"
            class="p-1 rounded text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="w-px h-6 bg-dark-600"></div>

        <div class="flex items-center gap-2">
          <button
            @click="handleBatchSign"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors bg-primary-500 hover:bg-primary-400 text-dark-900"
          >
            <CheckSquare class="w-3.5 h-3.5" />
            批量签收
          </button>
        </div>

        <div class="w-px h-6 bg-dark-600"></div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-dark-400">批量标记:</span>
          <button
            v-for="action in statusActions"
            :key="action.status"
            @click="handleBatchStatus(action.status)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            :class="action.color"
          >
            <component :is="action.icon" class="w-3.5 h-3.5" />
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
