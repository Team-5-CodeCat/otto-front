import { useState, useEffect } from 'react';
import type { Edge, Node } from 'reactflow';
import type { PipelineNodeData } from './codegen';
import { parseYAMLToNodes, parseShellToNodes } from './scriptParser';
import { generateYAML, generateShell } from './codegen';

export interface ScriptEditorProps {
  nodes: Node<PipelineNodeData>[];
  edges: Edge[];
  onScriptChange: (script: string, type: 'yaml' | 'shell') => void;
  onGenerateNodes: (script: string, type: 'yaml' | 'shell') => void;
  currentYamlScript?: string;
  currentShellScript?: string;
}

export default function ScriptEditor({
  nodes,
  edges,
  onScriptChange,
  onGenerateNodes,
  currentYamlScript,
  currentShellScript,
}: ScriptEditorProps) {
  const [activeTab, setActiveTab] = useState<'yaml' | 'shell'>('yaml');
  const [yamlScript, setYamlScript] = useState('');
  const [shellScript, setShellScript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

      setYamlScript(defaultYaml);
      setShellScript(defaultShell);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleScriptChange = (script: string, type: 'yaml' | 'shell') => {
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
    } else {
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
    }
    onScriptChange(script, type);
  };

  const handleGenerateNodes = () => {
    const currentScript = activeTab === 'yaml' ? yamlScript : shellScript;
    console.log('Generating nodes with script:', currentScript);
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

  const handleContentEditableClick = () => {
    // contentEditable 영역 클릭 시에도 기본 텍스트 지우기
    if (currentScript === 'Enter file contents here') {
      if (activeTab === 'yaml') {
        setYamlScript('');
        onScriptChange('', 'yaml');
      } else {
        setShellScript('');
        onScriptChange('', 'shell');
      }
    }
  };

  const handleContentEditableFocus = () => {
    // 포커스 시에도 기본 텍스트 지우기
    if (currentScript === 'Enter file contents here') {
      if (activeTab === 'yaml') {
        setYamlScript('');
        onScriptChange('', 'yaml');
      } else {
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
  const handleTabChange = (newTab: 'yaml' | 'shell') => {
    setActiveTab(newTab);
  };

  const currentScript = activeTab === 'yaml' ? yamlScript : shellScript;
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
    </div>
  );
}
