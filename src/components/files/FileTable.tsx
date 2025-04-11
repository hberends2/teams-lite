
import { useState } from "react";
import { useFiles } from "@/contexts/FileContext";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Download, ArrowDown, ArrowUp, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type SortField = "filename" | "file_type" | "size" | "created_at" | "username";
type SortDirection = "asc" | "desc";

export function FileTable() {
  const { files, deleteFile, sortFiles } = useFiles();
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    sortFiles(field, newDirection);
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatFileType = (type: string) => {
    const parts = type.split("/");
    return parts[1] || parts[0];
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th 
                className="px-4 py-3 text-left text-sm cursor-pointer"
                onClick={() => handleSort("filename")}
              >
                <div className="flex items-center gap-1">
                  Filename
                  {getSortIcon("filename")}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm cursor-pointer"
                onClick={() => handleSort("file_type")}
              >
                <div className="flex items-center gap-1">
                  Type
                  {getSortIcon("file_type")}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm cursor-pointer"
                onClick={() => handleSort("username")}
              >
                <div className="flex items-center gap-1">
                  Uploader
                  {getSortIcon("username")}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center gap-1">
                  Uploaded
                  {getSortIcon("created_at")}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm cursor-pointer"
                onClick={() => handleSort("size")}
              >
                <div className="flex items-center gap-1">
                  Size
                  {getSortIcon("size")}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No files uploaded yet
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{file.filename}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {file.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatFileType(file.file_type)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {file.uploader && (
                        <>
                          <UserAvatar user={file.uploader} className="h-6 w-6" />
                          <span className="text-sm">{file.uploader.username}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatTimeAgo(file.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Download size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => deleteFile(file.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
