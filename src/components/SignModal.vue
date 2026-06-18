<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { X, Package, User, ClipboardList, AlertTriangle, UserCog, Clock } from "lucide-vue-next";
import type { Material } from "@/types";
import { useMaterials } from "@/composables/useMaterials";
import { formatTimestamp, getAbnormalTypes, hasAbnormal } from "@/types";

const props = defineProps<{
  visible: boolean;
  materials: Material[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "signed"): void;
}>();

const { batchSign } = useMaterials();

const isBatch = computed(() => props.materials.length > 1);
const title = computed(() => (isBatch.value ? "批量签收物料" : "物料到场签收"));

const form = ref({
  actualArrivalTime: null as number | null,
  actualQuantity: null as number | null,
  receiver: "",
  arrivalRemark: "",
  abnormalRemark: "",
  abnormalHandler: "",
  expectedResolutionTime: null as number | null,
});

const actualArrivalLocal = ref("");
const expectedResolutionLocal = ref("");

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

watch(actualArrivalLocal, (val) => {
  form.value.actualArrivalTime = datetimeLocalToTs(val);
});

watch(expectedResolutionLocal, (val) => {
  form.value.expectedResolutionTime = datetimeLocalToTs(val);
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.materials.length === 1) {
        const m = props.materials[0];
        form.value = {
          actualArrivalTime: m.actualArrivalTime ?? null,
          actualQuantity: m.actualQuantity ?? null,
          receiver: m.receiver || "",
          arrivalRemark: m.arrivalRemark || "",
          abnormalRemark: m.abnormalRemark || "",
          abnormalHandler: m.abnormalHandler || "",
          expectedResolutionTime: m.expectedResolutionTime ?? null,
        };
        actualArrivalLocal.value = tsToDatetimeLocal(m.actualArrivalTime ?? null);
        expectedResolutionLocal.value = tsToDatetimeLocal(m.expectedResolutionTime ?? null);
      } else {
        form.value = {
          actualArrivalTime: Date.now(),
          actualQuantity: null,
          receiver: "",
          arrivalRemark: "",
          abnormalRemark: "",
          abnormalHandler: "",
          expectedResolutionTime: null,
        };
        actualArrivalLocal.value = tsToDatetimeLocal(Date.now());
        expectedResolutionLocal.value = "";
      }
    }
  }
);

const quantityDiff = computed(() => {
  if (!isBatch.value && form.value.actualQuantity !== null) {
    return form.value.actualQuantity - props.materials[0].quantity;
  }
  return null;
});

const hasQuantityShortage = computed(() => {
  return quantityDiff.value !== null && quantityDiff.value < 0;
});

const currentAbnormalTypes = computed(() => {
  if (!isBatch.value) {
    return getAbnormalTypes(props.materials[0]);
  }
  return [];
});

const showAbnormalSection = computed(() => {
  if (isBatch.value) {
    return form.value.abnormalRemark !== "" || form.value.abnormalHandler !== "" || form.value.expectedResolutionTime !== null;
  }
  return hasQuantityShortage.value || hasAbnormal(props.materials[0]) || form.value.abnormalRemark !== "" || form.value.abnormalHandler !== "" || form.value.expectedResolutionTime !== null;
});

function handleSign() {
  const ids = props.materials.map((m) => m.id);
  const data: any = {
    actualArrivalTime: form.value.actualArrivalTime,
    receiver: form.value.receiver.trim(),
    arrivalRemark: form.value.arrivalRemark.trim(),
    abnormalRemark: form.value.abnormalRemark.trim(),
    abnormalHandler: form.value.abnormalHandler.trim(),
    expectedResolutionTime: form.value.expectedResolutionTime,
  };
  if (!isBatch.value && form.value.actualQuantity !== null) {
    data.actualQuantity = form.value.actualQuantity;
  }
  batchSign(ids, data);
  emit("signed");
  emit("close");
}

function handleClose() {
  emit("close");
}

