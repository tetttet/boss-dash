"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { User, Role, Civility, UpdateUserPayload } from "@/types/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Trash2,
  Pencil,
  Save,
  X,
  Shield,
} from "lucide-react";

type SortField = "name" | "email" | "role" | "created_at";
type SortOrder = "asc" | "desc";

function getSortIcon(sortField: SortField, sortOrder: SortOrder, field: SortField) {
  if (sortField !== field) return <ArrowUpDown className="size-3" />;
  return sortOrder === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />;
}

function formatDate(v?: string | null) {
  if (!v) return "-";
  // БД может отдавать TIMESTAMPTZ. Покажем просто YYYY-MM-DD
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function UsersTable() {
  const { apiFetch, user: authUser } = useAuth();

  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserPayload>({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setNotice(null);

      const res = await apiFetch("/api/users", { method: "GET" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Failed to load users (${res.status})`);
      }
      const data = (await res.json()) as User[];
      setRows(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = rows.filter((u) => {
      if (!q) return true;
      const hay = `${u.firstname} ${u.lastname} ${u.email} ${u.mobilephone ?? ""} ${u.role}`.toLowerCase();
      return hay.includes(q);
    });

    filtered.sort((a, b) => {
      let cmp = 0;

      if (sortField === "name") {
        cmp = `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`);
      } else if (sortField === "email") {
        cmp = a.email.localeCompare(b.email);
      } else if (sortField === "role") {
        cmp = a.role.localeCompare(b.role);
      } else if (sortField === "created_at") {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        cmp = ta - tb;
      }

      return sortOrder === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [rows, searchQuery, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  useEffect(() => {
    // если фильтр уменьшил страницы
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectAll = () => {
    if (pageRows.length === 0) return;
    const pageIds = pageRows.map((u) => u.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    else setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const startEdit = (u: User) => {
    setNotice(null);
    setError(null);
    setEditingId(u.id);
    setEditForm({
      civility: (u.civility ?? undefined) as Civility | undefined,
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      mobilephone: u.mobilephone ?? "",
      role: u.role,
      birthday: u.birthday ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      setError(null);
      setNotice(null);

      const res = await apiFetch(`/api/users/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Update failed (${res.status})`);
      }

      const updated = (await res.json()) as User;
      setRows((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setNotice("User updated");
      cancelEdit();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteOne = async (id: string) => {
    // логично: не даём удалить самого себя (можешь убрать)
    if (authUser?.id && authUser.id === id) {
      setError("You cannot delete your own account.");
      return;
    }

    const ok = confirm("Delete this user? This action cannot be undone.");
    if (!ok) return;

    try {
      setError(null);
      setNotice(null);

      const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Delete failed (${res.status})`);
      }

      setRows((prev) => prev.filter((u) => u.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      setNotice("User deleted");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const deleteSelected = async () => {
    const ids = selectedIds.slice();
    if (ids.length === 0) return;

    // исключим себя
    const filtered = authUser?.id ? ids.filter((id) => id !== authUser.id) : ids;

    const ok = confirm(`Delete ${filtered.length} user(s)? This action cannot be undone.`);
    if (!ok) return;

    try {
      setError(null);
      setNotice(null);

      for (const id of filtered) {
        const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || `Failed deleting user ${id}`);
        }
      }

      setRows((prev) => prev.filter((u) => !filtered.includes(u.id)));
      setSelectedIds([]);
      setNotice("Selected users deleted");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bulk delete failed");
    }
  };

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-xl border px-4 py-8">
        <div className="text-sm text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-base flex items-center gap-2">
            <Shield className="size-4" />
            Users
          </h3>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                setSelectedIds([]);
              }}
              className="pl-8 h-8 text-sm bg-muted/50 border-border/50"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-muted/50 border-border/50">
                <ArrowUpDown className="size-3.5" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => toggleSort("name")}>
                Name {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort("email")}>
                Email {sortField === "email" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort("role")}>
                Role {sortField === "role" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSort("created_at")}>
                Created {sortField === "created_at" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" className="h-8 gap-1.5" onClick={deleteSelected}>
              <Trash2 className="size-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          )}

          <Button variant="outline" size="sm" className="h-8" onClick={fetchUsers}>
            Refresh
          </Button>
        </div>
      </div>

      {(error || notice) && (
        <div className="px-4 py-3 border-b">
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!error && notice && <div className="text-sm text-emerald-600">{notice}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={pageRows.length > 0 && pageRows.every((u) => selectedIds.includes(u.id))}
                  onCheckedChange={toggleSelectAll}
                  className="border-border/50 bg-background/70"
                />
              </TableHead>

              <TableHead className="min-w-[220px]">
                <button
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort("name")}
                >
                  <span>Name</span>
                  {getSortIcon(sortField, sortOrder, "name")}
                </button>
              </TableHead>

              <TableHead className="min-w-[220px]">
                <button
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort("email")}
                >
                  <span>Email</span>
                  {getSortIcon(sortField, sortOrder, "email")}
                </button>
              </TableHead>

              <TableHead className="min-w-[140px]">
                <button
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort("role")}
                >
                  <span>Role</span>
                  {getSortIcon(sortField, sortOrder, "role")}
                </button>
              </TableHead>

              <TableHead className="min-w-[140px]">Phone</TableHead>
              <TableHead className="min-w-[120px]">Birthday</TableHead>

              <TableHead className="min-w-[140px]">
                <button
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort("created_at")}
                >
                  <span>Created</span>
                  {getSortIcon(sortField, sortOrder, "created_at")}
                </button>
              </TableHead>

              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.map((u) => {
              const isEditing = editingId === u.id;

              return (
                <TableRow key={u.id} className="border-border/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(u.id)}
                      onCheckedChange={() => toggleSelectOne(u.id)}
                      className="border-border/50 bg-background/70"
                    />
                  </TableCell>

                  {/* Name + civility editable */}
                  <TableCell>
                    {!isEditing ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {u.firstname} {u.lastname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {u.civility ?? "-"}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Select
                          value={(editForm.civility as string) || ""}
                          onValueChange={(v) => setEditForm((p) => ({ ...p, civility: v as Civility }))}
                        >
                          <SelectTrigger className="h-8 bg-muted/40">
                            <SelectValue placeholder="Civility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          className="h-8 bg-muted/40"
                          value={(editForm.firstname as string) ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, firstname: e.target.value }))}
                          placeholder="Firstname"
                        />
                        <Input
                          className="h-8 bg-muted/40"
                          value={(editForm.lastname as string) ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, lastname: e.target.value }))}
                          placeholder="Lastname"
                        />
                      </div>
                    )}
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    {!isEditing ? (
                      <span className="text-sm">{u.email}</span>
                    ) : (
                      <Input
                        className="h-8 bg-muted/40"
                        value={(editForm.email as string) ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email"
                      />
                    )}
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    {!isEditing ? (
                      <span className="text-sm">{u.role}</span>
                    ) : (
                      <Select
                        value={(editForm.role as string) || "user"}
                        onValueChange={(v) => setEditForm((p) => ({ ...p, role: v as Role }))}
                      >
                        <SelectTrigger className="h-8 bg-muted/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">user</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    {!isEditing ? (
                      <span className="text-sm">{u.mobilephone || "-"}</span>
                    ) : (
                      <Input
                        className="h-8 bg-muted/40"
                        value={(editForm.mobilephone as string) ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, mobilephone: e.target.value }))}
                        placeholder="Phone"
                      />
                    )}
                  </TableCell>

                  {/* Birthday */}
                  <TableCell>
                    {!isEditing ? (
                      <span className="text-sm">{u.birthday || "-"}</span>
                    ) : (
                      <Input
                        className="h-8 bg-muted/40"
                        type="date"
                        value={(editForm.birthday as string) ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, birthday: e.target.value }))}
                      />
                    )}
                  </TableCell>

                  {/* Created */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(u.created_at)}</span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    {!isEditing ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(u)}>
                            <Pencil className="size-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => deleteOne(u.id)}
                          >
                            <Trash2 className="size-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={saveEdit}
                          disabled={saving}
                        >
                          <Save className="size-3.5" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          <X className="size-3.5" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer / pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} users
          </span>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Show</span>
            <Select value={String(itemsPerPage)} onValueChange={(v) => {
              setItemsPerPage(Number(v));
              setCurrentPage(1);
              setSelectedIds([]);
            }}>
              <SelectTrigger className="h-8 w-20 bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="hidden sm:inline">per page</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => { setCurrentPage(1); setSelectedIds([]); }}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setSelectedIds([]); }}
            disabled={currentPage === 1}
          >
            Prev
          </Button>

          <div className="px-2 text-sm text-muted-foreground">
            Page <span className="text-foreground">{currentPage}</span> / {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); setSelectedIds([]); }}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => { setCurrentPage(totalPages); setSelectedIds([]); }}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}