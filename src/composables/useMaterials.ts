import { ref, watch, computed } from "vue";
import type { Material, MaterialStatus } from "@/types";

const STORAGE_KEY = "flash-mob-materials";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getMockData(): Material[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: "mock-1",
      name: "亚克力展示架",
      theme: "夏日限定",
      area: "入口区",
      quantity: 5,
      size: "30cm × 20cm × 40cm",
      order: 1,
      risk: "亚克力易碎，搬运时需小心轻放",
      status: "ready",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "BATCH-001",
      expectedArrivalTime: now - day,
      actualArrivalTime: now - day + 2 * 60 * 60 * 1000,
      actualQuantity: 5,
      receiver: "张三",
      arrivalRemark: "物流正常，包装完好",
      abnormalRemark: "",
    },
    {
      id: "mock-2",
      name: "品牌LOGO立牌",
      theme: "夏日限定",
      area: "入口区",
      quantity: 2,
      size: "60cm × 80cm",
      order: 2,
      risk: "",
      status: "pending-review",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "BATCH-001",
      expectedArrivalTime: now + day,
      actualArrivalTime: null,
      actualQuantity: null,
      receiver: "",
      arrivalRemark: "",
      abnormalRemark: "",
    },
    {
      id: "mock-3",
      name: "产品陈列托盘",
      theme: "夏日限定",
      area: "主展示区",
      quantity: 8,
      size: "40cm × 30cm × 5cm",
      order: 1,
      risk: "木质托盘需防潮，避免直接接触地面",
      status: "pending-prep",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "BATCH-002",
      expectedArrivalTime: now - 2 * day,
      actualArrivalTime: null,
      actualQuantity: null,
      receiver: "",
      arrivalRemark: "供应商延迟发货",
      abnormalRemark: "",
    },
    {
      id: "mock-4",
      name: "LED氛围灯串",
      theme: "夏日限定",
      area: "主展示区",
      quantity: 0,
      size: "5m/串",
      order: 2,
      risk: "需注意用电安全，避免过载",
      status: "hold",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "",
      expectedArrivalTime: null,
      actualArrivalTime: null,
      actualQuantity: null,
      receiver: "",
      arrivalRemark: "",
      abnormalRemark: "",
    },
    {
      id: "mock-5",
      name: "价格标签卡",
      theme: "经典系列",
      area: "主展示区",
      quantity: 20,
      size: "",
      order: 3,
      risk: "纸质卡片易弯折，需妥善保管",
      status: "ready",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "BATCH-001",
      expectedArrivalTime: now - 2 * day,
      actualArrivalTime: now - 2 * day + 3 * 60 * 60 * 1000,
      actualQuantity: 18,
      receiver: "李四",
      arrivalRemark: "",
      abnormalRemark: "少2张，供应商补发中",
    },
    {
      id: "mock-6",
      name: "装饰绿植盆栽",
      theme: "经典系列",
      area: "休息区",
      quantity: 3,
      size: "直径25cm × 高40cm",
      order: 1,
      risk: "需定期浇水，注意花盆漏水",
      status: "pending-review",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "BATCH-002",
      expectedArrivalTime: now + 2 * day,
      actualArrivalTime: null,
      actualQuantity: null,
      receiver: "",
      arrivalRemark: "需现场签收",
      abnormalRemark: "",
    },
    {
      id: "mock-7",
      name: "宣传册展架",
      theme: "经典系列",
      area: "休息区",
      quantity: 2,
      size: "A4尺寸",
      order: 1,
      risk: "",
      status: "pending-prep",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "",
      expectedArrivalTime: null,
      actualArrivalTime: null,
      actualQuantity: null,
      receiver: "",
      arrivalRemark: "",
      abnormalRemark: "",
    },
    {
      id: "mock-8",
      name: "收银台立牌",
      theme: "夏日限定",
      area: "收银区",
      quantity: 1,
      size: "20cm × 30cm",
      order: 2,
      risk: "",
      status: "ready",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: "BATCH-001",
      expectedArrivalTime: now - day,
      actualArrivalTime: now - day + 60 * 60 * 1000,
      actualQuantity: 1,
      receiver: "王五",
      arrivalRemark: "",
      abnormalRemark: "",
    },
  ];
}

function normalizeMaterial(raw: any): Material {
  return {
    id: raw.id || generateId(),
    name: raw.name || "",
    theme: raw.theme || "",
    area: raw.area || "",
    quantity: typeof raw.quantity === "number" ? raw.quantity : 0,
    size: raw.size || "",
    order: typeof raw.order === "number" ? raw.order : 1,
    risk: raw.risk || "",
    status: raw.status || "pending-prep",
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    arrivalBatch: raw.arrivalBatch || "",
    expectedArrivalTime:
      typeof raw.expectedArrivalTime === "number" ? raw.expectedArrivalTime : null,
    actualArrivalTime:
      typeof raw.actualArrivalTime === "number" ? raw.actualArrivalTime : null,
    actualQuantity:
      typeof raw.actualQuantity === "number" ? raw.actualQuantity : null,
    receiver: raw.receiver || "",
    arrivalRemark: raw.arrivalRemark || "",
    abnormalRemark: raw.abnormalRemark || "",
  };
}

