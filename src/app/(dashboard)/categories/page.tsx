import { ModuleHeader, ModulePlaceholder } from "@/components/dashboard/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const getCategories = {
    category: [
      {
        id: 1,
        name: "Foods",
      },
      {
        id: 2,
        name: "Transportation",
      },
      {
        id: 3,
        name: "Entertainment",
      },
    ],
  };

  return (
    <div>
      <div className="mb-6 flex item-start justify-between gap-4">
        <ModuleHeader
          title="Categories"
          description="Organize transactions with custom income and expense categories."
        />

        <Button>
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      {/* Search & Filtering */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="grid min-w-56 flex-1 gap-1.5">
          <Label htmlFor="category-search" className="text-xs text-muted-foreground">
            Search
          </Label>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="category-search"
              // value={}
              // onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Status</Label>
          <Select>
            <SelectTrigger className="min-w-40">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem>All statuses</SelectItem>
              <SelectItem>Active</SelectItem>
              <SelectItem>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {getCategories.category.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon">
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
