import type { Material } from "@/types";
import {
  STATUS_LABELS,
  ARRIVAL_STATUS_LABELS,
  ABNORMAL_TYPE_LABELS,
  getArrivalStatus,
  getAbnormalTypes,
  formatTimestamp,
} from "@/types";

export function useExport() {
  function materialsToCSV(materials: Material[]): string {
    const headers = [
      "物料名称",
      "展示主题",
      "所在区域",
      "计划数量",
      "实际到场数量",
      "到场差异",
      "尺寸",
      "摆放顺序",
      "风险说明",
      "复核状态",
      "到场批次",
      "预计到场时间",
      "实际到场时间",
      "到场状态",
      "签收人",
      "到场备注",
      "异常类型",
      "实到数量",
      "异常说明",
      "处理负责人",
      "预计补救时间",
      "创建时间",
      "更新时间",
    ];

    const rows = materials.map((m) => {
      const actualQty = typeof m.actualQuantity === "number" ? m.actualQuantity : null;
      const qtyDiff = actualQty !== null ? actualQty - m.quantity : null;
      const abnormalTypes = getAbnormalTypes(m);
      const abnormalTypeStr = abnormalTypes
        .map((t) => ABNORMAL_TYPE_LABELS[t])
        .join("、");

      return [
        m.name,
        m.theme,
        m.area,
        m.quantity.toString(),
        actualQty !== null ? actualQty.toString() : "-",
        qtyDiff !== null ? (qtyDiff > 0 ? `+${qtyDiff}` : `${qtyDiff}`) : "-",
        m.size,
        m.order.toString(),
        m.risk,
        STATUS_LABELS[m.status] || m.status,
        m.arrivalBatch,
        formatTimestamp(m.expectedArrivalTime),
        formatTimestamp(m.actualArrivalTime),
        ARRIVAL_STATUS_LABELS[getArrivalStatus(m)],
        m.receiver || "-",
        m.arrivalRemark,
        abnormalTypeStr || "正常",
        actualQty !== null ? actualQty.toString() : "-",
        m.abnormalRemark || "-",
        m.abnormalHandler || "-",
        formatTimestamp(m.expectedResolutionTime),
        new Date(m.createdAt).toLocaleString("zh-CN"),
        new Date(m.updatedAt).toLocaleString("zh-CN"),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            if (escaped.includes(",") || escaped.includes("\n")) {
              return `"${escaped}"`;
            }
            return escaped;
          })
          .join(",")
      )
      .join("\n");

    return "\uFEFF" + csvContent;
  }

  function exportCSV(materials: Material[], filename?: string) {
    const csv = materialsToCSV(materials);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      filename || `物料清单_${timestamp}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportReviewTable(materials: Material[], filename?: string) {
    const headers = [
      "主题",
      "区域",
      "顺序",
      "物料名称",
      "计划数量",
      "实到数量",
      "到场差异",
      "尺寸",
      "状态",
      "风险说明",
      "到场批次",
      "预计到场时间",
      "实际到场时间",
      "到场状态",
      "签收人",
      "到场备注",
      "异常类型",
      "实到数量",
      "异常说明",
      "处理负责人",
      "预计补救时间",
      "复核结果",
      "备注",
    ];

    const sorted = [...materials].sort((a, b) => {
      if (a.theme !== b.theme) return a.theme.localeCompare(b.theme);
      if (a.area !== b.area) return a.area.localeCompare(b.area);
      return a.order - b.order;
    });

    const rows = sorted.map((m) => {
      const actualQty = typeof m.actualQuantity === "number" ? m.actualQuantity : null;
      const qtyDiff = actualQty !== null ? actualQty - m.quantity : null;
      const abnormalTypes = getAbnormalTypes(m);
      const abnormalTypeStr = abnormalTypes
        .map((t) => ABNORMAL_TYPE_LABELS[t])
        .join("、");

      return [
        m.theme,
        m.area,
        m.order.toString(),
        m.name,
        m.quantity.toString(),
        actualQty !== null ? actualQty.toString() : "-",
        qtyDiff !== null ? (qtyDiff > 0 ? `+${qtyDiff}` : `${qtyDiff}`) : "-",
        m.size,
        STATUS_LABELS[m.status] || m.status,
        m.risk,
        m.arrivalBatch,
        formatTimestamp(m.expectedArrivalTime),
        formatTimestamp(m.actualArrivalTime),
        ARRIVAL_STATUS_LABELS[getArrivalStatus(m)],
        m.receiver || "-",
        m.arrivalRemark,
        abnormalTypeStr || "正常",
        actualQty !== null ? actualQty.toString() : "-",
        m.abnormalRemark || "-",
        m.abnormalHandler || "-",
        formatTimestamp(m.expectedResolutionTime),
        "",
        "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            if (escaped.includes(",") || escaped.includes("\n")) {
              return `"${escaped}"`;
            }
            return escaped;
          })
          .join(",")
      )
      .join("\n");

    const csv = "\uFEFF" + csvContent;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      filename || `现场复核表_${timestamp}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return {
    materialsToCSV,
    exportCSV,
    exportReviewTable,
  };
}
