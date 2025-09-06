// 대시보드 관련 공통 타입 정의

// 프로젝트 데이터 타입
export interface Project {
  id: string;
  name: string;
}

// 파이프라인 데이터 타입
export interface Pipeline {
  id: string;
  name: string;
  projectId: string;
}

// 노드 템플릿 타입
export interface NodeTemplate {
  type: string;
  label: string;
  description: string;
  defaultImage: string;
  defaultCommands: string;
}

// 액션 아이콘 타입
export interface ActionIcon {
  href: string;
  title: string;
  icon: React.ReactNode;
}
