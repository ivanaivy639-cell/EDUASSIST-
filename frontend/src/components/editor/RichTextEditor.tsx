import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface RichTextEditorProps {
  value: string; // Markdown text
  onChange: (text: string) => void;
  placeholder?: string;
}

// Fallback for native devices since react-quill is web only
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#CCCCCC"
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    minHeight: 500,
  }
});
