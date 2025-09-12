/**
 * BlockType 열거형
 * 
 * 파이프라인에서 사용할 수 있는 모든 블록 타입을 정의합니다.
 * 각 타입은 고유한 기능과 UI를 가집니다.
 * 
 * 타입별 설명:
 * - OS: 운영체제 설정 (ubuntu:22.04, alpine 등)
 * - OS_PACKAGE: OS 패키지 관리자를 통한 패키지 설치 (apt, yum, dnf, apk, zypper, pacman, brew)
 * - INSTALL_MODULE_NODE: Node.js 패키지 매니저를 통한 패키지 설치 (npm, yarn, pnpm)
 * - CUSTOM_TEST_BLOCK: 테스트 명령어 실행 (npm test, jest, vitest 등)
 * - CUSTOM_COMMAND: 사용자 정의 쉘 명령어 실행
 * 
 * 사용법:
 * - handleAddNode(BlockType.OS_PACKAGE): OS 패키지 설치 블록 생성
 * - switch문에서 block.type과 비교하여 타입별 처리
 */
export enum BlockType {
  // OS의 종류
  OS = "os",
  // OS 패키지 종류 apt 등등
  OS_PACKAGE = "os_package",
  // 패키지 설치 종류
  INSTALL_MODULE_NODE = "install_module_node",
  CUSTOM_TEST_BLOCK = "custom_test",
  CUSTOM_COMMAND = "custom_command"
}

/**
 * Block 기본 인터페이스
 * 
 * 모든 블록 타입이 공통으로 가져야 하는 필수 속성들을 정의합니다.
 * 
 * 속성 설명:
 * - type: BlockType enum 값으로 블록의 종류 식별
 * - block_id: crypto.randomUUID()로 생성된 고유 식별자
 * - on_success: 성공 시 실행할 다음 블록의 block_id (필수)
 * - on_failed: 실패 시 실행할 다음 블록의 block_id (선택적)
 * 
 * 연결 규칙:
 * - on_success가 빈 문자열("")이면 파이프라인 종료
 * - on_failed가 없거나 빈 문자열이면 실패 시 파이프라인 중단
 * - 순환 참조 방지를 위해 블록 간 연결 검증 필요
 */
export interface Block {
  // 타입
  type: BlockType;
  // 블록 고유 아이디 (uuid)
  block_id: string;
  // 성공했을 때 다음 노드 (필수)
  on_success: string;
  // 실패했을 때 다음 노드 (선택적)
  on_failed?: string;
}

/**
 * OSBlock 인터페이스
 * 
 * 운영체제를 설정하는 블록입니다.
 * 컨테이너나 가상 환경의 기본 OS 이미지를 지정할 때 사용합니다.
 * 
 * 속성:
 * - os_name: OS 이미지 이름 (예: "ubuntu:22.04", "alpine:3.18", "node:18-alpine")
 * 
 * 사용 예시:
 * { type: BlockType.OS, block_id: "uuid", os_name: "ubuntu:22.04", on_success: "next-block-id" }
 */
export interface OSBlock extends Block {
  type: BlockType.OS;
  os_name: string;
}

/**
 * OSPackageBlock 인터페이스
 * 
 * 운영체제 패키지 매니저를 통해 시스템 패키지를 설치하는 블록입니다.
 * 다양한 Linux 배포판의 패키지 매니저를 지원합니다.
 * 
 * 속성:
 * - package_manager: 패키지 매니저 종류 (apt, yum, dnf, apk, zypper, pacman, brew)
 * - install_packages: 설치할 패키지 목록 배열
 * 
 * 지원 패키지 매니저:
 * - apt: Ubuntu, Debian
 * - yum: CentOS, RHEL (구버전)
 * - dnf: Fedora, CentOS, RHEL (신버전)
 * - apk: Alpine Linux
 * - zypper: openSUSE
 * - pacman: Arch Linux
 * - brew: macOS
 * 
 * 사용 예시:
 * { type: BlockType.OS_PACKAGE, block_id: "uuid", package_manager: "apt", install_packages: ["curl", "wget"], on_success: "next" }
 */
