export type MaterialStatus =
  | "pending-prep"
  | "pending-review"
  | "ready"
  | "hold";

export type ArrivalStatus =
  | "pending"
  | "arrived"
  | "overdue"
  | "not-set";

export type AbnormalType =
  | "quantity-shortage"
  | "overdue"
  | "no-expected-time"
  | "none";

export interface Material {
  id: string;
  name: string;
  theme: string;
  area: string;
  quantity: number;
  size: string;
  order: number;
  risk: string;
  status: MaterialStatus;
  createdAt: number;
  updatedAt: number;
  arrivalBatch: string;
  expectedArrivalTime: number | null;
  actualArrivalTime: number | null;
  actualQuantity: number | null;
  receiver: string;
  arrivalRemark: string;
  abnormalRemark: string;
}

export interface FilterState {
  theme: string;
  area: string;
  statuses: MaterialStatus[];
  quantityMin: number | null;
  quantityMax: number | null;
  arrivalBatch: string;
  arrivalStatuses: ArrivalStatus[];
  abnormalTypes: AbnormalType[];
}

export interface CheckResult {
  zeroQuantity: Material[];
  duplicateOrder: Material[];
  missingSize: Material[];
  missingRisk: Material[];
  missingExpectedArrival: Material[];
  overdueNotArrived: Material[];
  quantityShortage: Material[];
}

export const STATUS_LABELS: Record<MaterialStatus, string> = {
  "pending-prep": "待准备",
  "pending-review": "待复核",
  ready: "可摆放",
  hold: "暂不使用",
};

export const STATUS_COLORS: Record<MaterialStatus, string> = {
  "pending-prep": "bg-gray-500",
  "pending-review": "bg-blue-500",
  ready: "bg-green-500",
  hold: "bg-red-500",
};

export const STATUS_TEXT_COLORS: Record<MaterialStatus, string> = {
  "pending-prep": "text-gray-400",
  "pending-review": "text-blue-400",
  ready: "text-green-400",
  hold: "text-red-400",
};

export const STATUS_BG_COLORS: Record<MaterialStatus, string> = {
  "pending-prep": "bg-gray-500/10",
  "pending-review": "bg-blue-500/10",
  ready: "bg-green-500/10",
  hold: "bg-red-500/10",
};

export const ARRIVAL_STATUS_LABELS: Record<ArrivalStatus, string> = {
  pending: "待到场",
  arrived: "已到场",
  overdue: "已逾期",
  "not-set": "未设置",
};

export const ARRIVAL_STATUS_COLORS: Record<ArrivalStatus, string> = {
  pending: "bg-yellow-500",
  arrived: "bg-green-500",
  overdue: "bg-red-500",
  "not-set": "bg-gray-500",
};

export const ARRIVAL_STATUS_TEXT_COLORS: Record<ArrivalStatus, string> = {
  pending: "text-yellow-400",
  arrived: "text-green-400",
  overdue: "text-red-400",
  "not-set": "text-gray-400",
};

export const ARRIVAL_STATUS_BG_COLORS: Record<ArrivalStatus, string> = {
  pending: "bg-yellow-500/10",
  arrived: "bg-green-500/10",
  overdue: "bg-red-500/10",
  "not-set": "bg-gray-500/10",
};

export const ABNORMAL_TYPE_LABELS: Record<AbnormalType, string> = {
  "quantity-shortage": "数量短缺",
  overdue: "已逾期",
  "no-expected-time": "无预计到场",
  none: "正常",
};

export const ABNORMAL_TYPE_COLORS: Record<AbnormalType, string> = {
  "quantity-shortage": "bg-orange-500",
  overdue: "bg-red-500",
  "no-expected-time": "bg-purple-500",
  none: "bg-green-500",
};

export const ABNORMAL_TYPE_TEXT_COLORS: Record<AbnormalType, string> = {
  "quantity-shortage": "text-orange-400",
  overdue: "text-red-400",
  "no-expected-time": "text-purple-400",
  none: "text-green-400",
};

export const ABNORMAL_TYPE_BG_COLORS: Record<AbnormalType, string> = {
  "quantity-shortage": "bg-orange-500/10",
  overdue: "bg-red-500/10",
  "no-expected-time": "bg-purple-500/10",
  none: "bg-green-500/10",
};

export function getArrivalStatus(material: Material): ArrivalStatus {
  const expected =
    typeof (material as any).expectedArrivalTime === "number"
      ? (material as any).expectedArrivalTime
      : null;
  const actual =
    typeof (material as any).actualArrivalTime === "number"
      ? (material as any).actualArrivalTime
      : null;
  if (!expected && !actual) {
    return "not-set";
  }
  if (actual) {
    return "arrived";
  }
  if (expected && expected < Date.now()) {
    return "overdue";
  }
  return "pending";
}

export function getAbnormalTypes(material: Material): AbnormalType[] {
  const types: AbnormalType[] = [];
  const expected =
    typeof material.expectedArrivalTime === "number"
      ? material.expectedArrivalTime
      : null;
  const actual =
    typeof material.actualArrivalTime === "number"
      ? material.actualArrivalTime
      : null;
  const actualQty =
    typeof material.actualQuantity === "number" ? material.actualQuantity : null;

  if (!expected) {
    types.push("no-expected-time");
  }

  if (expected && !actual && expected < Date.now()) {
    types.push("overdue");
  }

  if (actualQty !== null && actualQty < material.quantity) {
    types.push("quantity-shortage");
  }

  return types;
}

export function hasAbnormal(material: Material): boolean {
  return getAbnormalTypes(material).length > 0;
}

export function getQuantityDiff(material: Material): number {
  const actualQty =
    typeof material.actualQuantity === "number" ? material.actualQuantity : null;
  if (actualQty === null) return 0;
  return actualQty - material.quantity;
}

export function formatTimestamp(ts: number | null | undefined): string {
  if (typeof ts !== "number") return "-";
  return new Date(ts).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
