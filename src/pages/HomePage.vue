<script setup lang="ts">
import { ref, computed } from "vue";
import TopToolbar from "@/components/TopToolbar.vue";
import FilterPanel from "@/components/FilterPanel.vue";
import MaterialList from "@/components/MaterialList.vue";
import BatchBar from "@/components/BatchBar.vue";
import MaterialModal from "@/components/MaterialModal.vue";
import SignModal from "@/components/SignModal.vue";
import CheckPanel from "@/components/CheckPanel.vue";
import { useMaterials } from "@/composables/useMaterials";
import type { Material } from "@/types";

const { deleteMaterial, getMaterialById, materials } = useMaterials();

const showModal = ref(false);
const showSignModal = ref(false);
const editingMaterial = ref<Material | null>(null);
const signMaterials = ref<Material[]>([]);
const selectedIds = ref<string[]>([]);

const materialListRef = ref<InstanceType<typeof MaterialList> | null>(null);

const selectedMaterials = computed(() => {
  return selectedIds.value
    .map((id) => getMaterialById(id))
    .filter((m): m is Material => m !== undefined);
});

function openAddModal() {
  editingMaterial.value = null;
  showModal.value = true;
}

function openEditModal(material: Material) {
  editingMaterial.value = material;
  showModal.value = true;
}

function openSignModal(material: Material) {
  signMaterials.value = [material];
  showSignModal.value = true;
}

function openBatchSignModal() {
  signMaterials.value = selectedMaterials.value;
  showSignModal.value = true;
}

function handleDelete(id: string) {
  if (confirm("确定要删除这个物料吗？")) {
    deleteMaterial(id);
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  }
}

function handleSelectionChange(ids: string[]) {
  selectedIds.value = ids;
}

function clearSelection() {
  materialListRef.value?.clearSelection();
}

function handleBatchUpdated() {
}

function handleModalSaved() {
}

function handleSignSaved() {
}
</script>

<template>
  <div class="h-screen flex flex-col bg-dark-900 text-white">
    <TopToolbar @add="openAddModal" />

    <div class="flex-1 flex overflow-hidden">
      <FilterPanel />

      <MaterialList
        ref="materialListRef"
        @add="openAddModal"
        @edit="openEditModal"
        @delete="handleDelete"
        @sign="openSignModal"
        @selection-change="handleSelectionChange"
      />

      <CheckPanel @edit="openEditModal" />
    </div>

    <BatchBar
      :selected-count="selectedIds.length"
      :selected-ids="selectedIds"
      @clear="clearSelection"
      @updated="handleBatchUpdated"
      @batch-sign="openBatchSignModal"
    />

    <MaterialModal
      :visible="showModal"
      :material="editingMaterial"
      @close="showModal = false"
      @saved="handleModalSaved"
    />

    <SignModal
      :visible="showSignModal"
      :materials="signMaterials"
      @close="showSignModal = false"
      @signed="handleSignSaved"
    />
  </div>
</template>
