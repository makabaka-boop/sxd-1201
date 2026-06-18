<script setup lang="ts">
import { GripVertical, Edit2, Trash2, AlertCircle, AlertTriangle, Truck, Package, User, CheckSquare } from "lucide-vue-next";
import type { Material } from "@/types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_BG_COLORS,
  STATUS_TEXT_COLORS,
  ARRIVAL_STATUS_LABELS,
  ARRIVAL_STATUS_BG_COLORS,
  ARRIVAL_STATUS_TEXT_COLORS,
  getArrivalStatus,
  formatTimestamp,
  getAbnormalTypes,
  ABNORMAL_TYPE_LABELS,
  ABNORMAL_TYPE_BG_COLORS,
  ABNORMAL_TYPE_TEXT_COLORS,
} from "@/types";
import { useChecker } from "@/composables/useChecker";
import { computed } from "vue";

const props = defineProps<{
  material: Material;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "edit"): void;
  (e: "delete"): void;
  (e: "sign"): void;
}>();

const { getMaterialIssues, hasIssue } = useChecker();

const issues = computed(() => getMaterialIssues(props.material.id));
const hasIssues = computed(() => hasIssue(props.material.id));
const arrivalStatus = computed(() => getArrivalStatus(props.material));
const abnormalTypes = computed(() => getAbnormalTypes(props.material));
const hasAbnormal = computed(() => abnormalTypes.value.length > 0);
const isSigned = computed(() => typeof props.material.actualArrivalTime === "number");

const quantityDiff = computed(() => {
  if (typeof props.material.actualQuantity === "number") {
    return props.material.actualQuantity - props.material.quantity;
  }
  return null;
});
</script>

