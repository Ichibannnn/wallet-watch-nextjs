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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { RoleRecord, UserRecord } from "@/lib/user-management/types";

export function UserDialog({
  open,
  onOpenChange,
  user,
  roles,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = create a new user; a record = edit that user. */
  user: UserRecord | null;
  roles: RoleRecord[];
  onSaved: () => void;
}) {
  const isEdit = user !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPassword("");
    setRoleId(user?.role?.id ?? "");
    setIsActive(user?.isActive ?? true);
  }, [open, user]);

  async function handleSave() {
    setSaving(true);
    try {
      const body = isEdit
        ? { name, roleId: roleId || null, isActive, ...(password ? { password } : {}) }
        : { name, email, password, roleId, isActive };

      const res = await fetch(isEdit ? `/api/users/${user.id}` : "/api/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload.error ?? "Could not save the user.");
        return;
      }
      toast.success(isEdit ? "User updated." : "User created.");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    name.trim().length >= 2 &&
    roleId.length > 0 &&
    (isEdit ? true : email.trim().length > 0 && password.length >= 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this account's role, status or password."
              : "Create an account and assign it a role."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="user-name">Full name</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isEdit}
            />
            {isEdit && <p className="text-xs text-muted-foreground">Email can't be changed.</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user-password">{isEdit ? "Reset password" : "Password"}</Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "Leave blank to keep current" : "At least 8 characters"}
              autoComplete="new-password"
            />
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={(value) => setRoleId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <Label htmlFor="user-active">Active</Label>
              <p className="text-xs text-muted-foreground">Disabled users can't sign in.</p>
            </div>
            <Switch id="user-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !canSubmit}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
