"use client";

import Link from "next/link";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { ComponentProps } from "react";

interface TeacherLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  forceAssignmentId?: boolean; // Force thêm assignment_id ngay cả khi không phải teacher route
}

/**
 * Custom Link component tự động thêm assignment_id param cho teacher routes
 */
export function TeacherLink({ href, forceAssignmentId = false, ...props }: TeacherLinkProps) {
  const { createTeacherUrl, currentAssignmentId } = useAssignmentContext();

  // Tạo URL với assignment_id nếu cần
  const finalHref = (() => {
    if (forceAssignmentId && currentAssignmentId) {
      const url = new URL(href, window.location.origin);
      url.searchParams.set("assignment_id", currentAssignmentId);
      return url.pathname + url.search;
    }
    return createTeacherUrl(href);
  })();

  return <Link href={finalHref} {...props} />;
}

export default TeacherLink;