<template>
  <div
    class="group relative bg-dark-800 border rounded-lg p-3 transition-all cursor-pointer hover:shadow-lg"
    :class="[
      selected ? 'border-primary-500 bg-primary-500/5' : 'border-dark-700 hover:border-dark-600',
      hasIssues ? 'ring-1 ring-red-500/30' : '',
      hasAbnormal && !hasIssues ? 'ring-1 ring-orange-500/30' : ''
    ]"
    @click="emit('select')"
  >
    <div class="flex items-start gap-2.5">
      <div
        class="mt-0.5 cursor-grab active:cursor-grabbing text-dark-500 hover:text-dark-300 transition-colors flex-shrink-0"
        @click.stop
      >
        <GripVertical class="w-4 h-4" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-medium text-white text-sm truncate flex-1">
            {{ material.name || '未命名物料' }}
          </h3>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <span
              class="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
              :class="[STATUS_BG_COLORS[material.status], STATUS_TEXT_COLORS[material.status]]"
            >
              {{ STATUS_LABELS[material.status] }}
            </span>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
              :class="[ARRIVAL_STATUS_BG_COLORS[arrivalStatus], ARRIVAL_STATUS_TEXT_COLORS[arrivalStatus]]"
            >
              <Package class="w-3 h-3" />
              {{ ARRIVAL_STATUS_LABELS[arrivalStatus] }}
            </span>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5 mb-2">
          <span
            v-if="material.theme"
            class="inline-flex items-center px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 text-xs"
          >
            {{ material.theme }}
          </span>
          <span
            v-if="material.area"
            class="inline-flex items-center px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 text-xs"
          >
            {{ material.area }}
          </span>
          <span
            v-if="material.arrivalBatch"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-dark-700 text-primary-300 text-xs"
          >
            <Truck class="w-3 h-3" />
            {{ material.arrivalBatch }}
          </span>
          <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-dark-700 text-dark-400 text-xs">
            #{{ material.order }}
          </span>
        </div>

        <div class="flex items-center gap-4 text-xs mb-1.5">
          <div class="flex items-center gap-1">
            <span class="text-dark-500">计划</span>
            <span
              class="font-medium"
              :class="material.quantity <= 0 ? 'text-red-400' : 'text-dark-200'"
            >
              {{ material.quantity }}
            </span>
          </div>
          <div v-if="typeof material.actualQuantity === 'number'" class="flex items-center gap-1">
            <span class="text-dark-500">实到</span>
            <span
              class="font-medium"
              :class="quantityDiff !== null && quantityDiff < 0 ? 'text-orange-400' : 'text-green-400'"
            >
              {{ material.actualQuantity }}
              <span v-if="quantityDiff !== null && quantityDiff !== 0" class="text-xs">
                ({{ quantityDiff > 0 ? '+' : '' }}{{ quantityDiff }})
              </span>
            </span>
          </div>
          <div class="flex items-center gap-1 min-w-0 flex-1">
            <span class="text-dark-500 flex-shrink-0">尺寸</span>
            <span v-if="material.size" class="text-dark-300 truncate">
              {{ material.size }}
            </span>
            <span v-else class="text-red-400 flex-shrink-0">未填</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-1.5">
          <div class="flex items-center gap-1 min-w-0">
            <span class="text-dark-500 flex-shrink-0">预计</span>
            <span class="text-dark-300 truncate" :title="formatTimestamp(material.expectedArrivalTime)">
              {{ formatTimestamp(material.expectedArrivalTime) }}
            </span>
          </div>
          <div class="flex items-center gap-1 min-w-0">
            <span class="text-dark-500 flex-shrink-0">实际</span>
            <span class="text-dark-300 truncate" :title="formatTimestamp(material.actualArrivalTime)">
              {{ formatTimestamp(material.actualArrivalTime) }}
            </span>
          </div>
        </div>

        <div v-if="material.receiver" class="flex items-center gap-1 text-xs mb-1">
          <User class="w-3 h-3 text-dark-500" />
          <span class="text-dark-500">签收人：</span>
          <span class="text-dark-300">{{ material.receiver }}</span>
        </div>

        <div class="text-xs text-dark-500">
          风险：
          <span v-if="material.risk" class="text-dark-400 line-clamp-1">
            {{ material.risk }}
          </span>
          <span v-else class="text-red-400/70">未填写</span>
        </div>

        <div v-if="material.arrivalRemark" class="text-xs text-dark-500 mt-1">
          备注：
          <span class="text-dark-400 line-clamp-1">
            {{ material.arrivalRemark }}
          </span>
        </div>

        <div v-if="material.abnormalRemark" class="text-xs text-orange-400 mt-1 flex items-start gap-1">
          <AlertTriangle class="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span class="line-clamp-1">异常：{{ material.abnormalRemark }}</span>
        </div>

        <div v-if="hasAbnormal" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="type in abnormalTypes"
            :key="type"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border"
            :class="[ABNORMAL_TYPE_BG_COLORS[type], ABNORMAL_TYPE_TEXT_COLORS[type], 'border-current/20']"
          >
            <AlertTriangle class="w-3 h-3" />
            {{ ABNORMAL_TYPE_LABELS[type] }}
          </span>
        </div>

        <div v-else-if="hasIssues" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="issue in issues"
            :key="issue"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-xs border border-red-500/20"
          >
            <AlertTriangle class="w-3 h-3" />
            {{ issue }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          @click.stop="emit('sign')"
          class="p-1 rounded text-dark-400 hover:text-primary-400 hover:bg-dark-700 transition-colors"
          :title="isSigned ? '修改签收' : '到场签收'"
        >
          <CheckSquare class="w-3.5 h-3.5" />
        </button>
        <button
          @click.stop="emit('edit')"
          class="p-1 rounded text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
          title="编辑"
        >
          <Edit2 class="w-3.5 h-3.5" />
        </button>
        <button
          @click.stop="emit('delete')"
          class="p-1 rounded text-dark-400 hover:text-red-400 hover:bg-dark-700 transition-colors"
          title="删除"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div
      class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-opacity"
      :class="[selected ? 'opacity-100' : 'opacity-0', STATUS_COLORS[material.status]]"
    ></div>
  </div>
</template>
