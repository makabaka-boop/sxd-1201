<script setup lang="ts">
import { ref, computed } from "vue";
import draggable from "vuedraggable";
import MaterialCard from "./MaterialCard.vue";
import { useFilter } from "@/composables/useFilter";
import { useMaterials } from "@/composables/useMaterials";
import type { Material } from "@/types";
import { Package, Plus } from "lucide-vue-next";

const emit = defineEmits<{
  (e: "edit", material: Material): void;
  (e: "delete", id: string): void;
  (e: "add"): void;
  (e: "sign", material: Material): void;
  (e: "selection-change", ids: string[]): void;
}>();

const { filteredMaterials } = useFilter();
const { reorderMaterials } = useMaterials();

const selectedIds = ref<string[]>([]);

const dragList = computed({
  get: () => filteredMaterials.value,
  set: (value: Material[]) => {
    reorderMaterials(value);
  },
});

function toggleSelect(id: string) {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
  emit("selection-change", selectedIds.value);
}

function isSelected(id: string): boolean {
  return selectedIds.value.includes(id);
}

function clearSelection() {
  selectedIds.value = [];
  emit("selection-change", []);
}

function selectAll() {
  selectedIds.value = filteredMaterials.value.map((m) => m.id);
  emit("selection-change", selectedIds.value);
}

function getSelectedIds(): string[] {
  return selectedIds.value;
}

defineExpose({
  clearSelection,
  selectAll,
  getSelectedIds,
});
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <h2 class="text-sm font-medium text-white">物料列表</h2>
        <span class="text-xs text-dark-500">
          共 {{ filteredMaterials.length }} 项
        </span>
        <span v-if="selectedIds.length > 0" class="text-xs text-primary-400">
          已选 {{ selectedIds.length }} 项
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="selectedIds.length > 0"
          @click="clearSelection"
          class="text-xs text-dark-400 hover:text-dark-200"
        >
          取消选择
        </button>
        <button
          v-if="filteredMaterials.length > 0 && selectedIds.length !== filteredMaterials.length"
          @click="selectAll"
          class="text-xs text-dark-400 hover:text-dark-200"
        >
          全选
        </button>
      </div>
    </div>

    <div v-if="filteredMaterials.length > 0" class="space-y-3">
      <draggable
        v-model="dragList"
        item-key="id"
        handle=".cursor-grab"
        ghost-class="opacity-50"
        animation="200"
        @end="() => {}"
      >
        <template #item="{ element }">
          <MaterialCard
            :material="element"
            :selected="isSelected(element.id)"
            @select="toggleSelect(element.id)"
            @edit="emit('edit', element)"
            @delete="emit('delete', element.id)"
            @sign="emit('sign', element)"
          />
        </template>
      </draggable>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
        <Package class="w-8 h-8 text-dark-500" />
      </div>
      <p class="text-dark-400 mb-2">暂无物料数据</p>
      <p class="text-xs text-dark-500 mb-4">点击下方按钮添加第一个物料</p>
      <button
        @click="emit('add')"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-dark-900 hover:bg-primary-400 transition-colors text-sm font-medium"
      >
        <Plus class="w-4 h-4" />
        新增物料
      </button>
    </div>
  </div>
</template>
