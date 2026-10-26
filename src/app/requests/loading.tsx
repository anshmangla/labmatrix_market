import React from "react";
import CatalogSkeleton from "@/components/listings/CatalogSkeleton";

export default function RequestsLoading() {
  return (
    <CatalogSkeleton
      title="Buyer Requests"
      subtitle="Loading active laboratory sourcing requirements and procurement RFQs..."
    />
  );
}
