import { ref, computed } from "vue";
import type { Material, FilterState, MaterialStatus, ArrivalStatus } from "@/types";
import { getArrivalStatus } from "@/types";
import { useMaterials } from "./useMaterials";

export function useFilter() {
  const { sortedMaterials } = useMaterials();

  const filter = ref<FilterState>({
    theme: "",
    area: "",
    statuses: [],
    quantityMin: null,
    quantityMax: null,
    arrivalBatch: "",
    arrivalStatuses: [],
  });

  const filteredMaterials = computed(() => {
    return sortedMaterials.value.filter((m: Material) => {
      if (filter.value.theme && m.theme !== filter.value.theme) {
        return false;
      }
      if (filter.value.area && m.area !== filter.value.area) {
        return false;
      }
      if (
        filter.value.statuses.length > 0 &&
        !filter.value.statuses.includes(m.status as MaterialStatus)
      ) {
        return false;
      }
      if (
        filter.value.quantityMin !== null &&
        m.quantity < filter.value.quantityMin
      ) {
        return false;
      }
      if (
        filter.value.quantityMax !== null &&
        m.quantity > filter.value.quantityMax
      ) {
        return false;
      }
      if (filter.value.arrivalBatch && m.arrivalBatch !== filter.value.arrivalBatch) {
        return false;
      }
      if (filter.value.arrivalStatuses.length > 0) {
        const arrivalStatus = getArrivalStatus(m);
        if (!filter.value.arrivalStatuses.includes(arrivalStatus)) {
          return false;
        }
      }
      return true;
    });
  });

  function setTheme(theme: string) {
    filter.value.theme = theme;
  }

  function setArea(area: string) {
    filter.value.area = area;
  }

  function toggleStatus(status: MaterialStatus) {
    const index = filter.value.statuses.indexOf(status);
    if (index === -1) {
      filter.value.statuses.push(status);
    } else {
      filter.value.statuses.splice(index, 1);
    }
  }

  function setQuantityMin(value: number | null) {
    filter.value.quantityMin = value;
  }

  function setQuantityMax(value: number | null) {
    filter.value.quantityMax = value;
  }

  function setArrivalBatch(batch: string) {
    filter.value.arrivalBatch = batch;
  }

  function toggleArrivalStatus(status: ArrivalStatus) {
    const index = filter.value.arrivalStatuses.indexOf(status);
    if (index === -1) {
      filter.value.arrivalStatuses.push(status);
    } else {
      filter.value.arrivalStatuses.splice(index, 1);
    }
  }

  function clearFilters() {
    filter.value = {
      theme: "",
      area: "",
      statuses: [],
      quantityMin: null,
      quantityMax: null,
      arrivalBatch: "",
      arrivalStatuses: [],
    };
  }

  function hasActiveFilters(): boolean {
    return (
      filter.value.theme !== "" ||
      filter.value.area !== "" ||
      filter.value.statuses.length > 0 ||
      filter.value.quantityMin !== null ||
      filter.value.quantityMax !== null ||
      filter.value.arrivalBatch !== "" ||
      filter.value.arrivalStatuses.length > 0
    );
  }

  return {
    filter,
    filteredMaterials,
    setTheme,
    setArea,
    toggleStatus,
    setQuantityMin,
    setQuantityMax,
    setArrivalBatch,
    toggleArrivalStatus,
    clearFilters,
    hasActiveFilters,
  };
}
