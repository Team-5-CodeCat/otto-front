import { create } from 'zustand';

// UI 상태 인터페이스
interface UIState {
  // Pipeline Builder 표시 여부
  showPipelineBuilder: boolean;
  
  // 액션들
  setShowPipelineBuilder: (show: boolean) => void;
  togglePipelineBuilder: () => void;
}

// Zustand 스토어 생성
export const useUIStore = create<UIState>((set) => ({
  // 초기 상태
  showPipelineBuilder: false,
  
  // 액션들
  setShowPipelineBuilder: (show: boolean) => 
    set({ showPipelineBuilder: show }),
    
  togglePipelineBuilder: () => 
    set((state) => ({ showPipelineBuilder: !state.showPipelineBuilder })),
}));
