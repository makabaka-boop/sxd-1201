import { computed } from "vue";
import type { Material, CheckResult } from "@/types";
import { useMaterials } from "./useMaterials";

export function useChecker() {
  const { materials } = useMaterials();

  const zeroQuantity = computed(() => {
    return materials.value.filter((m: Material) => m.quantity <= 0);
  });

  const duplicateOrder = computed(() => {
    const areaOrderMap = new Map<string, Map<number, Material[]>>();

    materials.value.forEach((m: Material) => {
      if (!m.area) return;
      if (!areaOrderMap.has(m.area)) {
        areaOrderMap.set(m.area, new Map());
      }
      const orderMap = areaOrderMap.get(m.area)!;
      if (!orderMap.has(m.order)) {
        orderMap.set(m.order, []);
      }
      orderMap.get(m.order)!.push(m);
    });

    const duplicates: Material[] = [];
    areaOrderMap.forEach((orderMap) => {
      orderMap.forEach((items) => {
        if (items.length > 1) {
          duplicates.push(...items);
        }
      });
    });

    return duplicates;
  });

  const missingSize = computed(() => {
    return materials.value.filter((m: Material) => !m.size || m.size.trim() === "");
  });

  const missingRisk = computed(() => {
    return materials.value.filter((m: Material) => !m.risk || m.risk.trim() === "");
  });

  const missingExpectedArrival = computed(() => {
    return materials.value.filter(
      (m: Material) => typeof (m as any).expectedArrivalTime !== "number"
    );
  });

  const overdueNotArrived = computed(() => {
    const now = Date.now();
    return materials.value.filter((m: Material) => {
      const expected = (m as any).expectedArrivalTime;
      const actual = (m as any).actualArrivalTime;
      return (
        typeof expected === "number" &&
        typeof actual !== "number" &&
        expected < now
      );
    });
  });

  const quantityShortage = computed(() => {
    return materials.value.filter((m: Material) => {
      const actualQty = (m as any).actualQuantity;
      return (
        typeof actualQty === "number" &&
        actualQty < m.quantity
      );
    });
  });

  const checkResult = computed<CheckResult>(() => ({
    zeroQuantity: zeroQuantity.value,
    duplicateOrder: duplicateOrder.value,
    missingSize: missingSize.value,
    missingRisk: missingRisk.value,
    missingExpectedArrival: missingExpectedArrival.value,
    overdueNotArrived: overdueNotArrived.value,
    quantityShortage: quantityShortage.value,
  }));

  const totalIssues = computed(() => {
    return (
      zeroQuantity.value.length +
      duplicateOrder.value.length +
      missingSize.value.length +
      missingRisk.value.length +
      missingExpectedArrival.value.length +
      overdueNotArrived.value.length +
      quantityShortage.value.length
    );
  });

  function hasIssue(materialId: string): boolean {
    return (
      zeroQuantity.value.some((m) => m.id === materialId) ||
      duplicateOrder.value.some((m) => m.id === materialId) ||
      missingSize.value.some((m) => m.id === materialId) ||
      missingRisk.value.some((m) => m.id === materialId) ||
      missingExpectedArrival.value.some((m) => m.id === materialId) ||
      overdueNotArrived.value.some((m) => m.id === materialId) ||
      quantityShortage.value.some((m) => m.id === materialId)
    );
  }

  function getMaterialIssues(materialId: string): string[] {
    const issues: string[] = [];
    if (zeroQuantity.value.some((m) => m.id === materialId)) {
      issues.push("数量为零");
    }
    if (duplicateOrder.value.some((m) => m.id === materialId)) {
      issues.push("顺序重复");
    }
    if (missingSize.value.some((m) => m.id === materialId)) {
      issues.push("尺寸缺失");
    }
    if (missingRisk.value.some((m) => m.id === materialId)) {
      issues.push("风险未填");
    }
    if (missingExpectedArrival.value.some((m) => m.id === materialId)) {
      issues.push("预计到场时间缺失");
    }
    if (overdueNotArrived.value.some((m) => m.id === materialId)) {
      issues.push("已逾期未到场");
    }
    if (quantityShortage.value.some((m) => m.id === materialId)) {
      const mat = quantityShortage.value.find((m) => m.id === materialId);
      if (mat) {
        const diff = mat.quantity - (mat as any).actualQuantity;
        issues.push(`数量短缺${diff}件`);
      } else {
        issues.push("数量短缺");
      }
    }
    return issues;
  }

  return {
    checkResult,
    zeroQuantity,
    duplicateOrder,
    missingSize,
    missingRisk,
    missingExpectedArrival,
    overdueNotArrived,
    quantityShortage,
    totalIssues,
    hasIssue,
    getMaterialIssues,
  };
}
