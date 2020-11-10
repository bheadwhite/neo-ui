import React, { useState } from "react";
import styled from "styled-components";
import { Column } from "../../mediators/table/TableMediator";
import useTable from "../../mediators/table/hooks/useTable";
import useColumnSortDirection from "../../mediators/table/hooks/useColumnSortDirection";

const ColumnContainer = styled.div`
  :first-child {
    border-left: 1px solid rgba(255, 255, 255, 0);
  }
  :last-child {
    border-right: 1px solid rgba(190, 200, 215, 0);
  }
  position: relative;
  text-align: center;
  line-height: 25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(100, 110, 140, 1);
  border-bottom: 1px solid rgba(190, 200, 215, 1);
  border-left: 1px solid rgba(255, 255, 255, 1);
  border-right: 1px solid rgba(190, 200, 215, 1);
  box-sizing: border-box;
  font-family: Verdana, Geneva, sans-serif;
  font-size: 11px;
  padding: 0px 8px;
  cursor: pointer;
  user-select: none;
`;

export interface Props {
  column: Column;
  children?: React.ReactNode | React.ReactNode[];
  style?: React.CSSProperties;
  className?: string;
}

const TableColumn = ({ column, children, style, className }: Props) => {
  const table = useTable();
  const [state, setState] = useState("released");
  const direction = useColumnSortDirection(column.name);

  const press = () => {
    if (!column.canSort) {
      return;
    }

    setState("pressed");
  };

  const release = () => {
    if (!column.canSort) {
      return;
    }

    setState("released");
  };

  const toggleSortDirection = () => {
    if (!column.canSort) {
      return;
    }

    if (direction === "ASC") {
      table.addSort(column.name, "DESC");
    } else {
      table.addSort(column.name, "ASC");
    }
  };

  let activeStyle = {} as React.CSSProperties;

  if (state === "pressed") {
    activeStyle = {
      top: "1px",
      borderBottom: "1px solid rgba(190, 200, 215, 0)",
      cursor: column.canSort ? "pointer" : "default",
      textAlign: column.alignment,
    };
  } else {
    activeStyle = {
      top: "0px",
      borderBottom: "1px solid rgba(190, 200, 215, 1)",
      cursor: column.canSort ? "pointer" : "default",
      textAlign: column.alignment,
    };
  }

  return (
    <ColumnContainer
      onMouseDown={press}
      onMouseUp={release}
      onMouseLeave={release}
      onClick={toggleSortDirection}
      style={{ ...style, ...activeStyle }}
      className={className}
    >
      {children}
    </ColumnContainer>
  );
};

export default TableColumn;
