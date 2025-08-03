import React from 'react';

export const EditorStyles = () => (
  <style jsx global>{`
    [contenteditable] h1 {
      font-size: 2rem;
      font-weight: bold;
      margin: 1rem 0;
    }
    
    [contenteditable] h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0.875rem 0;
    }
    
    [contenteditable] h3 {
      font-size: 1.25rem;
      font-weight: bold;
      margin: 0.75rem 0;
    }
    
    [contenteditable] ul, [contenteditable] ol {
      padding-left: 2rem;
      margin: 1rem 0;
    }
    
    [contenteditable] li {
      margin: 0.25rem 0;
    }
    
    [contenteditable] a {
      color: #3B82F6;
      text-decoration: underline;
    }
    
    [contenteditable] a:hover {
      color: #1D4ED8;
    }
    
    [contenteditable] img {
      width: 100%;
      max-width: 600px;
      height: auto;
      margin: 10px 0;
      display: block;
      cursor: pointer;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    [contenteditable] img:hover {
      opacity: 0.9;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    [contenteditable] .youtube-embed-wrapper {
      position: relative;
      width: 100%;
      max-width: 560px;
      margin: 20px auto;
      padding: 0;
      background: #f0f0f0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    [contenteditable] .youtube-embed-wrapper:hover {
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    [contenteditable] .youtube-embed-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    @media (max-width: 640px) {
      [contenteditable] .youtube-embed-wrapper {
        max-width: 100%;
        margin: 15px 0;
      }
    }
  `}</style>
);