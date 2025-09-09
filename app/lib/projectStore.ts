// 간단한 프로젝트 데이터 스토어 (백엔드 연동 전 임시)
// 실제로는 Context API, Zustand, 또는 React Query 사용 권장

export interface Project {
  id: string;
  name: string;
  description: string;
  repo: string;
  triggerBranches: string;
  defaultBranch: string;
  language: string;
  deploy: string;
  webhookUrl: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
  lastBuild?: string;
}

// 로컬 스토리지 키
const PROJECTS_KEY = 'otto_projects';

// 초기 목 데이터
// const initialProjects: Project[] = [
//     {
//         id: 'proj-1',
//         name: 'Otto CI/CD Project',
//         description: 'A simple CI/CD automation project for testing deployment pipelines.',
//         repo: 'otto-org/otto-app',
//         triggerBranches: 'main,develop,feature/*',
//         defaultBranch: 'main',
//         language: 'node',
//         deploy: 'ec2',
//         webhookUrl: 'https://api.otto-ci.com/webhook/proj-1',
//         status: 'active',
//         createdAt: '2024-01-15T10:30:00Z',
//         updatedAt: '2024-01-20T14:45:00Z',
//         lastBuild: '2024-01-20T14:30:00Z',
//     },
//     {
//         id: 'proj-2',
//         name: 'Frontend Pipeline',
//         description: 'React frontend deployment pipeline with automated testing.',
//         repo: 'company/frontend-app',
//         triggerBranches: 'main,develop',
//         defaultBranch: 'main',
//         language: 'node',
//         deploy: 'docker',
//         webhookUrl: 'https://api.otto-ci.com/webhook/proj-2',
//         status: 'active',
//         createdAt: '2024-01-14T09:15:00Z',
//         updatedAt: '2024-01-19T09:30:00Z',
//         lastBuild: '2024-01-19T09:15:00Z',
//     },
// ];

// 프로젝트 목록 조회
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 개별 프로젝트 조회
export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

// 프로젝트 생성
export function createProject(
  data: Omit<Project, 'id' | 'webhookUrl' | 'status' | 'createdAt' | 'updatedAt'>
): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...data,
    id: `proj-${Date.now()}`, // 간단한 ID 생성
    webhookUrl: `https://api.otto-ci.com/webhook/proj-${Date.now()}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedProjects = [...projects, newProject];
  saveProjects(updatedProjects);
  return newProject;
}

// 프로젝트 업데이트
export function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'webhookUrl' | 'createdAt'>>
): Project | null {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) return null;

  const currentProject = projects[index]!; // index check already done above
  const updatedProject = {
    ...currentProject,
    ...data,
    updatedAt: new Date().toISOString(),
  } as Project;

  const updatedProjects = [...projects];
  updatedProjects[index] = updatedProject;
  saveProjects(updatedProjects);
  return updatedProject;
}

// 프로젝트 삭제
export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filteredProjects = projects.filter((p) => p.id !== id);

  if (filteredProjects.length === projects.length) return false; // 삭제할 프로젝트 없음

  saveProjects(filteredProjects);
  return true;
}

// 로컬 스토리지에 저장
function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
}

// 초기 데이터 설정 (첫 접속 시)
export function initializeProjects(): void {
  if (typeof window === 'undefined') return;

  const existing = localStorage.getItem(PROJECTS_KEY);
  if (!existing) {
    saveProjects([]);
  }
}
