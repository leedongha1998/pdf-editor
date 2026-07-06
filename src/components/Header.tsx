import { FileText } from 'lucide-react';
import { ActiveTab } from '../types/pdf';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const tabs: { id: ActiveTab; label: string }[] = [
  { id: 'editor', label: '편집기' },
  { id: 'merge', label: 'PDF 병합' },
  { id: 'split', label: 'PDF 분할' },
  { id: 'convert', label: '이미지 → PDF' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 py-3">
          <div className="flex items-center gap-2 text-red-600">
            <FileText size={28} />
            <span className="text-xl font-bold text-gray-800">PDF 편집기</span>
          </div>
        </div>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