function loadFromStorage(): Material[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => normalizeMaterial(item));
      }
    }
  } catch (e) {
    console.error("Failed to load materials from localStorage", e);
  }
  return getMockData();
}

function saveToStorage(materials: Material[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  } catch (e) {
    console.error("Failed to save materials to localStorage", e);
  }
}

const materials = ref<Material[]>(loadFromStorage());

watch(
  materials,
  (val) => {
    saveToStorage(val);
  },
  { deep: true }
);

export function useMaterials() {
  const sortedMaterials = computed(() => {
    return [...materials.value].sort((a, b) => a.order - b.order);
  });

  const themes = computed(() => {
    const set = new Set(materials.value.map((m) => m.theme).filter(Boolean));
    return Array.from(set);
  });

  const areas = computed(() => {
    const set = new Set(materials.value.map((m) => m.area).filter(Boolean));
    return Array.from(set);
  });

  const arrivalBatches = computed(() => {
    const set = new Set(materials.value.map((m) => m.arrivalBatch).filter(Boolean));
    return Array.from(set);
  });

  function addMaterial(data: Partial<Material>): Material {
    const now = Date.now();
    const maxOrder = materials.value.reduce(
      (max, m) => Math.max(max, m.order),
      0
    );
    const newMaterial: Material = {
      id: generateId(),
      name: data.name || "",
      theme: data.theme || "",
      area: data.area || "",
      quantity: data.quantity ?? 0,
      size: data.size || "",
      order: data.order ?? maxOrder + 1,
      risk: data.risk || "",
      status: data.status || "pending-prep",
      createdAt: now,
      updatedAt: now,
      arrivalBatch: data.arrivalBatch || "",
      expectedArrivalTime: data.expectedArrivalTime ?? null,
      actualArrivalTime: data.actualArrivalTime ?? null,
      actualQuantity: data.actualQuantity ?? null,
      receiver: data.receiver || "",
      arrivalRemark: data.arrivalRemark || "",
      abnormalRemark: data.abnormalRemark || "",
    };
    materials.value.push(newMaterial);
    return newMaterial;
  }

  function updateMaterial(id: string, data: Partial<Material>) {
    const index = materials.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      materials.value[index] = {
        ...materials.value[index],
        ...data,
        updatedAt: Date.now(),
      };
    }
  }

  function deleteMaterial(id: string) {
    const index = materials.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      materials.value.splice(index, 1);
    }
  }

  function getMaterialById(id: string): Material | undefined {
    return materials.value.find((m) => m.id === id);
  }

  function reorderMaterials(newOrder: Material[]) {
    newOrder.forEach((m, index) => {
      const mat = materials.value.find((item) => item.id === m.id);
      if (mat) {
        mat.order = index + 1;
        mat.updatedAt = Date.now();
      }
    });
  }

  function batchUpdateStatus(ids: string[], status: MaterialStatus) {
    const now = Date.now();
    ids.forEach((id) => {
      const mat = materials.value.find((m) => m.id === id);
      if (mat) {
        mat.status = status;
        mat.updatedAt = now;
      }
    });
  }

  function batchSign(
    ids: string[],
    data: {
      actualArrivalTime?: number | null;
      actualQuantity?: number | null;
      receiver?: string;
      arrivalRemark?: string;
      abnormalRemark?: string;
    }
  ) {
    const now = Date.now();
    ids.forEach((id) => {
      const mat = materials.value.find((m) => m.id === id);
      if (mat) {
        if (data.actualArrivalTime !== undefined) {
          mat.actualArrivalTime = data.actualArrivalTime;
        }
        if (data.actualQuantity !== undefined) {
          mat.actualQuantity = data.actualQuantity;
        }
        if (data.receiver !== undefined) {
          mat.receiver = data.receiver;
        }
        if (data.arrivalRemark !== undefined) {
          mat.arrivalRemark = data.arrivalRemark;
        }
        if (data.abnormalRemark !== undefined) {
          mat.abnormalRemark = data.abnormalRemark;
        }
        mat.updatedAt = now;
      }
    });
  }

  function signMaterial(
    id: string,
    data: {
      actualArrivalTime?: number | null;
      actualQuantity?: number | null;
      receiver?: string;
      arrivalRemark?: string;
      abnormalRemark?: string;
    }
  ) {
    batchSign([id], data);
  }

  function getMaterialsByAreaAndTheme(area: string, theme: string): Material[] {
    return materials.value
      .filter((m) => m.area === area && m.theme === theme)
      .sort((a, b) => a.order - b.order);
  }

  return {
    materials,
    sortedMaterials,
    themes,
    areas,
    arrivalBatches,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    reorderMaterials,
    batchUpdateStatus,
    batchSign,
    signMaterial,
    getMaterialsByAreaAndTheme,
  };
}
