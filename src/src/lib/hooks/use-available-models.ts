import { useState, useEffect } from "react";
import codeSubmissionService, {
  AIModel,
} from "@/lib/services/api/code-submission.service";

export const useAvailableModels = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsData = await codeSubmissionService.getAvailableModels();
        setModels(modelsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không thể lấy danh sách model"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, loading, error };
};
