import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfferStore } from '../store/offerStore';
import { processTranscript } from '../services/ai/transcriptProcessor';

interface TranscriptUploaderProps {
  onUploadComplete?: (success: boolean) => void;
}

export function TranscriptUploader({ onUploadComplete }: TranscriptUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setTranscriptData } = useOfferStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setUploadSuccess(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      // Check if file is a text file
      if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt')) {
        setFile(droppedFile);
        setError(null);
        setUploadSuccess(false);
      } else {
        setError('Please upload a text (.txt) file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          
          if (!text || text.trim().length < 50) {
            setError('The file appears to be empty or too short to be a valid transcript.');
            setIsUploading(false);
            return;
          }
          
          // Process the transcript with AI
          const processedData = await processTranscript(text);
          
          // Update the store with the processed data
          setTranscriptData(processedData);
          
          setUploadSuccess(true);
          if (onUploadComplete) {
            onUploadComplete(true);
          }
        } catch (error) {
          console.error('Error processing transcript:', error);
          setError('Failed to process the transcript. Please try again.');
          if (onUploadComplete) {
            onUploadComplete(false);
          }
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read the file. Please try again.');
        setIsUploading(false);
        if (onUploadComplete) {
          onUploadComplete(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading transcript:', error);
      setError('An error occurred while uploading the file.');
      setIsUploading(false);
      if (onUploadComplete) {
        onUploadComplete(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-gray-300">
        Upload a customer call transcript to get AI-powered insights for your offer
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          error ? 'border-red-400 bg-red-400/10' : 
          uploadSuccess ? 'border-green-500 bg-green-500/10' : 
          'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800/70'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          {!file ? (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  Drag and drop your transcript file, or{' '}
                  <button
                    type="button"
                    className="text-[#FFD23F] hover:underline focus:outline-none"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Text files (.txt) up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-[#FFD23F]" />
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[180px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          
          {uploadSuccess && (
            <div className="flex items-center text-green-500">
              <Check className="h-4 w-4 mr-1" />
              <span className="text-sm">Transcript processed successfully!</span>
            </div>
          )}
        </div>
      </div>
      
      {file && !uploadSuccess && !isUploading && (
        <Button
          onClick={handleUpload}
          className="mt-3 w-full bg-[#FFD23F] text-[#1C1C1C] hover:bg-[#FFD23F]/90"
        >
          Process Transcript
        </Button>
      )}
      
      {isUploading && (
        <div className="mt-3 flex items-center justify-center space-x-2 bg-gray-800 rounded-md p-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#FFD23F]" />
          <span className="text-sm text-gray-300">Processing transcript...</span>
        </div>
      )}
    </div>
  );
}
