"use client";

import React from 'react';
import dynamic from 'next/dynamic';
// 🎯 এখানে ইম্পোর্ট পাথ পরিবর্তন করা হয়েছে
import 'react-quill-new/dist/quill.snow.css';

// 🎯 ডাইনামিক ইম্পোর্টেও react-quill-new ব্যবহার করুন
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-40 bg-slate-50 animate-pulse rounded-xl border border-slate-200" />,
});

interface IQuillProps {
  value: string;
  onChange: (content: string) => void;
  isStory?: boolean;
}

export default function DynamicQuill({ value, onChange, isStory = false }: IQuillProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      isStory ? ['link', 'image'] : ['link'],
      ['clean'],
    ],
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        className="min-h-[220px] text-slate-800"
      />
    </div>
  );
}