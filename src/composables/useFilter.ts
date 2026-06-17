import { ref, computed } from "vue";
import type { Material, FilterState, MaterialStatus } from "@/types";
import { useMaterials } from "./useMaterials";

export function useFilter() {
  const { sortedMaterials } = useMaterials();

  const filter = ref<FilterState>({
    theme: "",
    area: "",
    statuses: [],
    quantityMin: null,
    quantityMax: null,
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

  function clearFilters() {
    filter.value = {
      theme: "",
      area: "",
      statuses: [],
      quantityMin: null,
      quantityMax: null,
    };
  }

  function hasActiveFilters(): boolean {
    return (
      filter.value.theme !== "" ||
      filter.value.area !== "" ||
      filter.value.statuses.length > 0 ||
      filter.value.quantityMin !== null ||
      filter.value.quantityMax !== null
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
    clearFilters,
    hasActiveFilters,
  };
}
