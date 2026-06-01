"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { DEPARTMENTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface CourseWithDetails {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  department: string;
  semester: number;
  assignedFaculty: string | null;
  faculty: { user: { name: string | null } } | null;
  _count: { enrollments: number };
}

interface FacultyOption {
  id: string;
  user: { name: string | null };
  department: string;
}

interface CourseForm {
  courseCode: string;
  courseName: string;
  creditHours: number;
  department: string;
  semester: number;
}

const emptyCourse: CourseForm = {
  courseCode: "",
  courseName: "",
  creditHours: 3,
  department: "",
  semester: 1,
};

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithDetails | null>(
    null,
  );
  const [deletingCourse, setDeletingCourse] =
    useState<CourseWithDetails | null>(null);
  const [assigningCourse, setAssigningCourse] =
    useState<CourseWithDetails | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyCourse);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [filterDept, setFilterDept] = useState<string>("all");

  useEffect(() => {
    const url =
      filterDept === "all"
        ? "/api/courses"
        : `/api/courses?department=${encodeURIComponent(filterDept)}`;
    Promise.all([
      api.get<CourseWithDetails[]>(url),
      api.get<FacultyOption[]>("/api/faculty"),
    ])
      .then(([c, f]) => {
        setCourses(Array.isArray(c.data) ? c.data : []);
        setFacultyList(Array.isArray(f.data) ? f.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterDept]);

  const openAdd = () => {
    setEditingCourse(null);
    setForm(emptyCourse);
    setDialogOpen(true);
  };
  const openEdit = (c: CourseWithDetails) => {
    setEditingCourse(c);
    setForm({
      courseCode: c.courseCode,
      courseName: c.courseName,
      creditHours: c.creditHours,
      department: c.department,
      semester: c.semester,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.courseCode || !form.courseName || !form.department) return;
    try {
      if (editingCourse) {
        const { data: updated } = await api.patch<CourseWithDetails>(
          `/api/courses/${editingCourse.id}`,
          form,
        );
        setCourses((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
      } else {
        const { data: created } = await api.post<CourseWithDetails>(
          "/api/courses",
          form,
        );
        setCourses((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    try {
      await api.delete(`/api/courses/${deletingCourse.id}`);
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      setDeleteDialogOpen(false);
      setDeletingCourse(null);
    } catch {
      /* ignore */
    }
  };

  const handleAssign = async () => {
    if (!assigningCourse || !selectedFaculty) return;
    try {
      const { data: updated } = await api.patch<CourseWithDetails>(
        `/api/courses/${assigningCourse.id}`,
        { assignedFaculty: selectedFaculty },
      );
      setCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setAssignDialogOpen(false);
      setSelectedFaculty("");
    } catch {
      /* ignore */
    }
  };

  const columns: Column<CourseWithDetails>[] = [
    {
      key: "courseCode",
      header: "Code",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-semibold text-brand-primary">
          {row.courseCode}
        </span>
      ),
    },
    {
      key: "courseName",
      header: "Course Name",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-foreground">{row.courseName}</span>
          <AuditBadgeInline entity="Course" entityId={row.id} />
        </div>
      ),
    },
    {
      key: "creditHours",
      header: "Credits",
      sortable: true,
      render: (row) => <Badge variant="outline">{row.creditHours} CH</Badge>,
    },
    { key: "department", header: "Department", sortable: true },
    {
      key: "faculty",
      header: "Faculty",
      render: (row) =>
        row.faculty?.user.name ? (
          <span className="text-sm">{row.faculty.user.name}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Unassigned
          </span>
        ),
    },
    {
      key: "_count",
      header: "Enrolled",
      sortable: false,
      render: (row) => (
        <span className="font-medium">{row._count.enrollments}</span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setAssigningCourse(row);
              setSelectedFaculty(row.assignedFaculty || "");
              setAssignDialogOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            title="Assign Faculty"
          >
            <UserPlus className="h-4 w-4 text-brand-secondary" />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => {
              setDeletingCourse(row);
              setDeleteDialogOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Manage Courses"
        subtitle={`${courses.length} courses offered this semester`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Manage Courses" },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={openAdd}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Course
            </Button>
          </div>
        }
      />

      <DataTable
        data={courses as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search by code or name..."
        searchKeys={["courseCode", "courseName"]}
      />

      {/* Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Update course details."
                : "Fill in the details for a new course."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code</Label>
                <Input
                  value={form.courseCode}
                  onChange={(e) =>
                    setForm({ ...form, courseCode: e.target.value })
                  }
                  placeholder="CS-301"
                />
              </div>
              <div className="space-y-2">
                <Label>Course Name</Label>
                <Input
                  value={form.courseName}
                  onChange={(e) =>
                    setForm({ ...form, courseName: e.target.value })
                  }
                  placeholder="Database Systems"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Credit Hours</Label>
                <Select
                  value={String(form.creditHours)}
                  onValueChange={(v) =>
                    setForm({ ...form, creditHours: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((c) => (
                      <SelectItem key={c} value={String(c)}>
                        {c} CH
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={String(form.semester)}
                  onValueChange={(v) =>
                    setForm({ ...form, semester: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        Sem {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              {editingCourse ? "Update" : "Add Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Faculty */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Faculty</DialogTitle>
            <DialogDescription>
              Assign a faculty member to{" "}
              <strong>{assigningCourse?.courseName}</strong> (
              {assigningCourse?.courseCode})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Select faculty member" />
              </SelectTrigger>
              <SelectContent>
                {facultyList.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.user.name ?? "—"} — {f.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingCourse?.courseName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