function handleActualQuantityInput(event: Event) {
  const target = event.target as HTMLInputElement;
  form.value.actualQuantity = target.value === "" ? null : Number(target.value);
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
            <div class="flex items-center gap-2">
              <Package class="w-5 h-5 text-primary-400" />
              <h2 class="text-lg font-medium text-white">{{ title }}</h2>
            </div>
            <button
              @click="handleClose"
              class="p-1 rounded text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div v-if="isBatch" class="px-6 py-3 bg-dark-700/50 border-b border-dark-700">
            <p class="text-sm text-dark-300">
              已选择 <span class="text-primary-400 font-medium">{{ materials.length }}</span> 项物料进行批量签收
            </p>
          </div>

          <div v-else-if="materials.length === 1" class="px-6 py-3 bg-dark-700/50 border-b border-dark-700">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white">{{ materials[0].name }}</p>
                <p class="text-xs text-dark-400 mt-0.5">
                  <span v-if="materials[0].theme">{{ materials[0].theme }} · </span>
                  <span v-if="materials[0].area">{{ materials[0].area }} · </span>
                  计划数量：{{ materials[0].quantity }}
                </p>
              </div>
              <span v-if="materials[0].arrivalBatch" class="text-xs text-primary-300 bg-primary-500/10 px-2 py-1 rounded">
                {{ materials[0].arrivalBatch }}
              </span>
            </div>
          </div>

          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label class="block text-sm text-dark-300 mb-1.5">
                实际到场时间
              </label>
              <input
                v-model="actualArrivalLocal"
                type="datetime-local"
                class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-sm text-dark-300 mb-1.5">
                实际到场数量
              </label>
              <div class="relative">
                <input
                  :value="form.actualQuantity ?? ''"
                  @input="handleActualQuantityInput"
                  type="number"
                  min="0"
                  :placeholder="isBatch ? '批量签收不支持统一设置数量' : '请输入实际到场数量'"
                  :disabled="isBatch"
                  class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div
                  v-if="hasQuantityShortage"
                  class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-orange-400"
                >
                  <AlertTriangle class="w-4 h-4" />
                  <span class="text-xs">短缺 {{ Math.abs(quantityDiff!) }} 件</span>
                </div>
              </div>
              <p v-if="isBatch" class="text-xs text-dark-500 mt-1">
                批量签收不支持统一设置数量，请逐个物料签收时填写
              </p>
              <p v-else class="text-xs text-dark-500 mt-1">
                计划数量：{{ materials[0].quantity }} 件
              </p>
            </div>

            <div>
              <label class="block text-sm text-dark-300 mb-1.5">
                <div class="flex items-center gap-1.5">
                  <User class="w-4 h-4" />
                  <span>签收人</span>
                </div>
              </label>
              <input
                v-model="form.receiver"
                type="text"
                placeholder="请输入签收人姓名"
                class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-sm text-dark-300 mb-1.5">
                <div class="flex items-center gap-1.5">
                  <ClipboardList class="w-4 h-4" />
                  <span>到场备注</span>
                </div>
              </label>
              <textarea
                v-model="form.arrivalRemark"
                rows="2"
                placeholder="请填写到场相关备注，如物流状态、包装情况等..."
                class="w-full px-3 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              ></textarea>
            </div>

            <div
              v-if="showAbnormalSection"
              class="pt-3 border-t border-dark-700"
            >
              <div class="mb-3">
                <div class="text-sm font-medium text-orange-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle class="w-4 h-4" />
                  <span>异常处理闭环</span>
                </div>
                <div v-if="!isBatch && currentAbnormalTypes.length > 0" class="mb-3 flex flex-wrap gap-1">
                  <span
                    v-for="type in currentAbnormalTypes"
                    :key="type"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  >
                    {{ type === 'quantity-shortage' ? '数量短缺' : type === 'overdue' ? '已逾期' : '无预计到场时间' }}
                  </span>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-dark-300 mb-1.5">
                    <div class="flex items-center gap-1.5">
                      <AlertTriangle class="w-4 h-4 text-orange-400" />
                      <span class="text-orange-400">异常说明</span>
                    </div>
                  </label>
                  <textarea
                    v-model="form.abnormalRemark"
                    rows="3"
                    placeholder="请描述异常情况，如数量短缺原因、逾期原因等..."
                    class="w-full px-3 py-2.5 bg-dark-700 border border-orange-500/30 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm text-dark-300 mb-1.5">
                    <div class="flex items-center gap-1.5">
                      <UserCog class="w-4 h-4 text-orange-400" />
                      <span class="text-orange-400">处理负责人</span>
                    </div>
                  </label>
                  <input
                    v-model="form.abnormalHandler"
                    type="text"
                    placeholder="请输入负责处理该异常的人员姓名"
                    class="w-full px-3 py-2.5 bg-dark-700 border border-orange-500/30 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-sm text-dark-300 mb-1.5">
                    <div class="flex items-center gap-1.5">
                      <Clock class="w-4 h-4 text-orange-400" />
                      <span class="text-orange-400">预计补救完成时间</span>
                    </div>
                  </label>
                  <input
                    v-model="expectedResolutionLocal"
                    type="datetime-local"
                    class="w-full px-3 py-2.5 bg-dark-700 border border-orange-500/30 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <p class="text-xs text-dark-500 mt-1">
                    预计何时完成异常补救，如供应商补发、物料替换等
                  </p>
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
              @click="handleSign"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-dark-900 hover:bg-primary-400 transition-colors"
            >
              <Package class="w-4 h-4" />
              确认签收
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
