import React, { useEffect, useState, Suspense } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { marked } from 'marked';
import TurndownService from 'turndown';

// Only import react-quill on the client-side to prevent SSR crashes in Expo Web
const ReactQuill = React.lazy(() => import('react-quill-new'));

// Inject CSS manually to avoid Metro bundler errors
const injectQuillStyles = () => {
  if (typeof document !== 'undefined') {
    if (!document.getElementById('quill-styles')) {
      const link = document.createElement('link');
      link.id = 'quill-styles';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
      document.head.appendChild(link);
    }
    
    // Add some custom overrides
    if (!document.getElementById('quill-custom')) {
      const style = document.createElement('style');
      style.id = 'quill-custom';
      style.innerHTML = `
        .ql-editor { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; }
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #ccc !important; }
      `;
      document.head.appendChild(style);
    }
  }
};

interface RichTextEditorProps {
  value: string; // Markdown text
  onChange: (text: string) => void;
  placeholder?: string;
}

const turndownService = new TurndownService({ headingStyle: 'atx' });

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [htmlValue, setHtmlValue] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  // Initial load: Markdown -> HTML
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setIsMounted(true);
    injectQuillStyles();
    
    if (value && htmlValue === '') {
      const parsed = marked.parse(value);
      const html = typeof parsed === 'string' ? parsed : '';
      setHtmlValue(html);
    } else if (value === '' && htmlValue !== '') {
      setHtmlValue('');
    }
  }, [value]);

  const handleChange = (content: string, delta: any, source: string, editor: any) => {
    setHtmlValue(content);
    // Only trigger onChange if it's a user edit
    if (source === 'user') {
      const markdown = turndownService.turndown(content);
      onChange(markdown);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  if (!isMounted) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Suspense fallback={<View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Chargement de l&apos;éditeur...</Text></View>}>
        <ReactQuill 
          theme="snow" 
          value={htmlValue} 
          onChange={handleChange} 
          modules={modules}
          placeholder={placeholder}
          style={{ height: '100%', minHeight: 500, backgroundColor: 'white', color: 'black' }}
        />
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
  }
});
