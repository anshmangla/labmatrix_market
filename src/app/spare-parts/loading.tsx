import React from "react";
import CatalogSkeleton from "@/components/listings/CatalogSkeleton";

export default function SparePartsLoading() {
  return (
    <CatalogSkeleton
      title="Spare Parts & Consumables"
      subtitle="Loading replacement boards, detectors, power supplies, and OEM spares..."
    />
  );
}
