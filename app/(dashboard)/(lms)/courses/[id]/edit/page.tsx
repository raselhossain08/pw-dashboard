import AppLayout from "@/components/layout/AppLayout";
import EditCourse from "../../../../../../components/courses/EditCourse";
import RequireAuth from "@/components/RequireAuth";
import CourseErrorBoundary from "@/components/courses/CourseErrorBoundary";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth roles={["admin", "super_admin", "instructor"]}>
      <AppLayout>
        <CourseErrorBoundary>
          <EditCourse courseId={id} />
        </CourseErrorBoundary>
      </AppLayout>
    </RequireAuth>
  );
}
