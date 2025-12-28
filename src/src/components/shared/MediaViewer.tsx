import React, { useState } from "react";
import { Music, Video } from "lucide-react";

// Generic MediaFile type để tương thích với cả quiz và question types
interface MediaFileBase {
  media_id: number;
  file_type: string;
  file_url: string;
  file_path?: string; // Thêm file_path từ backend
  owner_type: "question" | "answer";
  owner_id: number;
  alt_text?: string;
  file_name?: string;
  description?: string;
}

interface MediaViewerProps {
  mediaFiles?: MediaFileBase[];
  ownerType: "question" | "answer";
  ownerId: number;
  className?: string;
  imageClassName?: string;
}

interface MediaItemProps {
  file: MediaFileBase;
  assetUrl: string;
  imageClassName: string;
}

const MediaItem: React.FC<MediaItemProps> = ({
  file,
  assetUrl,
  imageClassName,
}) => {
  const [currentUrl, setCurrentUrl] = useState(() => {
    // Ưu tiên sử dụng file_path nếu có, fallback về file_url
    const filePath = file.file_path || file.file_url;
    return `${assetUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  });

  const handleError = () => {
    // Nếu file_path fail và chưa thử file_url, thử file_url
    if (file.file_path && currentUrl.includes(file.file_path)) {
      const fallbackUrl = `${assetUrl}${
        file.file_url.startsWith("/") ? "" : "/"
      }${file.file_url}`;
      setCurrentUrl(fallbackUrl);
    } else {
      // Nếu cả hai đều fail, hiển thị placeholder
      setCurrentUrl("https://via.placeholder.com/96x96?text=Image+Error");
    }
  };

  return (
    <a
      href={currentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${imageClassName} border rounded-md p-1 hover:border-primary transition-all duration-200 block`}
    >
      {file.file_type.startsWith("image") && (
        <img
          src={currentUrl}
          alt={file.alt_text || "Media"}
          className="w-full h-full object-cover rounded"
          onError={handleError}
        />
      )}
      {file.file_type.startsWith("video") && (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Video className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      {file.file_type.startsWith("audio") && (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
    </a>
  );
};

export const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaFiles,
  ownerType,
  ownerId,
  className = "flex flex-wrap gap-2 mt-2",
  imageClassName = "w-24 h-24",
}) => {
  if (!mediaFiles || mediaFiles.length === 0) return null;

  const ASSET_URL =
    process.env.NEXT_PUBLIC_ASSET_URL || "http://localhost:8888";

  const filesToShow = mediaFiles.filter(
    (f) => f.owner_type === ownerType && f.owner_id == ownerId
  );

  if (filesToShow.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {filesToShow.map((file) => (
        <MediaItem
          key={file.media_id}
          file={file}
          assetUrl={ASSET_URL}
          imageClassName={imageClassName}
        />
      ))}
    </div>
  );
};
