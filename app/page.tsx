'use client';

import { useCallback, useState } from 'react';
import { PipelineNodeData } from './flow/codegen';
import type { Edge, Node } from 'reactflow';
import { parseShellToNodes, parseYAMLToNodes } from './flow/scriptParser';
import { generateYAML, generateShell } from './flow/codegen';
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

  const handleScriptChange = useCallback((script: string, type: 'yaml' | 'shell' | 'env') => {
    // 스크립트 변경 시 상태 저장
    if (type === 'yaml') {
      setCurrentYamlScript(script);
    } else if (type === 'shell') {
      setCurrentShellScript(script);
    } else if (type === 'env') {
      // .env 파일은 별도로 저장하지 않고 ScriptEditor 내부에서만 관리
      console.log('ENV script changed:', script);
    }
    console.log(`Script changed (${type}):`, script);
  }, []);

  const handleGenerateNodes = useCallback((script: string, type: 'yaml' | 'shell' | 'env') => {
    try {
      console.log('Generating nodes from script:', script, 'type:', type);
      let parsedNodes: PipelineNodeData[];

      if (type === 'yaml') {
        parsedNodes = parseYAMLToNodes(script);
      } else if (type === 'shell') {
        parsedNodes = parseShellToNodes(script);
      } else if (type === 'env') {
        // .env 파일은 노드 생성에 직접 사용하지 않음
        console.log('ENV file content:', script);
        return;
      } else {
        // 기본값 설정
        parsedNodes = [];
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

  const handleNodesToScript = useCallback(
    (nodeData: PipelineNodeData[], type: 'yaml' | 'shell') => {
      try {
        // 현재 노드와 엣지를 사용하여 스크립트 생성
        let generatedScript: string;
        if (type === 'yaml') {
          generatedScript = generateYAML(nodes, edges);
          setCurrentYamlScript(generatedScript);
        } else {
          generatedScript = generateShell(nodes, edges);
          setCurrentShellScript(generatedScript);
        }

        console.log(`Generated ${type} script:`, generatedScript);
      } catch (error) {
        console.error(`Failed to generate ${type} script:`, error);
      }
    },
    [nodes, edges]
  );

  return (
    <div className='flex h-screen'>
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
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
            onGenerateFromScript={handleGenerateNodes}
            onNodesToScript={handleNodesToScript}
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
              nodes={nodes}
              edges={edges}
              onScriptChange={handleScriptChange}
              onGenerateNodes={handleGenerateNodes}
              currentYamlScript={currentYamlScript}
              currentShellScript={currentShellScript}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
