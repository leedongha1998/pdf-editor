import { useRef, useState } from 'react';
import { TextAnnotation } from '../types/pdf';

interface TextLayerProps {
  isActive: boolean;
  annotations: TextAnnotation[];
  onAnnotationsChange: (annotations: TextAnnotation[]) => void;
  color: string;
  fontSize: number;
}

export default function TextLayer({
  isActive,
  annotations,
  onAnnotationsChange,
  color,
  fontSize,
}: TextLayerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingOriginal, setEditingOriginal] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const finishEdit = (id: string, text: string) => {
    if (text.trim() === '') {
      onAnnotationsChange(annotations.filter((a) => a.id !== id));
    } else {
      onAnnotationsChange(annotations.map((a) => (a.id === id ? { ...a, text } : a)));
    }
    setEditingId(null);
    setEditingText('');
    setEditingOriginal('');
  };

  const handleLayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    if ((e.target as HTMLElement).closest('[data-ann]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const id = crypto.randomUUID();
    onAnnotationsChange([...annotations, { id, x, y, text: '', color, fontSize }]);
    setEditingId(id);
    setEditingText('');
    setEditingOriginal('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleAnnotationClick = (e: React.MouseEvent, ann: TextAnnotation) => {
    if (!isActive) return;
    e.stopPropagation();
    setEditingId(ann.id);
    setEditingText(ann.text);
    setEditingOriginal(ann.text);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: isActive ? 'text' : 'default',
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      onClick={handleLayerClick}
    >
      {annotations.map((ann) => (
        <div
          key={ann.id}
          data-ann=""
          style={{
            position: 'absolute',
            left: `${ann.x * 100}%`,
            top: `${ann.y * 100}%`,
            transform: 'translateY(-50%)',
          }}
          onClick={(e) => handleAnnotationClick(e, ann)}
        >
          {editingId === ann.id ? (
            <textarea
              ref={textareaRef}
              value={editingText}
              onChange={handleTextareaChange}
              onBlur={() => finishEdit(ann.id, editingText)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') finishEdit(ann.id, editingOriginal);
              }}
              rows={1}
              style={{
                color: ann.color,
                fontSize: ann.fontSize,
                fontFamily: 'sans-serif',
                background: 'rgba(255,255,255,0.92)',
                border: '1.5px dashed #3b82f6',
                outline: 'none',
                padding: '2px 6px',
                minWidth: '120px',
                resize: 'none',
                overflow: 'hidden',
                lineHeight: '1.5',
                borderRadius: '3px',
                display: 'block',
              }}
            />
          ) : (
            <span
              style={{
                color: ann.color,
                fontSize: ann.fontSize,
                fontFamily: 'sans-serif',
                whiteSpace: 'pre-wrap',
                userSelect: 'none',
                padding: '2px 4px',
                display: 'block',
                cursor: isActive ? 'text' : 'default',
                outline: '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (isActive) (e.currentTarget as HTMLElement).style.outline = '1px dashed #93c5fd';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.outline = '1px solid transparent';
              }}
            >
              {ann.text}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
