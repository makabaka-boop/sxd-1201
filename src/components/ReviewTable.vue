<script setup lang="ts">
import { ref, computed } from "vue";
import { ArrowLeft, Download, Printer, CheckCircle2, Circle } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useMaterials } from "@/composables/useMaterials";
import { useExport } from "@/composables/useExport";
import { STATUS_LABELS } from "@/types";
import type { Material } from "@/types";

const router = useRouter();
const { materials, themes, areas } = useMaterials();
const { exportReviewTable } = useExport();

const checkedItems = ref<Set<string>>(new Set());

interface GroupedMaterials {
  theme: string;
  areas: {
    area: string;
    materials: Material[];
  }[];
}

const groupedMaterials = computed<GroupedMaterials[]>(() => {
  const result: GroupedMaterials[] = [];

  themes.value.forEach((theme) => {
    const themeGroup: GroupedMaterials = {
      theme,
      areas: [],
    };

    areas.value.forEach((area) => {
      const areaMaterials = materials.value
        .filter((m) => m.theme === theme && m.area === area)
        .sort((a, b) => a.order - b.order);

      if (areaMaterials.length > 0) {
        themeGroup.areas.push({
          area,
          materials: areaMaterials,
        });
      }
    });

    if (themeGroup.areas.length > 0) {
      result.push(themeGroup);
    }
  });

  return result;
});

const totalCount = computed(() => materials.value.length);
const checkedCount = computed(() => checkedItems.value.size);

function toggleCheck(id: string) {
  if (checkedItems.value.has(id)) {
    checkedItems.value.delete(id);
  } else {
    checkedItems.value.add(id);
  }
}

function isChecked(id: string): boolean {
  return checkedItems.value.has(id);
}

function handleExport() {
  exportReviewTable(materials.value);
}

function handlePrint() {
  window.print();
}

function goBack() {
  router.push("/");
}
</script>

<template>
  <div class="min-h-screen bg-dark-900 text-white">
    <header class="bg-dark-800 border-b border-dark-700 px-6 py-4 print:hidden">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="flex items-center gap-2 text-dark-300 hover:text-white transition-colors"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>返回</span>
          </button>
          <div class="w-px h-5 bg-dark-600"></div>
          <div>
            <h1 class="text-lg font-serif font-semibold">现场复核表</h1>
            <p class="text-xs text-dark-400">共 {{ totalCount }} 项物料，已复核 {{ checkedCount }} 项</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="handlePrint"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 text-dark-200 hover:bg-dark-600 transition-colors text-sm"
          >
            <Printer class="w-4 h-4" />
            <span>打印</span>
          </button>
          <button
            @click="handleExport"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-dark-900 hover:bg-primary-400 transition-colors text-sm font-medium"
          >
            <Download class="w-4 h-4" />
            <span>导出 CSV</span>
          </button>
        </div>
      </div>
    </header>

    <main class="p-6 print:p-0 print:bg-white print:text-black">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-8 print:mb-6">
          <h1 class="text-2xl font-serif font-bold mb-2 print:text-2xl">品牌快闪桌面陈列物料现场复核表</h1>
          <p class="text-dark-400 print:text-gray-500 text-sm">
            复核日期：{{ new Date().toLocaleDateString('zh-CN') }}
          </p>
        </div>

        <div v-if="groupedMaterials.length === 0" class="text-center py-16">
          <p class="text-dark-400">暂无物料数据</p>
        </div>

        <div v-else class="space-y-8">
          <div v-for="themeGroup in groupedMaterials" :key="themeGroup.theme">
            <div class="flex items-center gap-3 mb-4">
              <h2 class="text-lg font-semibold text-primary-400 print:text-black">
                {{ themeGroup.theme }}
              </h2>
              <div class="flex-1 h-px bg-dark-700 print:bg-gray-300"></div>
            </div>

            <div v-for="areaGroup in themeGroup.areas" :key="areaGroup.area" class="mb-6">
              <h3 class="text-sm font-medium text-dark-300 mb-3 print:text-gray-600 pl-2 border-l-2 border-primary-500">
                {{ areaGroup.area }}
              </h3>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-dark-700 print:border-gray-300">
                      <th class="py-2 px-3 text-left text-xs font-medium text-dark-400 print:text-gray-500 w-10">序号</th>
                      <th class="py-2 px-3 text-left text-xs font-medium text-dark-400 print:text-gray-500">物料名称</th>
                      <th class="py-2 px-3 text-left text-xs font-medium text-dark-400 print:text-gray-500 w-20">数量</th>
                      <th class="py-2 px-3 text-left text-xs font-medium text-dark-400 print:text-gray-500 w-32">尺寸</th>
                      <th class="py-2 px-3 text-left text-xs font-medium text-dark-400 print:text-gray-500 w-24">状态</th>
                      <th class="py-2 px-3 text-left text-xs font-medium text-dark-400 print:text-gray-500 w-24">风险说明</th>
                      <th class="py-2 px-3 text-center text-xs font-medium text-dark-400 print:text-gray-500 w-20">复核</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in areaGroup.materials"
                      :key="item.id"
                      class="border-b border-dark-700/50 print:border-gray-200 hover:bg-dark-800/50 print:hover:bg-gray-50 transition-colors"
                    >
                      <td class="py-3 px-3 text-dark-500 print:text-gray-400">{{ item.order }}</td>
                      <td class="py-3 px-3 font-medium">
                        {{ item.name }}
                      </td>
                      <td class="py-3 px-3">{{ item.quantity }}</td>
                      <td class="py-3 px-3 text-dark-300 print:text-gray-600">{{ item.size || '-' }}</td>
                      <td class="py-3 px-3">
                        <span class="text-xs">{{ STATUS_LABELS[item.status] }}</span>
                      </td>
                      <td class="py-3 px-3 text-dark-400 print:text-gray-500 text-xs max-w-xs truncate" :title="item.risk">
                        {{ item.risk || '-' }}
                      </td>
                      <td class="py-3 px-3 text-center">
                        <button
                          @click="toggleCheck(item.id)"
                          class="inline-flex print:hidden"
                        >
                          <CheckCircle2
                            v-if="isChecked(item.id)"
                            class="w-5 h-5 text-green-400"
                          />
                          <Circle v-else class="w-5 h-5 text-dark-500" />
                        </button>
                        <span class="hidden print:inline">
                          {{ isChecked(item.id) ? '✓' : '' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 pt-6 border-t border-dark-700 print:border-gray-300">
          <div class="grid grid-cols-3 gap-8">
            <div>
              <p class="text-sm text-dark-400 print:text-gray-500 mb-1">复核人签字：</p>
              <div class="h-8 border-b border-dark-600 print:border-gray-400"></div>
            </div>
            <div>
              <p class="text-sm text-dark-400 print:text-gray-500 mb-1">负责人签字：</p>
              <div class="h-8 border-b border-dark-600 print:border-gray-400"></div>
            </div>
            <div>
              <p class="text-sm text-dark-400 print:text-gray-500 mb-1">日期：</p>
              <div class="h-8 border-b border-dark-600 print:border-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }
}
</style>
