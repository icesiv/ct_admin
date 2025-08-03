import { useState, useCallback } from 'react';
import { BASE_URL } from '@/config/config';
import { ImageData } from './types';

export const useSelection = () => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      setSelectedText(selection.toString());
      if (selection.rangeCount > 0) {
        setSavedRange(selection.getRangeAt(0).cloneRange());
      }
    }
  }, []);

  return { selectedText, savedRange, setSavedRange, handleTextSelection };
};

export const useImageUpload = (baseUrl: string) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadImage = useCallback(async (file: File): Promise<ImageData> => {
    const token = localStorage.getItem('auth_token');
    const UPLOAD_URL = `${BASE_URL}admin/images/upload-image`;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('generate_thumbnails', 'true');
      formData.append('thumbnail_sizes[]', '500');

      const response = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));

        xhr.open('POST', UPLOAD_URL);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.timeout = 30000;
        xhr.send(formData);
      });

      return response.data;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [baseUrl]);

  return { uploading, uploadProgress, uploadImage };
};