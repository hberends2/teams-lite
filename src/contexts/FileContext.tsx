
import React, { createContext, useContext, useState } from 'react';
import { FileUpload } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const [files, setFiles] = useState<FileUpload[]>([
    {
      id: '1',
      filename: 'Project Plan.docx',
      file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 2500000,
      url: '#',
      user_id: '1',
      description: 'Project timeline and milestones',
      created_at: new Date().toISOString(),
      uploader: {
        id: '1',
        email: 'john.doe@example.com',
        username: 'johndoe',
        full_name: 'John Doe',
        status: 'online',
        created_at: new Date().toISOString()
      }
    },
    {
      id: '2',
      filename: 'Budget.xlsx',
      file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1800000,
      url: '#',
      user_id: '2',
      description: 'Q3 budget projections',
      created_at: new Date().toISOString(),
      uploader: {
        id: '2',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        full_name: 'Jane Smith',
        status: 'away',
        created_at: new Date().toISOString()
      }
    },
    {
      id: '3',
      filename: 'Presentation.pptx',
      file_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 5200000,
      url: '#',
      user_id: '3',
      description: 'Client presentation',
      created_at: new Date().toISOString(),
      uploader: {
        id: '3',
        email: 'dj.jones@example.com',
        username: 'djjones',
        full_name: 'DJ Jones',
        status: 'online',
        created_at: new Date().toISOString()
      }
    }
  ]);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file: File, description: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setLoading(true);
      
      // In a real app, you would upload to Supabase storage here
      // For now, we'll just create a mock file object
      
      setTimeout(() => {
        const newFile: FileUpload = {
          id: Math.random().toString(36).substring(2, 11),
          filename: file.name,
          file_type: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // This URL will only work in the current session
          user_id: user.id,
          description,
          created_at: new Date().toISOString(),
          uploader: user
        };
        
        setFiles(prev => [newFile, ...prev]);
        setLoading(false);
        
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      }, 1500);
      
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      setLoading(true);
      
      // In a real app, you would delete from Supabase storage here
      setTimeout(() => {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        setLoading(false);
        
        toast({
          title: "File deleted",
          description: "The file has been removed",
        });
      }, 500);
      
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
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
