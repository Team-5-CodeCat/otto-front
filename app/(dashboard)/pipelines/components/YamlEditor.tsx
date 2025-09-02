import React from 'react';

interface YamlEditorProps {
  yamlText: string;
  onYamlChange: (value: string) => void;
}

const YamlEditor: React.FC<YamlEditorProps> = ({ yamlText, onYamlChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onYamlChange(event.target.value);
  };

  return (
    <div className='w-1/3 p-4 border-r'>
      <h3 className='text-lg font-semibold mb-2'>YAML 편집기</h3>
      <textarea
        value={yamlText}
        onChange={handleChange}
        className='w-full h-full resize-none border border-gray-300 rounded p-2 font-mono text-sm'
        placeholder='YAML을 여기에 입력하세요...'
      />
    </div>
  );
};

export default YamlEditor;
