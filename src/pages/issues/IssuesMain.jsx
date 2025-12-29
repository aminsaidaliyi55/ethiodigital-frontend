import React, { useState } from "react";
import IssuesList from "./IssuesList";
import AdminAction from "./AdminAction";
import ReportIssue from "./ReportIssue"; // Import the new component

const IssuesMain = ({ filter }) => {
    const [view, setView] = useState("list"); // 'list', 'action', or 'report'
    const [selectedIssue, setSelectedIssue] = useState(null);

    return (
        <div className="w-full">
            {view === "list" && (
                <IssuesList
                    filter={filter}
                    onViewDetails={(issue) => {
                        setSelectedIssue(issue);
                        setView("action");
                    }}
                    onReportNew={() => setView("report")} // Pass this to IssuesList button
                />
            )}

            {view === "action" && (
                <AdminAction
                    issue={selectedIssue}
                    onBack={() => setView("list")}
                />
            )}

            {view === "report" && (
                <ReportIssue
                    onBack={() => setView("list")}
                    onSuccess={() => setView("list")}
                />
            )}
        </div>
    );
};

export default IssuesMain;