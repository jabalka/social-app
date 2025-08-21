"use client";

import { AuthUser } from "@/models/auth.types";
import { ReportIssueReport } from "@/models/report-issue.types";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { FC, useState } from "react";
import LoaderModal from "./common/loader-modal";
import ModalOverlay from "./modal-overlay";
import ActionButtons from "./shared/action-buttons";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "REPORTED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

interface ReportIssueDetailsDialogProps {
  user: AuthUser;
  reportIssue: ReportIssueReport;
  open: boolean;
  onClose: () => void;
  theme: string;
}

const ReportIssueDetailsDialog: FC<ReportIssueDetailsDialogProps> = ({ user, reportIssue, open, onClose, theme }) => {
  const isReporter = user.id === reportIssue.reporterId;
  const isAdmin = user.roleId === "admin";
  const canEdit = isReporter || isAdmin;

  const [title, setTitle] = useState(reportIssue.title);
  const [description, setDescription] = useState(reportIssue.description);
  const [status, setStatus] = useState<Status>(reportIssue.status as Status);
  const [priority, setPriority] = useState<Priority>(reportIssue.priority as Priority);
  const [saving, setSaving] = useState(false);

  const anyChanged =
    title !== reportIssue.title ||
    description !== reportIssue.description ||
    status !== reportIssue.status ||
    priority !== reportIssue.priority;

  const handleSave = async () => {
    try {
      setSaving(true);
      await fetch(`/api/issues/${reportIssue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status, priority }),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalOverlay open={open} onClose={onClose} theme={theme}>
        <div
          className={cn("nf-scrollbar relative overflow-y-auto rounded-xl p-6", {
            "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
            "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
          })}
        >
          <h2 className="mb-4 text-lg font-semibold">Issue Details</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs opacity-70">Title</label>
              <input
                disabled={!canEdit}
                className={cn(
                  "mt-1 w-full rounded border px-2 py-1 text-sm",
                  theme === Theme.DARK ? "border-zinc-700 bg-zinc-800" : "border-zinc-300 bg-white",
                )}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs opacity-70">Priority</label>
              <select
                disabled={!canEdit}
                className={cn(
                  "mt-1 w-full rounded border px-2 py-1 text-sm",
                  theme === Theme.DARK ? "border-zinc-700 bg-zinc-800" : "border-zinc-300 bg-white",
                )}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="text-xs opacity-70">Status</label>
              <select
                disabled={!canEdit}
                className={cn(
                  "mt-1 w-full rounded border px-2 py-1 text-sm",
                  theme === Theme.DARK ? "border-zinc-700 bg-zinc-800" : "border-zinc-300 bg-white",
                )}
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="REPORTED">REPORTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs opacity-70">Description</label>
              <textarea
                disabled={!canEdit}
                className={cn(
                  "mt-1 w-full rounded border px-2 py-1 text-sm",
                  theme === Theme.DARK ? "border-zinc-700 bg-zinc-800" : "border-zinc-300 bg-white",
                )}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {canEdit && anyChanged && (
            <div className="mt-6 flex justify-center">
              <ActionButtons onCancel={onClose} onSubmit={handleSave} />
            </div>
          )}
        </div>
      </ModalOverlay>
      {saving && <LoaderModal />}
    </>
  );
};

export default ReportIssueDetailsDialog;
