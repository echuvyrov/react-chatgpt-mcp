import "./styles.css";
import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective
} from "@syncfusion/ej2-react-kanban";

const sprintData = [
  {
    Id: 1,
    Title: "Sprint planning",
    Status: "Backlog",
    Summary: "Define sprint goal and prioritize top items.",
    Assignee: "Nova",
    Tags: "Planning",
    RankId: 1
  },
  {
    Id: 2,
    Title: "Story grooming",
    Status: "Backlog",
    Summary: "Refine acceptance criteria for core stories.",
    Assignee: "Lyra",
    Tags: "Refinement",
    RankId: 2
  },
  {
    Id: 3,
    Title: "Auth API",
    Status: "In Progress",
    Summary: "Implement OAuth handshake and token refresh.",
    Assignee: "Orion",
    Tags: "Backend",
    RankId: 1
  },
  {
    Id: 4,
    Title: "Kanban UI polish",
    Status: "In Progress",
    Summary: "Add swimlanes, WIP limits, and styling.",
    Assignee: "Echo",
    Tags: "Frontend",
    RankId: 2
  },
  {
    Id: 5,
    Title: "QA checklist",
    Status: "Review",
    Summary: "Create regression checklist for release.",
    Assignee: "Lyra",
    Tags: "QA",
    RankId: 1
  },
  {
    Id: 6,
    Title: "Release notes",
    Status: "Done",
    Summary: "Draft and circulate sprint release notes.",
    Assignee: "Nova",
    Tags: "Docs",
    RankId: 1
  }
];

export default function HelloWidget() {
  return (
    <div className="hello-widget">
      <div className="board-card">
        <header className="board-header">
          <div className="board-title">Sprint Command</div>
          <div className="board-subtitle">Agile task board · Syncfusion Kanban</div>
        </header>
        <KanbanComponent
          id="sprint-board"
          keyField="Status"
          dataSource={sprintData}
          swimlaneSettings={{ keyField: "Assignee" }}
          cardSettings={{
            headerField: "Title",
            contentField: "Summary",
            tagsField: "Tags"
          }}
          height="360px"
        >
          <ColumnsDirective>
            <ColumnDirective headerText="Backlog" keyField="Backlog" />
            <ColumnDirective headerText="In Progress" keyField="In Progress" />
            <ColumnDirective headerText="Review" keyField="Review" />
            <ColumnDirective headerText="Done" keyField="Done" />
          </ColumnsDirective>
        </KanbanComponent>
      </div>
    </div>
  );
}
