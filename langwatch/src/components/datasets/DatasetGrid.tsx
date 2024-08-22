import type { GridOptions } from "@ag-grid-community/core";
import {
  AgGridReact,
  type AgGridReactProps,
  type CustomCellEditorProps,
} from "@ag-grid-community/react";
import { Text } from "@chakra-ui/react";
import { useMemo, useRef } from "react";
import { MultilineCellEditor } from "./MultilineCellEditor";

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry, type ColDef } from "@ag-grid-community/core";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-balham.css";
import { z } from "zod";
import {
  datasetColumnTypeMapping,
  type DatasetColumnType,
} from "../../server/datasets/types";
import { RenderInputOutput } from "../traces/RenderInputOutput";
import { MultilineJSONCellEditor } from "./MultilineJSONCellEditor";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export const JSONCellRenderer = (props: { value: string | undefined }) => {
  return (
    <RenderInputOutput
      value={props.value}
      collapseStringsAfterLength={140}
      collapsed={(props.value?.toString().length ?? 0) > 1000}
    />
  );
};

type DatasetColumnDef = ColDef & { type: DatasetColumnType };

export function DatasetGrid(
  props: AgGridReactProps & {
    columnDefs: DatasetColumnDef[];
  }
) {
  const gridRef = useRef<AgGridReact>(null);
  const gridOptions: GridOptions = useMemo(
    () => ({
      rowDragManaged: true,
      rowDragMultiRow: true,
      undoRedoCellEditing: true,
      undoRedoCellEditingLimit: 50,
      groupSelectsChildren: true,
      suppressRowClickSelection: true,
    }),
    []
  );

  const columnDefs_ = useMemo(() => {
    return (props.columnDefs as DatasetColumnDef[])?.map(
      (column: DatasetColumnDef) => {
        const basicTypes = ["string", "number", "boolean", "date"];
        if (!basicTypes.includes(column.type)) {
          return {
            ...column,
            cellRenderer: JSONCellRenderer,
            cellEditor: (props: CustomCellEditorProps) => (
              <MultilineJSONCellEditor
                zodValidator={
                  datasetColumnTypeMapping[column.type as DatasetColumnType] ??
                  z.any()
                }
                {...props}
              />
            ),
          };
        } else {
          return {
            ...column,
            cellDataType: column.type === "string" ? "text" : column.type,
          };
        }
      }
    );
  }, [props.columnDefs]);

  return (
    <div className="ag-theme-balham">
      <style>{`
        .ag-theme-balham .ag-cell {
          white-space: pre-wrap; /* Enable word wrapping */
          overflow: visible; /* Ensure the cell expands to fit content */
          line-height: 1.6em;
          border-right: var(--ag-borders-critical) var(--ag-row-border-color);
        }
        .ag-cell-last-left-pinned .ag-cell-value {
          white-space: nowrap;
        }
        .ag-cell-last-left-pinned {
          background-color: var(--ag-header-background-color);
        }
        .ag-theme-balham .ag-cell .ag-cell-value {
          padding-top: 4px;
          padding-bottom: 4px;
          font-size: 13px;
        }
        .ag-header-cell-label {
          font-size: 13px;
        }
        .ag-theme-balham .ag-cell .chakra-textarea {
          height: 100%!important;
        }
        .ag-large-text, .ag-large-text-input, .ag-large-text-input > .ag-input-wrapper, .ag-input-wrapper > textarea {
          width: 100%;
          height: 100%!important;
          padding: 0;
        }
        .ag-cell-wrapper textarea {
          padding: 4px 11px;
          outline: none;
          border: none;
          line-height: 19.2px;
          font-feature-settings: "kern";
        }

        .ag-layout-auto-height .ag-center-cols-viewport, .ag-layout-auto-height .ag-center-cols-container {
          min-height: 29px;
        }
      `}</style>
      <AgGridReact
        ref={gridRef}
        gridOptions={gridOptions}
        loadingOverlayComponent={() => <Text paddingTop={4}>Loading...</Text>}
        reactiveCustomComponents={true}
        enableCellEditingOnBackspace={false}
        stopEditingWhenCellsLoseFocus={true}
        domLayout="autoHeight"
        defaultColDef={{
          flex: 1,
          minWidth: 10,
          resizable: true,
          sortable: true,
          filter: true,
          editable: true,
          autoHeight: true,
          cellEditor: MultilineCellEditor,
          enableCellChangeFlash: true,
          suppressKeyboardEvent: (props) => {
            if (props.event.key == "Enter" && props.event.shiftKey) {
              props.event.stopPropagation();
              return true;
            }
            return false;
          },
        }}
        {...props}
        columnDefs={columnDefs_}
      />
    </div>
  );
}
