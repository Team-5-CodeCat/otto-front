import { useState, useEffect } from 'react';
import type { Edge, Node } from 'reactflow';
import type { PipelineNodeData } from './codegen';
import EnvPopup from '../components/EnvPopup';

export interface ScriptEditorProps {
  _nodes: Node<PipelineNodeData>[];
  _edges: Edge[];
  onScriptChange: (script: string, type: 'yaml' | 'shell') => void;
  onGenerateNodes: (script: string, type: 'yaml' | 'shell') => void;
}

export default function ScriptEditor({
  _nodes,
  _edges,
  onScriptChange,
  onGenerateNodes,
}: ScriptEditorProps) {
  const [activeTab, setActiveTab] = useState<'yaml' | 'shell'>('yaml');
  const [yamlScript, setYamlScript] = useState('');
  const [shellScript, setShellScript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnvPopupOpen, setIsEnvPopupOpen] = useState(false);

  // 초기 스크립트 설정 (한 번만 실행)
  useEffect(() => {
    if (!isInitialized) {
      // 기본 YAML 템플릿
      const defaultYaml = `Enter file contents here`;

      // 기본 Shell 템플릿
      const defaultShell = `Enter file contents here`;

      setYamlScript(defaultYaml);
      setShellScript(defaultShell);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleScriptChange = (script: string, type: 'yaml' | 'shell') => {
    if (type === 'yaml') {
      setYamlScript(script);
    } else {
      setShellScript(script);
    }
    onScriptChange(script, type);
  };

  const handleGenerateNodes = () => {
    const currentScript = activeTab === 'yaml' ? yamlScript : shellScript;
    console.log('Generating nodes with script:', currentScript); // 디버깅용 로그
    onGenerateNodes(currentScript, activeTab);
    setIsEditing(false);
  };

  const handleBoxClick = () => {
    // 편집 시작 시 기본 텍스트가 있다면 지우기
    if (currentScript === 'Enter file contents here') {
      if (activeTab === 'yaml') {
        setYamlScript('');
        onScriptChange('', 'yaml');
      } else {
        setShellScript('');
        onScriptChange('', 'shell');
      }
    }
    setIsEditing(true);
  };

  const handleBlur = () => {
    // 포커스를 잃었을 때 자동으로 편집 모드 해제
    setTimeout(() => setIsEditing(false), 100);
  };

  // 탭 변경 시 현재 스크립트 내용 유지
  const handleTabChange = (newTab: 'yaml' | 'shell') => {
    setActiveTab(newTab);
  };

  const handleEnvSave = (envVars: { key: string; value: string }[]) => {
    const envContent = envVars.map((env) => `${env.key}=${env.value}`).join('\n');
    console.log('Environment variables saved:', envVars);
    console.log('Generated .env content:', envContent);
  };

  const currentScript = activeTab === 'yaml' ? yamlScript : shellScript;
  const showPlaceholder = currentScript === 'Enter file contents here' || currentScript === '';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,.15)',
          paddingBottom: 8,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => handleTabChange('yaml')}
            style={{
              padding: '4px 12px',
              backgroundColor: activeTab === 'yaml' ? '#007acc' : 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: '4px',
              color: activeTab === 'yaml' ? 'white' : '#e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            YAML
          </button>
          <button
            onClick={() => handleTabChange('shell')}
            style={{
              padding: '4px 12px',
              backgroundColor: activeTab === 'shell' ? '#007acc' : 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: '4px',
              color: activeTab === 'shell' ? 'white' : '#e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Shell
          </button>
          <button
            onClick={() => setIsEnvPopupOpen(true)}
            style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: '4px',
              color: '#e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            .env
          </button>
        </div>
        {isEditing && (
          <button
            onClick={handleGenerateNodes}
            style={{
              padding: '4px 12px',
              backgroundColor: '#007acc',
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            노드 생성
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {isEditing ? (
          <div style={{ position: 'relative', height: '100%' }}>
            <textarea
              value={currentScript}
              onChange={(e) => handleScriptChange(e.target.value, activeTab)}
              onBlur={handleBlur}
              autoFocus
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1e1e1e',
                color: showPlaceholder ? 'transparent' : '#f0f0f0',
                border: '1px solid rgba(255,255,255,.2)',
                borderRadius: '4px',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                resize: 'none',
                tabSize: 2,
                outline: 'none',
                caretColor: '#f0f0f0',
              }}
              spellCheck={false}
              autoCorrect='off'
              autoCapitalize='off'
              data-language={activeTab}
            />
            {showPlaceholder && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  color: '#6a6a6a',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                Enter file contents here
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleBoxClick}
            style={{
              position: 'relative',
              minHeight: '100px',
              backgroundColor: '#1e1e1e',
              borderRadius: '4px',
              border: '1px solid transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              padding: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,.4)';
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.backgroundColor = '#1e1e1e';
            }}
          >
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                margin: 0,
                fontSize: '12px',
                fontFamily: 'monospace',
                color: showPlaceholder ? '#6a6a6a' : '#f0f0f0',
              }}
            >
              {currentScript}
            </pre>
          </div>
        )}
      </div>

      <EnvPopup
        isOpen={isEnvPopupOpen}
        onClose={() => setIsEnvPopupOpen(false)}
        onSave={handleEnvSave}
      />
    </div>
  );
}
