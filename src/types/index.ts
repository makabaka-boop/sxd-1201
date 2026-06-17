export type MaterialStatus =
  | "pending-prep"
  | "pending-review"
  | "ready"
  | "hold";

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
}

export interface FilterState {
  theme: string;
  area: string;
  statuses: MaterialStatus[];
  quantityMin: number | null;
  quantityMax: number | null;
}

export interface CheckResult {
  zeroQuantity: Material[];
  duplicateOrder: Material[];
  missingSize: Material[];
  missingRisk: Material[];
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
