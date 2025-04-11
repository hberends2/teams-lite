
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFiles } from "@/contexts/FileContext";
import { Upload, FileIcon } from "lucide-react";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function FileUploadModal({ open, onClose }: FileUploadModalProps) {
  const { uploadFile } = useFiles();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      await uploadFile(file, description);
      handleClose();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Share a file with your team members
          </DialogDescription>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragOver ? "border-teams-primary bg-teams-primary/5" : "border-muted"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            {file ? (
              <div className="flex items-center space-x-2">
                <FileIcon size={24} className="text-teams-primary" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">
                  Drag & drop your file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClickUpload}
                >
                  Choose File
                </Button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Textarea
              placeholder="Add a description for this file"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className="gap-2"
          >
            {loading ? "Uploading..." : "Upload"}
            <Upload size={16} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
