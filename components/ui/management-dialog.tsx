import type { LucideIcon } from "lucide-react";
import { DialogDescription, DialogHeader, DialogTitle } from "./dialog";

export const managementDialogClass = "max-h-[90dvh] gap-0 overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-0 text-slate-800 sm:max-w-[620px] [&>[data-slot=dialog-close]]:right-6 [&>[data-slot=dialog-close]]:top-7 [&>[data-slot=dialog-close]]:rounded-2xl [&>[data-slot=dialog-close]]:bg-slate-800 [&>[data-slot=dialog-close]]:text-slate-400";
export const managementFormClass = "space-y-6 px-6 pt-8 sm:px-8 [&_label]:font-bold [&_label]:text-slate-700 [&_input:not([type=checkbox])]:h-12 [&_input:not([type=checkbox])]:rounded-2xl [&_input:not([type=checkbox])]:border-slate-200 [&_input:not([type=checkbox])]:bg-slate-50/60 [&_input:not([type=checkbox])]:font-semibold [&_input]:placeholder:text-slate-400 [&_textarea]:rounded-2xl [&_textarea]:border-slate-200 [&_textarea]:bg-slate-50/60 [&_textarea]:placeholder:text-slate-400";
export const managementFooterClass = "mx-0 mb-0 -mr-6 -ml-6 gap-3 rounded-none border-slate-100 bg-slate-50 px-6 py-6 sm:-mr-8 sm:-ml-8 sm:px-8";
export const managementCancelClass = "h-12 rounded-2xl border-slate-200 bg-white px-6 font-bold text-slate-700";
export const managementSaveClass = "h-12 rounded-2xl bg-slate-900 px-6 font-bold text-white hover:bg-slate-800";

export function ManagementDialogHeader({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <DialogHeader className="flex-row items-center gap-4 bg-slate-900 px-6 py-7 pr-20 sm:px-8 sm:pr-20">
    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400"><Icon className="size-6" /></div>
    <div className="space-y-1"><DialogTitle className="text-xl font-extrabold text-white">{title}</DialogTitle><DialogDescription className="text-sm font-medium text-slate-400">{description}</DialogDescription></div>
  </DialogHeader>;
}
