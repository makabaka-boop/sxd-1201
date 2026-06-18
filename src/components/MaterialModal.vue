<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { X } from "lucide-vue-next";
import type { Material, MaterialStatus } from "@/types";
import { STATUS_LABELS } from "@/types";
import { useMaterials } from "@/composables/useMaterials";

const props = defineProps<{
  visible: boolean;
  material?: Material | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const { addMaterial, updateMaterial, themes, areas, arrivalBatches } = useMaterials();

const form = ref({
  name: "",
  theme: "",
  area: "",
  quantity: 1,
  size: "",
  order: 1,
  risk: "",
  status: "pending-prep" as MaterialStatus,
  arrivalBatch: "",
  expectedArrivalTime: null as number | null,
  actualArrivalTime: null as number | null,
  arrivalRemark: "",
});

const isEdit = computed(() => !!props.material);
const title = computed(() => (isEdit.value ? "编辑物料" : "新增物料"));

const statusOptions: MaterialStatus[] = ["pending-prep", "pending-review", "ready", "hold"];

function tsToDatetimeLocal(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToTs(val: string): number | null {
  if (!val) return null;
  return new Date(val).getTime();
}

const expectedArrivalLocal = ref("");
const actualArrivalLocal = ref("");

watch(expectedArrivalLocal, (val) => {
  form.value.expectedArrivalTime = datetimeLocalToTs(val);
});

watch(actualArrivalLocal, (val) => {
  form.value.actualArrivalTime = datetimeLocalToTs(val);
});

watch(
  () => props.visible,
  (val) => {
    if (val && props.material) {
      form.value = {
        name: props.material.name,
        theme: props.material.theme,
        area: props.material.area,
        quantity: props.material.quantity,
        size: props.material.size,
        order: props.material.order,
        risk: props.material.risk,
        status: props.material.status,
        arrivalBatch: props.material.arrivalBatch || "",
        expectedArrivalTime: props.material.expectedArrivalTime ?? null,
        actualArrivalTime: props.material.actualArrivalTime ?? null,
        arrivalRemark: props.material.arrivalRemark || "",
      };
      expectedArrivalLocal.value = tsToDatetimeLocal(props.material.expectedArrivalTime);
      actualArrivalLocal.value = tsToDatetimeLocal(props.material.actualArrivalTime);
    } else if (val) {
      form.value = {
        name: "",
        theme: "",
        area: "",
        quantity: 1,
        size: "",
        order: 1,
        risk: "",
        status: "pending-prep",
        arrivalBatch: "",
        expectedArrivalTime: null,
        actualArrivalTime: null,
        arrivalRemark: "",
      };
      expectedArrivalLocal.value = "";
      actualArrivalLocal.value = "";
    }
  }
);

function handleSave() {
  if (!form.value.name.trim()) {
    alert("请输入物料名称");
    return;
  }

  if (isEdit.value && props.material) {
    updateMaterial(props.material.id, form.value);
  } else {
    addMaterial(form.value);
  }

  emit("saved");
  emit("close");
}

function handleClose() {
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="handleClose"
        ></div>

        <div class="relative bg-dark-800 border border-dark-600 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in">
          <div class="flex items-center justify-between px-6 py-4 border-b border-dark-700">
            <h2 class="text-lg font-medium text-white">{{ title }}</h2>
            <button
              @click="handleClose"
              class="p-1 rounded text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label class="block text-sm text-dark-300 mb-1.5">
                物料名称 <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="请输入物料名称"
                class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-dark-300 mb-1.5">展示主题</label>
                <input
                  v-model="form.theme"
                  type="text"
                  list="theme-list"
                  placeholder="输入或选择主题"
                  class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <datalist id="theme-list">
                  <option v-for="theme in themes" :key="theme" :value="theme">
                    {{ theme }}
                  </option>
                </datalist>
              </div>

              <div>
                <label class="block text-sm text-dark-300 mb-1.5">所在区域</label>
                <input
                  v-model="form.area"
                  type="text"
                  list="area-list"
                  placeholder="输入或选择区域"
                  class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <datalist id="area-list">
                  <option v-for="area in areas" :key="area" :value="area">
                    {{ area }}
                  </option>
                </datalist>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-dark-300 mb-1.5">数量</label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-dark-300 mb-1.5">摆放顺序</label>
                <input
                  v-model.number="form.order"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm text-dark-300 mb-1.5">尺寸</label>
              <input
                v-model="form.size"
                type="text"
                placeholder="例如：30cm × 20cm × 15cm"
                class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-sm text-dark-300 mb-1.5">复核状态</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="status in statusOptions"
                  :key="status"
                  type="button"
                  @click="form.status = status"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                  :class="[
                    form.status === status
                      ? 'bg-primary-500 text-dark-900 border-primary-500'
                      : 'bg-dark-700 text-dark-300 border-dark-600 hover:border-dark-500'
                  ]"
                >
                  {{ STATUS_LABELS[status] }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm text-dark-300 mb-1.5">风险说明</label>
              <textarea
                v-model="form.risk"
                rows="3"
                placeholder="请描述该物料的摆放风险、注意事项等..."
                class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div class="pt-2 border-t border-dark-700">
              <div class="text-sm font-medium text-primary-400 mb-3">到场信息</div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-dark-300 mb-1.5">到场批次</label>
                  <input
                    v-model="form.arrivalBatch"
                    type="text"
                    list="arrival-batch-list"
                    placeholder="例如：BATCH-001"
                    class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <datalist id="arrival-batch-list">
                    <option v-for="batch in arrivalBatches" :key="batch" :value="batch">
                      {{ batch }}
                    </option>
                  </datalist>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-dark-300 mb-1.5">预计到场时间</label>
                    <input
                      v-model="expectedArrivalLocal"
                      type="datetime-local"
                      class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-dark-300 mb-1.5">实际到场时间</label>
                    <input
                      v-model="actualArrivalLocal"
                      type="datetime-local"
                      class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-dark-300 mb-1.5">到场备注</label>
                  <textarea
                    v-model="form.arrivalRemark"
                    rows="2"
                    placeholder="请填写到场相关备注，如物流状态、包装情况等..."
                    class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-700">
            <button
              @click="handleClose"
              class="px-4 py-2 rounded-lg text-sm text-dark-300 hover:bg-dark-700 transition-colors"
            >
              取消
            </button>
            <button
              @click="handleSave"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-dark-900 hover:bg-primary-400 transition-colors"
            >
              {{ isEdit ? '保存修改' : '添加物料' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
