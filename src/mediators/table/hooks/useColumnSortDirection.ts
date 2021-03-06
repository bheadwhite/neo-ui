import { useState, useMemo, useEffect } from "react";
import useTable from "./useTable";

const useColumnSortDirection = (name: string) => {
  const table = useTable();
  const sort = table.sorting.value.find((c) => c.name === name);
  const [direction, setDirection] = useState(sort?.direction || "ASC");

  const subscription = useMemo(() => {
    return table.sorting.onChange((sorts) => {
      const sort = sorts.find((s) => s.name === name);
      setDirection(sort?.direction || "ASC");
    });
  }, [table, name]);

  useEffect(() => () => subscription.unsubscribe(), [subscription]);

  return direction;
};

export default useColumnSortDirection;
