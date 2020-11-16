import React, { useEffect, useState, useRef, useCallback } from "react";
import TableHeader from "./TableHeader";
import Surface from "../../core/Surface";
import useTable from "../../mediators/table/hooks/useTable";
import TableRow from "./TableRow";
import useOnRowsChange from "../../mediators/table/hooks/useOnRowsChange";
import styled from "styled-components";
import TableStatus from "./TableStatus";
import TableLoadingRow from "./TableLoadingRow";

const TableScrollerSurface = styled(Surface)`
  position: relative;
  border: 4px ridge rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
  min-width: 200px;
  width: 100px;
  height: 100px;
`;

const TableScrollerContainer = styled.div`
  position: absolute;
  top: 0px;
  bottom: 25px;
  left: 0px;
  right: 0px;
  overflow: auto;
`;

const TableSyledHeader = styled(TableHeader)`
  position: sticky;
  top: 0;
  left: 0;
  min-width: 100%;
  z-index: 1;
`;

const TableContent = styled.div`
  position: relative;
  min-width: 100%;
  min-height: 100%;
  z-index: 0;
`;

const StyledTableStatus = styled(TableStatus)`
  position: absolute;
  bottom: 0px;
  left: 0px;
  height: 25px;
  width: 100%;
  z-index: 2;
`;

interface Props {
  style?: React.CSSProperties;
  className?: string;
}

interface Range {
  startY: number;
  endY: number;
}

const OFFSET_Y = 25;
const ROW_HEIGHT = 40;
const STATUS_HEIGHT = 40;

const TableDataScroller = ({ style, className }: Props) => {
  useOnRowsChange();
  const table = useTable();
  const tableScrollerRef = useRef<HTMLDivElement | null>(null);
  const [range, setRange] = useState<Range>({ startY: 0, endY: 0 });

  const rowsData = table.getRowsWithinRange(
    OFFSET_Y,
    ROW_HEIGHT,
    range.startY,
    range.endY
  );

  const tableState = table.getLoadingState();
  const isFinished = tableState === "disabled";
  const height = table.getLoadedRowsLength() * ROW_HEIGHT;
  const width = table.getContentWidth();

  const tableContentStyle = {
    width: width + "px",
    height: height + OFFSET_Y + (isFinished ? 0 : STATUS_HEIGHT) + "px",
  };

  const tableLoadingRowStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    display: "none",
  } as React.CSSProperties;

  if (tableState === "pending") {
    tableLoadingRowStyle.transform = `translate(0px, ${height + OFFSET_Y}px)`;
    tableLoadingRowStyle.display = "grid";
  }

  const updateRect = useCallback(() => {
    if (tableScrollerRef.current != null) {
      const element = tableScrollerRef.current;
      const rect = element.getBoundingClientRect();
      const scrollTop = element.scrollTop;

      setRange({
        startY: scrollTop,
        endY: rect.height + scrollTop,
      });
    }
  }, [table]);

  const onScroll = () => {
    const element = tableScrollerRef.current;
    updateRect();

    if (
      element != null &&
      element.scrollTop === element.scrollHeight - element.offsetHeight
    ) {
      table.loadNextBatch();
    }
  };

  useEffect(() => {
    updateRect();
  }, []);

  useEffect(() => {
    const observer = new (ResizeObserver as any)(() => {
      updateRect();
    });

    observer.observe(tableScrollerRef.current);

    return () => observer.disconnect();
  }, [updateRect]);

  return (
    <TableScrollerSurface
      mode="cutOut"
      insetOffset={2}
      className={className}
      style={style}
    >
      <TableScrollerContainer ref={tableScrollerRef} onScroll={onScroll}>
        <TableContent style={tableContentStyle}>
          <TableSyledHeader />
          {rowsData.map((data, index) => {
            const y = index * ROW_HEIGHT + OFFSET_Y + range.startY;

            const style = {
              position: "absolute",
              top: "0px",
              left: "0px",
              transform: `translate(${data.x}px, ${data.y}px)`,
            } as React.CSSProperties;

            return <TableRow key={data.row.id} row={data.row} style={style} />;
          })}
          {!isFinished && <TableLoadingRow style={tableLoadingRowStyle} />}
        </TableContent>
      </TableScrollerContainer>
      <StyledTableStatus />
    </TableScrollerSurface>
  );
};

export default TableDataScroller;
