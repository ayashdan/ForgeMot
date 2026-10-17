import { useCallback, useEffect, useState } from "react";
import { listSubcollection } from "../lib/data";

// Fetches a project's subcollection (tasks, materials, etc.) and exposes a
// `reload` so callers can refresh after a create/update/delete.
export function useSubcollection(projectId, name) {
  const [rows, setRows] = useState(null);

  const reload = useCallback(async () => {
    const data = await listSubcollection(projectId, name);
    setRows(data);
  }, [projectId, name]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, reload };
}
