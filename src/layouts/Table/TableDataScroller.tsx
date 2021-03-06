import React, { useEffect, useState, useRef, useCallback } from "react";
import TableHeader from "./TableHeader";
import Surface from "../../core/Surface";
import useTable from "../../mediators/table/hooks/useTable";
import TableRow from "./TableRow";
import useRows from "../../mediators/table/hooks/useRows";
import styled from "styled-components";
import TableStatus from "./TableStatus";
import TableLoadingRow from "./TableLoadingRow";
import TableMediator, { Row } from "../../mediators/table/TableMediator";
import useTableStatus from "../../mediators/table/hooks/useTableStatus";

const RaisedContainer = styled(Surface)`
  min-height: 200px;
  min-width: 200px;
  width: 200px;
  height: 200px;
  padding: 0px 6px;
  border-radius: 8px;
`;

const InsetContainer = styled(Surface)`
  position: relative;
  border-radius: 8px;
  width: 100%;
  height: 100%;
`;

const TableScrollerContainer = styled.div`
  position: absolute;
  top: 0px;
  bottom: 34px;
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
  height: 34px;
  width: 100%;
  z-index: 2;
`;

interface Props {
  style?: React.CSSProperties;
  className?: string;
  onRowClick?: (
    row: Row<any>,
    table: TableMediator<any>,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
}

interface Range {
  startY: number;
  endY: number;
}

const OFFSET_Y = 37;
const ROW_HEIGHT = 40;
const STATUS_HEIGHT = 40;

function getRowsWithinRange(
  rows: Row<any>[],
  offsetY: number,
  rowHeight: number,
  startY: number,
  endY: number,
  contentWidth: number
) {
  startY = startY - offsetY;
  endY = endY - offsetY;

  let startIndex = Math.floor(startY / rowHeight);
  let endIndex = Math.ceil(endY / rowHeight);

  startIndex = Math.max(0, startIndex);
  endIndex = Math.min(rows.length - 1, endIndex);

  return rows.slice(startIndex, endIndex + 1).map((row, index) => {
    return {
      row: row,
      x: 0,
      y: (startIndex + index) * rowHeight + offsetY,
      width: contentWidth,
      height: rowHeight,
    };
  });
}

const TableDataScroller = ({ style, className, onRowClick }: Props) => {
  const rows = useRows();
  const table = useTable();
  const tableStatus = useTableStatus();
  const tableScrollerRef = useRef<HTMLDivElement | null>(null);
  const [range, setRange] = useState<Range>({ startY: 0, endY: 0 });

  const width = table.getContentWidth();
  const rowsData = getRowsWithinRange(
    rows,
    OFFSET_Y,
    ROW_HEIGHT,
    range.startY,
    range.endY,
    width
  );

  const isFinished = tableStatus === "disabled";
  const height = table.getLoadedRowsLength() * ROW_HEIGHT;

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

  if (tableStatus === "pending") {
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
      !isFinished &&
      element != null &&
      element.scrollTop >= element.scrollHeight - element.offsetHeight
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
    <RaisedContainer
      className={className}
      style={style}
      mode="raised"
      raisedOffset={7}
      raisedSpread={14}
    >
      <InsetContainer mode="cutOut" insetOffset={2}>
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

              return (
                <TableRow
                  key={data.row.id}
                  row={data.row}
                  style={style}
                  onRowClick={onRowClick}
                />
              );
            })}
            {!isFinished && <TableLoadingRow style={tableLoadingRowStyle} />}
          </TableContent>
        </TableScrollerContainer>
        <StyledTableStatus />
      </InsetContainer>
    </RaisedContainer>
  );
};

export default TableDataScroller;
