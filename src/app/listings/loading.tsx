import React from "react";
import CatalogSkeleton from "@/components/listings/CatalogSkeleton";

export default function ListingsLoading() {
  return (
    <CatalogSkeleton
      title="Available Equipment"
      subtitle="Loading verified pre-owned & refurbished analytical instruments..."
    />
  );
}
