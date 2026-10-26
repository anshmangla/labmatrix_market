import React from "react";
import CatalogSkeleton from "@/components/listings/CatalogSkeleton";

export default function NewInstrumentsLoading() {
  return (
    <CatalogSkeleton
      title="Brand New Instruments"
      subtitle="Loading factory-sealed instruments with full OEM manufacturer warranties..."
    />
  );
}
