"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PermissionMatrix,
  emptyMatrix,
  matrixFromPermissions,
  matrixToPermissions,
  type PermissionState,
} from "@/components/user-management/permission-matrix";
import type { RoleRecord } from "@/lib/user-management/types";

export function RoleDialog({
  open,
  onOpenChange,
  role,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = create a new role; a record = edit that role. */
  role: RoleRecord | null;
  onSaved: () => void;
}) {
  const isEdit = role !== null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [matrix, setMatrix] = useState<PermissionState>(emptyMatrix());
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the dialog opens for a different role.
  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setMatrix(role ? matrixFromPermissions(role.permissions) : emptyMatrix());
  }, [open, role]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/roles/${role.id}` : "/api/roles", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          permissions: matrixToPermissions(matrix),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.error ?? "Could not save the role.");
        return;
      }
      toast.success(isEdit ? "Role updated." : "Role created.");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit role" : "Create role"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this role's details and module permissions."
              : "Name the role and choose what each module allows."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Accountant"
              disabled={role?.isSystem}
            />
            {role?.isSystem && (
              <p className="text-xs text-muted-foreground">Built-in role — name can't be changed.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — what this role is for"
            />
          </div>

          <div className="grid gap-2">
            <Label>Module permissions</Label>
            <PermissionMatrix value={matrix} onChange={setMatrix} disabled={saving} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || name.trim().length < 2}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
