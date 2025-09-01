'use client';

import { useCallback, useState } from 'react';
import { PipelineNodeData } from './flow/codegen';
import type { Edge, Node } from 'reactflow';
import { parseShellToNodes, parseYAMLToNodes } from './flow/scriptParser';
import FlowEditor from './flow/FlowEditor';
import ScriptEditor from './flow/ScriptEditor';
import Sidebar from './components/Sidebar';

export default function Home() {
  const [nodes, setNodes] = useState<Node<PipelineNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [currentYamlScript, setCurrentYamlScript] = useState('');
  const [currentShellScript, setCurrentShellScript] = useState('');

  const handleGraphChange = useCallback((ns: Node<PipelineNodeData>[], es: Edge[]) => {
    setNodes(ns);
    setEdges(es);
  }, []);

  const handleScriptChange = useCallback((script: string, type: 'yaml' | 'shell') => {
    // 스크립트 변경 시 상태 저장
    if (type === 'yaml') {
      setCurrentYamlScript(script);
    } else {
      setCurrentShellScript(script);
    }
    console.log(`Script changed (${type}):`, script);
  }, []);

  const handleGenerateNodes = useCallback((script: string, type: 'yaml' | 'shell') => {
    try {
      console.log('Generating nodes from script:', script, 'type:', type);
      let parsedNodes: PipelineNodeData[];

      if (type === 'yaml') {
        parsedNodes = parseYAMLToNodes(script);
      } else {
        parsedNodes = parseShellToNodes(script);
      }

      console.log('Parsed nodes:', parsedNodes);

      // 전역 함수를 통해 FlowEditor에 노드 생성 요청
      const generateNodesFromScript = (
        window as { generateNodesFromScript?: (nodes: PipelineNodeData[]) => void }
      ).generateNodesFromScript;
      if (generateNodesFromScript) {
        generateNodesFromScript(parsedNodes);
      } else {
        console.error('generateNodesFromScript function not found');
      }
    } catch (error) {
      console.error('Failed to parse script:', error);
      alert('스크립트 파싱에 실패했습니다.');
    }
  }, []);

  return (
    <div className='flex h-screen'>
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 16,
          height: '100vh',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            height: '100%',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <FlowEditor
            onGraphChange={handleGraphChange}
            onGenerateFromScript={(nodes) => handleGenerateNodes('', 'yaml')}
          />
        </div>
        <div
          style={{
            height: '100%',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: 12, flex: 1, overflow: 'hidden' }}>
            <ScriptEditor
              _nodes={nodes}
              _edges={edges}
              onScriptChange={handleScriptChange}
              onGenerateNodes={handleGenerateNodes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
