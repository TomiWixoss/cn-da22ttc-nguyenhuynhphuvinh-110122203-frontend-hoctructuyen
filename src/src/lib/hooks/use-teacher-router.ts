"use client";

import { useRouter } from "next/navigation";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

/**
 * Custom router hook tự động thêm assignment_id cho teacher routes
 */
export function useTeacherRouter() {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();

  const push = (href: string, options?: any) => {
    const finalHref = createTeacherUrl(href);
    return router.push(finalHref, options);
  };

  const replace = (href: string, options?: any) => {
    const finalHref = createTeacherUrl(href);
    return router.replace(finalHref, options);
  };

  const prefetch = (href: string, options?: any) => {
    const finalHref = createTeacherUrl(href);
    return router.prefetch(finalHref, options);
  };

  return {
    ...router,
    push,
    replace,
    prefetch,
  };
}
