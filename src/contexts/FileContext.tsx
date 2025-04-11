
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FileUpload } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type SortField = 'filename' | 'file_type' | 'size' | 'created_at' | 'username';
type SortDirection = 'asc' | 'desc';

interface FileContextType {
  files: FileUpload[];
  loading: boolean;
  uploadFile: (file: File, description: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  sortFiles: (field: SortField, direction: SortDirection) => void;
}

const FileContext = createContext<FileContextType>({
  files: [],
  loading: false,
  uploadFile: async () => {},
  deleteFile: async () => {},
  sortFiles: () => {},
});

export const useFiles = () => useContext(FileContext);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch files when user changes
  useEffect(() => {
    const fetchFiles = async () => {
      if (!user) {
        setFiles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .select('*');

        if (fileError) throw fileError;

        if (fileData) {
          const filesWithUploaders = await Promise.all(
            fileData.map(async (file) => {
              // Fetch the uploader info
              const { data: uploaderData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', file.user_id)
                .single();

              // Get the public URL for the file
              const { data: publicURL } = await supabase
                .storage
                .from('file-uploads')
                .getPublicUrl(file.storage_path);

              return {
                ...file,
                url: publicURL?.publicUrl || '',
                uploader: uploaderData ? {
                  id: uploaderData.id,
                  email: uploaderData.email,
                  username: uploaderData.username,
                  full_name: uploaderData.full_name,
                  status: uploaderData.status,
                  created_at: uploaderData.created_at,
                  avatar_url: uploaderData.avatar_url
                } : undefined
              } as FileUpload;
            })
          );

          setFiles(filesWithUploaders);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        toast({
          title: "Failed to load files",
          description: "There was a problem loading the files.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user, toast]);

  const uploadFile = async (file: File, description: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      // Create a unique file path
      const fileExtension = file.name.split('.').pop();
      const filePath = `${user.id}/${uuidv4()}.${fileExtension}`;
      
      // Upload file to Supabase storage
      const { error: storageError } = await supabase
        .storage
        .from('file-uploads')
        .upload(filePath, file);
        
      if (storageError) throw storageError;
      
      // Get the public URL
      const { data: publicURLData } = await supabase
        .storage
        .from('file-uploads')
        .getPublicUrl(filePath);
        
      if (!publicURLData) throw new Error('Failed to get public URL');
      
      // Create a record in the files table
      const newFileRecord = {
        filename: file.name,
        file_type: file.type,
        size: file.size,
        storage_path: filePath,
        user_id: user.id,
        description,
        created_at: new Date().toISOString()
      };
      
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert(newFileRecord)
        .select()
        .single();
        
      if (fileError) throw fileError;
      
      // Add to local state
      const newFile: FileUpload = {
        ...fileRecord,
        url: publicURLData.publicUrl,
        uploader: user
      };
      
      setFiles(prev => [newFile, ...prev]);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      // Get file info first (to get storage path)
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (fetchError) throw fetchError;
      if (!fileData) throw new Error('File not found');
      
      // Check if user is the owner
      if (fileData.user_id !== user.id) {
        throw new Error('You do not have permission to delete this file');
      }
      
      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from('file-uploads')
        .remove([fileData.storage_path]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) throw dbError;
      
      // Update local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      toast({
        title: "File deleted",
        description: "The file has been removed",
      });
      
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sortFiles = (field: SortField, direction: SortDirection) => {
    const sortedFiles = [...files].sort((a, b) => {
      let valueA, valueB;
      
      switch (field) {
        case 'filename':
          valueA = a.filename.toLowerCase();
          valueB = b.filename.toLowerCase();
          break;
        case 'file_type':
          valueA = a.file_type.toLowerCase();
          valueB = b.file_type.toLowerCase();
          break;
        case 'size':
          valueA = a.size;
          valueB = b.size;
          break;
        case 'created_at':
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
          break;
        case 'username':
          valueA = a.uploader?.username.toLowerCase() || '';
          valueB = b.uploader?.username.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (direction === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
    
    setFiles(sortedFiles);
  };

  return (
    <FileContext.Provider value={{ files, loading, uploadFile, deleteFile, sortFiles }}>
      {children}
    </FileContext.Provider>
  );
};
