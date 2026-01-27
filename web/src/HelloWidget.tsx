import "./styles.css";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export default function HelloWidget() {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#5b5ce2" },
      secondary: { main: "#ff8c57" }
    },
    typography: {
      fontFamily: "\"Futura\", \"Avenir Next\", \"Helvetica Neue\", sans-serif"
    }
  });

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, editable: true },
    { field: "role", headerName: "Role", flex: 1, editable: true },
    { field: "status", headerName: "Status", flex: 1, editable: true },
    {
      field: "score",
      headerName: "Score",
      type: "number",
      flex: 0.5,
      minWidth: 90,
      editable: true
    }
  ];

  const rows = [
    { id: 1, name: "Nova", role: "Navigator", status: "Active", score: 94 },
    { id: 2, name: "Echo", role: "Strategist", status: "Queued", score: 88 },
    { id: 3, name: "Lyra", role: "Builder", status: "Active", score: 91 },
    { id: 4, name: "Orion", role: "Watcher", status: "Paused", score: 76 }
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className="hello-widget">
        <div className="grid-card">
          <div className="grid-header">
            <span className="grid-title">Hello World Console</span>
            <span className="grid-subtitle">Editable MUI X Data Grid</span>
          </div>
          <div className="grid-body">
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              hideFooter
              density="compact"
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
