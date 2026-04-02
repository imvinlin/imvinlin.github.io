'use client';

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ResumeViewer() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">RESUME</h2>
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
          className="border transition-colors duration-100 dark:border-white border-black px-4 py-2 text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
          Open PDF
        </a>
      </div>

      {/* PDF */}
      <div className="border transition-colors duration-100 dark:border-white border-black overflow-hidden flex justify-center p-4">
        <Document
          file="/resume.pdf"
          loading={<div className="p-8 text-center opacity-50 font-mono">Loading resume...</div>}
          error={<div className="p-8 text-center opacity-50 font-mono">Failed to load resume.</div>}
        >
          <Page pageNumber={1} scale={1.3} />
        </Document>
      </div>
    </div>
  );
}
