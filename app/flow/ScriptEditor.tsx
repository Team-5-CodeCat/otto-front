import { useState, useEffect } from 'react';
import type { Edge, Node } from 'reactflow';
import type { PipelineNodeData } from './codegen';
import { parseYAMLToNodes, parseShellToNodes } from './scriptParser';
import { generateYAML, generateShell } from './codegen';
import EnvPopup from '../components/EnvPopup';

export interface ScriptEditorProps {
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
  onScriptChange: (script: string, type: 'yaml' | 'shell' | 'env') => void;
  onGenerateNodes: (script: string, type: 'yaml' | 'shell' | 'env') => void;
  onNodesToScript: (nodes: PipelineNodeData[], type: 'yaml' | 'shell') => void;
  currentYamlScript?: string;
  currentShellScript?: string;
}

interface EnvVariable {
  key: string;
  value: string;
}

export default function ScriptEditor({
  nodes,
  edges,
  onScriptChange,
  onGenerateNodes,
  onNodesToScript,
  currentYamlScript,
  currentShellScript,
}: ScriptEditorProps) {
  const [activeTab, setActiveTab] = useState<'yaml' | 'shell' | 'env'>('yaml');
  const [yamlScript, setYamlScript] = useState('');
  const [shellScript, setShellScript] = useState('');
  const [envScript, setEnvScript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnvPopupOpen, setIsEnvPopupOpen] = useState(false);

  // 외부에서 전달받은 스크립트 업데이트 (중복 방지)
  useEffect(() => {
    if (
      currentYamlScript !== undefined &&
      currentYamlScript !== yamlScript &&
      currentYamlScript !== 'Enter file contents here' &&
      currentYamlScript.trim() !== ''
    ) {
      setYamlScript(currentYamlScript);
    }
  }, [currentYamlScript, yamlScript]);

  useEffect(() => {
    if (
      currentShellScript !== undefined &&
      currentShellScript !== shellScript &&
      currentShellScript !== 'Enter file contents here' &&
      currentShellScript.trim() !== ''
    ) {
      setShellScript(currentShellScript);
    }
  }, [currentShellScript, shellScript]);

  // 초기 스크립트 설정 (한 번만 실행)
  useEffect(() => {
    if (!isInitialized) {
      // 기본 YAML 템플릿
      const defaultYaml = `Enter file contents here`;

      // 기본 Shell 템플릿
      const defaultShell = `Enter file contents here`;

      // 기본 ENV 템플릿
      const defaultEnv = `Enter file contents here`;

      setYamlScript(defaultYaml);
      setShellScript(defaultShell);
      setEnvScript(defaultEnv);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleScriptChange = (script: string, type: 'yaml' | 'shell' | 'env') => {
    if (type === 'yaml') {
      setYamlScript(script);
      // YAML 변경 시 Shell도 업데이트
      if (script.trim() !== '') {
        try {
          // YAML을 파싱하여 노드 생성
          const parsedNodes = parseYAMLToNodes(script);
          // 노드에서 Shell 스크립트 생성 (가상의 엣지와 함께)
          const virtualNodes = parsedNodes.map((data, index) => ({
            id: `${data.kind}-${index}`,
            position: { x: 100, y: 200 + index * 120 },
            data,
            type: 'customNode',
          }));
          const virtualEdges: Edge[] = [];
          for (let i = 0; i < virtualNodes.length - 1; i++) {
            virtualEdges.push({
              id: `edge-${virtualNodes[i].id}-${virtualNodes[i + 1].id}`,
              source: virtualNodes[i].id,
              target: virtualNodes[i + 1].id,
            });
          }
          const generatedShell = generateShell(virtualNodes, virtualEdges);
          setShellScript(generatedShell);
          onScriptChange(generatedShell, 'shell');
        } catch (error) {
          console.error('Failed to convert YAML to Shell:', error);
        }
      }
    } else if (type === 'shell') {
      setShellScript(script);
      // Shell 변경 시 YAML도 업데이트
      if (script.trim() !== '') {
        try {
          // Shell을 파싱하여 노드 생성
          const parsedNodes = parseShellToNodes(script);
          // 노드에서 YAML 스크립트 생성 (가상의 엣지와 함께)
          const virtualNodes = parsedNodes.map((data, index) => ({
            id: `${data.kind}-${index}`,
            position: { x: 100, y: 200 + index * 120 },
            data,
            type: 'customNode',
          }));
          const virtualEdges: Edge[] = [];
          for (let i = 0; i < virtualNodes.length - 1; i++) {
            virtualEdges.push({
              id: `edge-${virtualNodes[i].id}-${virtualNodes[i + 1].id}`,
              source: virtualNodes[i].id,
              target: virtualNodes[i + 1].id,
            });
          }
          const generatedYaml = generateYAML(virtualNodes, virtualEdges);
          setYamlScript(generatedYaml);
          onScriptChange(generatedYaml, 'yaml');
        } catch (error) {
          console.error('Failed to convert Shell to YAML:', error);
        }
      }
    } else if (type === 'env') {
      setEnvScript(script);
    }
    onScriptChange(script, type);
  };

  const handleGenerateNodes = () => {
    const currentScript =
      activeTab === 'yaml' ? yamlScript : activeTab === 'shell' ? shellScript : envScript;
    console.log('Generating nodes with script:', currentScript);
    onGenerateNodes(currentScript, activeTab === 'env' ? 'yaml' : activeTab);
    setIsEditing(false);
  };

  const handleBoxClick = () => {
    // 편집 시작 시 기본 텍스트가 있다면 지우기
    if (activeTab === 'env') {
      if (envScript === 'Enter file contents here') {
        setEnvScript('');
        onScriptChange('', 'env');
      }
    } else if (activeTab === 'yaml') {
      if (yamlScript === 'Enter file contents here') {
        setYamlScript('');
        onScriptChange('', 'yaml');
      }
    } else {
      if (shellScript === 'Enter file contents here') {
        setShellScript('');
        onScriptChange('', 'shell');
      }
    }
    setIsEditing(true);
  };

  const handleContentEditableClick = () => {
    // contentEditable 영역 클릭 시에도 기본 텍스트 지우기
    if (activeTab === 'env') {
      if (envScript === 'Enter file contents here') {
        setEnvScript('');
        onScriptChange('', 'env');
      }
    } else if (activeTab === 'yaml') {
      if (yamlScript === 'Enter file contents here') {
        setYamlScript('');
        onScriptChange('', 'yaml');
      }
    } else {
      if (shellScript === 'Enter file contents here') {
        setShellScript('');
        onScriptChange('', 'shell');
      }
    }
  };

  const handleContentEditableFocus = () => {
    // 포커스 시에도 기본 텍스트 지우기
    if (activeTab === 'env') {
      if (envScript === 'Enter file contents here') {
        setEnvScript('');
        onScriptChange('', 'env');
      }
    } else if (activeTab === 'yaml') {
      if (yamlScript === 'Enter file contents here') {
        setYamlScript('');
        onScriptChange('', 'yaml');
      }
    } else {
      if (shellScript === 'Enter file contents here') {
        setShellScript('');
        onScriptChange('', 'shell');
      }
    }
  };

  const handleBlur = () => {
    // 포커스를 잃었을 때 자동으로 편집 모드 해제
    setTimeout(() => setIsEditing(false), 100);
  };

  // 탭 변경 시 현재 스크립트 내용 유지
  const handleTabChange = (newTab: 'yaml' | 'shell' | 'env') => {
    setActiveTab(newTab);
    // .env 탭을 선택하면 바로 팝업 열기
    if (newTab === 'env') {
      setIsEnvPopupOpen(true);
    }
  };

  const handleEnvPopupSave = (envVars: EnvVariable[]) => {
    const envContent = envVars.map((env) => `${env.key}=${env.value}`).join('\n');
    setEnvScript(envContent);
    onScriptChange(envContent, 'env');
  };

  const currentScript =
    activeTab === 'yaml' ? yamlScript : activeTab === 'shell' ? shellScript : envScript;
  const showPlaceholder =
    !isEditing && (currentScript === 'Enter file contents here' || currentScript === '');

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
            onClick={() => handleTabChange('env')}
            style={{
              padding: '4px 12px',
              backgroundColor: activeTab === 'env' ? '#007acc' : 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: '4px',
              color: activeTab === 'env' ? 'white' : '#e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            .env
          </button>
        </div>
        {isEditing && activeTab !== 'env' && (
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
        {activeTab === 'env' ? (
          // .env 탭일 때는 환경변수 편집 안내 메시지만 표시
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6a6a6a',
              textAlign: 'center',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '12px' }}>
              환경변수를 편집하려면 상단의 ".env" 탭을 클릭하세요
            </div>
          </div>
        ) : isEditing ? (
          <div style={{ position: 'relative', height: '100%' }}>
            <div
              contentEditable={true}
              spellCheck={false}
              autoCorrect='off'
              autoCapitalize='off'
              data-language={activeTab}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1e1e1e',
                color: '#f0f0f0',
                border: '1px solid rgba(255,255,255,.2)',
                borderRadius: '4px',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                outline: 'none',
                tabSize: 2,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                caretColor: '#f0f0f0',
                minHeight: '100px',
              }}
              onClick={handleContentEditableClick}
              onFocus={handleContentEditableFocus}
              onInput={(e) => {
                const content = e.currentTarget.textContent || '';
                handleScriptChange(content, activeTab);
              }}
              onBlur={handleBlur}
              suppressContentEditableWarning={true}
            >
              {currentScript}
            </div>
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
        onSave={handleEnvPopupSave}
      />
    </div>
  );
}