export interface OSPackageBlock extends Block {
  type: BlockType.OS_PACKAGE;
  package_manager: string;
  install_packages: string[];
}

/**
 * InstallNodePackageBlock 인터페이스
 * 
 * Node.js 패키지 매니저를 통해 JavaScript/TypeScript 패키지를 설치하는 블록입니다.
 * 프로젝트의 의존성을 설치하거나 전역 도구를 설치할 때 사용합니다.
 * 
 * 속성:
 * - package_manager: Node.js 패키지 매니저 (npm, yarn, pnpm)
 * - install_packages: 설치할 패키지 목록 배열
 * 
 * 지원 패키지 매니저:
 * - npm: Node.js 기본 패키지 매니저
 * - yarn: Facebook에서 개발한 패키지 매니저
 * - pnpm: 빠르고 디스크 효율적인 패키지 매니저
 * 
 * 사용 예시:
 * { type: BlockType.INSTALL_MODULE_NODE, block_id: "uuid", package_manager: "npm", install_packages: ["express", "lodash"], on_success: "next" }
 */
export interface InstallNodePackageBlock extends Block {
  type: BlockType.INSTALL_MODULE_NODE;
  package_manager: string;
  install_packages: string[];
}

/**
 * CustomTestBlock 인터페이스
 * 
 * 테스트 명령어를 실행하는 블록입니다.
 * 다양한 테스트 프레임워크나 커스텀 테스트 스크립트를 실행할 수 있습니다.
 * 
 * 속성:
 * - commands: 실행할 테스트 명령어 목록 배열
 * 
 * 일반적인 테스트 명령어:
 * - "npm test": package.json의 test 스크립트 실행
 * - "npm run test:coverage": 코드 커버리지와 함께 테스트
 * - "jest": Jest 테스트 프레임워크 실행
 * - "vitest": Vite 기반 테스트 실행
 * - "pytest": Python 테스트 실행
 * 
 * 사용 예시:
 * { type: BlockType.CUSTOM_TEST_BLOCK, block_id: "uuid", commands: ["npm test", "npm run test:coverage"], on_success: "next" }
 */
export interface CustomTestBlock extends Block {
  type: BlockType.CUSTOM_TEST_BLOCK;
  commands: string[];
}

/**
 * CustomCommandBlock 인터페이스
 * 
 * 사용자 정의 쉘 명령어를 실행하는 블록입니다.
 * 가장 유연한 블록으로, 어떤 명령어든 실행할 수 있습니다.
 * 
 * 속성:
 * - commands: 실행할 명령어 목록 배열
 * 
 * 사용 사례:
 * - 빌드 명령어: ["npm run build", "docker build -t app ."]
 * - 배포 명령어: ["deploy.sh", "kubectl apply -f deployment.yaml"]
 * - 데이터 처리: ["python data_process.py", "./backup_script.sh"]
 * - 환경 설정: ["chmod +x scripts/*", "cp config/production.env .env"]
 * 
 * 사용 예시:
 * { type: BlockType.CUSTOM_COMMAND, block_id: "uuid", commands: ["echo Hello", "ls -la"], on_success: "next" }
 */
export interface CustomCommandBlock extends Block {
  type: BlockType.CUSTOM_COMMAND;
  commands: string[];
}

/**
 * AnyBlock 유니온 타입
 * 
 * 모든 블록 타입의 유니온입니다.
 * 블록을 다루는 함수나 변수에서 어떤 타입의 블록이든 받을 수 있도록 합니다.
 * 
 * TypeScript의 discriminated union을 활용하여 type 필드로 타입 구분이 가능합니다.
 * 
 * 사용법:
 * - 함수 파라미터: (block: AnyBlock) => void
 * - switch문으로 타입 검사: switch(block.type) { case BlockType.OS: ... }
 * - 타입 가드: if(block.type === BlockType.OS_PACKAGE) { /* block은 OSPackageBlock */ }
 */
export type AnyBlock = OSBlock | OSPackageBlock | InstallNodePackageBlock | CustomTestBlock | CustomCommandBlock;
