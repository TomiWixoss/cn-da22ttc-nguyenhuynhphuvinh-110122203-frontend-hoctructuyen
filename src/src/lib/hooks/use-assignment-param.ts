"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useMemo } from "react";

/**
 * Hook để quản lý assignment_id trong URL params
 */
export function useAssignmentParam() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const assignmentId = useMemo(() => {
    return searchParams.get("assignment_id");
  }, [searchParams]);

  /**
   * Tạo URL với assignment_id param
   */
  const createUrlWithAssignmentId = (href: string, assignmentIdValue?: string) => {
    const url = new URL(href, window.location.origin);
    const currentAssignmentId = assignmentIdValue || assignmentId;
    
    if (currentAssignmentId && href.startsWith("/dashboard/teaching")) {
      url.searchParams.set("assignment_id", currentAssignmentId);
    }
    
    return url.pathname + url.search;
  };

  /**
   * Kiểm tra xem có nên thêm assignment_id vào URL không
   */
  const shouldIncludeAssignmentId = (href: string) => {
    return href.startsWith("/dashboard/teaching") && assignmentId;
  };

  return {
    assignmentId,
    createUrlWithAssignmentId,
    shouldIncludeAssignmentId,
  };
}
