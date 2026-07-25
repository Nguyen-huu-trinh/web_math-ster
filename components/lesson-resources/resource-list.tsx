"use client";

import { ResourceCard } from "./resource-card";

interface Props {
  resources: any[];

  editable?: boolean;

  onEdit?: (resource: any) => void;

  onDelete?: (resource: any) => void;
}

export function ResourceList({
  resources,
  editable = false,
  onEdit,
  onDelete,
}: Props) {

  if (!resources.length) {

    return (

      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">

        No resources

      </div>

    );

  }

  return (

    <div className="space-y-3">

      {resources.map((resource) => (

        <ResourceCard
          key={resource.id}
          resource={resource}
          editable={editable}
          onEdit={onEdit}
          onDelete={onDelete}
        />

      ))}

    </div>

  );
}