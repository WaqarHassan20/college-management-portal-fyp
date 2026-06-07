"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { BookOpen, Users, Clock, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

const COURSE_COLORS = [
  "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
  "from-purple-500/10 to-violet-500/10 border-purple-500/20",
  "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  "from-rose-500/10 to-pink-500/10 border-rose-500/20",
  "from-cyan-500/10 to-sky-500/10 border-cyan-500/20",
];

const ICON_COLORS = [
  "var(--color-brand-primary)",
  "var(--color-system-success)",
  "var(--color-data-3)",
  "var(--color-data-4)",
  "var(--color-system-danger)",
  "var(--color-brand-secondary)",
];

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CourseWithDetails[]>("/api/courses")
      .then((r) => {
        setCourses(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        title="My Courses"
        subtitle="View your enrolled courses and their details"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Courses" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {courses.map((course, idx) => {
          const facultyName = course.faculty?.user?.name ?? "TBA";
          const studentCount = course._count.enrollments;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`group relative rounded-2xl border-2 border-border/60 bg-linear-to-br ${COURSE_COLORS[idx % COURSE_COLORS.length]} p-6 hover:shadow-xl hover:shadow-brand-primary/5 hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Course Icon */}
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl mb-5 border border-border/20 shadow-sm"
                style={{
                  backgroundColor: `color-mix(in oklab, ${ICON_COLORS[idx % ICON_COLORS.length]} 20%, transparent)`,
                }}
              >
                <BookOpen
                  className="h-7 w-7 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: ICON_COLORS[idx % ICON_COLORS.length] }}
                />
              </div>

              {/* Course Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-extrabold text-foreground leading-snug group-hover:text-brand-primary transition-colors">
                    {course.courseName}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-xs font-black border-2 border-border shadow-[1px_1px_0px_0px_var(--border)] bg-card"
                  >
                    {course.courseCode}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {course.department}
                </p>

                <div className="h-px bg-border/40 my-2" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <GraduationCap className="h-4.5 w-4.5 text-brand-primary shrink-0" />
                    <span className="truncate">{facultyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <Users className="h-4.5 w-4.5 text-brand-secondary shrink-0" />
                    <span>{studentCount} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                    <span>{course.creditHours} Credits</span>
                  </div>
                </div>
              </div>

              {/* Semester Badge */}
              <div className="absolute top-6 right-6">
                <Badge variant="outline" className="text-xs font-bold bg-card border-2 border-border shadow-[1px_1px_0px_0px_var(--border)]">
                  Sem {course.semester}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No courses enrolled</p>
          <p className="text-sm mt-1">
            Contact your department for course registration.
          </p>
        </div>
      )}
    </motion.div>
  );
}
