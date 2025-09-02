import type { PipelineNodeData } from './codegen';

/**
 * YAML 스크립트를 파싱하여 노드 데이터를 생성
 */
export function parseYAMLToNodes(yamlScript: string): PipelineNodeData[] {
  const nodes: PipelineNodeData[] = [];

  // Start 노드 추가
  nodes.push({
    kind: 'start',
    label: 'Start',
  });

  const lines = yamlScript.split('\n');
  let currentStep: any = null;
  let inRunBlock = false;
  let runBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // steps 섹션 찾기
    if (trimmedLine === 'steps:' || trimmedLine === '- steps:') {
      continue;
    }

    // step 시작
    if (trimmedLine.startsWith('- name:')) {
      const stepName = line.replace('- name:', '').trim().replace(/['"]/g, '');
      currentStep = { name: stepName };
      continue;
    }

    // uses 액션 처리
    if (trimmedLine.startsWith('uses:') && currentStep) {
      const action = trimmedLine.replace('uses:', '').trim();
      currentStep.action = action;

      if (action.includes('checkout')) {
        nodes.push({
          kind: 'git_clone',
          label: currentStep.name || 'Git Clone',
          repoUrl: 'https://github.com/user/repo.git',
          branch: 'main',
        });
      } else if (action.includes('setup-node')) {
        nodes.push({
          kind: 'prebuild_node',
          label: currentStep.name || 'Prebuild Node',
          manager: 'npm',
        });
      } else if (action.includes('setup-python')) {
        nodes.push({
          kind: 'prebuild_python',
          label: currentStep.name || 'Prebuild Python',
        });
      } else if (action.includes('setup-java')) {
        nodes.push({
          kind: 'prebuild_java',
          label: currentStep.name || 'Prebuild Java',
        });
      }
      continue;
    }

    // run 블록 시작
    if (trimmedLine === 'run: |' && currentStep) {
      inRunBlock = true;
      runBlockLines = [];
      continue;
    }

    // run 블록 내부 라인 처리
    if (inRunBlock && currentStep) {
      if (line.startsWith(' ') && line.trim() !== '') {
        // 들여쓰기된 라인은 run 블록의 일부
        runBlockLines.push(line.trim());
      } else if (line.trim() === '' || !line.startsWith(' ')) {
        // run 블록 종료
        inRunBlock = false;
        const command = runBlockLines.join('\n');

        // 명령어 분석 및 노드 생성
        processCommand(command, currentStep, nodes);
        currentStep = null;
        runBlockLines = [];
      }
      continue;
    }

    // 단일 run 명령어 처리
    if (trimmedLine.startsWith('run:') && currentStep && !inRunBlock) {
      const command = trimmedLine.replace('run:', '').trim();

      // 명령어 분석 및 노드 생성
      processCommand(command, currentStep, nodes);
      currentStep = null;
      continue;
    }
  }

  // 마지막 run 블록이 끝나지 않은 경우 처리
  if (inRunBlock && currentStep && runBlockLines.length > 0) {
    const command = runBlockLines.join('\n');
    processCommand(command, currentStep, nodes);
  }

  return nodes;
}

/**
 * 명령어를 분석하여 적절한 노드를 생성
 */
function processCommand(command: string, step: any, nodes: PipelineNodeData[]) {
  if (command.includes('npm ci') || command.includes('npm install')) {
    nodes.push({
      kind: 'prebuild_node',
      label: step.name || 'Install Dependencies',
      manager: 'npm',
    });
  } else if (command.includes('pip install') || command.includes('python -m pip install')) {
    nodes.push({
      kind: 'prebuild_python',
      label: step.name || 'Install Python Dependencies',
    });
  } else if (command.includes('npm test') || command.includes('yarn test')) {
    nodes.push({
      kind: 'run_tests',
      label: step.name || 'Run Tests',
      testType: 'unit',
      command: command,
    });
  } else if (command.includes('pytest') || command.includes('python -m pytest')) {
    nodes.push({
      kind: 'run_tests',
      label: step.name || 'Run Tests',
      testType: 'unit',
      command: command,
    });
  } else if (command.includes('npm run build') || command.includes('yarn build')) {
    nodes.push({
      kind: 'build_npm',
      label: step.name || 'Build NPM',
    });
  } else if (command.includes('py_compile') || command.includes('python -m py_compile')) {
    nodes.push({
      kind: 'build_python',
      label: step.name || 'Build Python',
    });
  } else if (command.includes('docker build')) {
    nodes.push({
      kind: 'docker_build',
      label: step.name || 'Docker Build',
      dockerfile: 'Dockerfile',
      tag: 'myapp:latest',
    });
  } else if (command.includes('deploy') || command.includes('kubectl')) {
    nodes.push({
      kind: 'deploy',
      label: step.name || 'Deploy',
      environment: 'production',
      deployScript: command,
    });
  } else if (command.includes('git clone')) {
    const repoMatch = command.match(/git clone.*?([^\s]+\.git)/);
    const branchMatch = command.match(/-b\s+([^\s]+)/);

    nodes.push({
      kind: 'git_clone',
      label: step.name || 'Git Clone',
      repoUrl: repoMatch ? repoMatch[1] : 'https://github.com/user/repo.git',
      branch: branchMatch ? branchMatch[1] : 'main',
    });
  } else {
    // 커스텀 명령어
    nodes.push({
      kind: 'prebuild_custom',
      label: step.name || 'Custom Command',
      script: command,
    });
  }
}

/**
 * Shell 스크립트를 파싱하여 노드 데이터를 생성
 */
export function parseShellToNodes(shellScript: string): PipelineNodeData[] {
  const nodes: PipelineNodeData[] = [];

  // Start 노드 추가
  nodes.push({
    kind: 'start',
    label: 'Start',
  });

  const lines = shellScript.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 주석이나 빈 줄 건너뛰기
    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }

    // shebang 건너뛰기
    if (trimmedLine.startsWith('#!/')) {
      continue;
    }

    // set 명령어 건너뛰기
    if (trimmedLine.startsWith('set ')) {
      continue;
    }

    // echo 명령어는 건너뛰기 (로깅용)
    if (trimmedLine.startsWith('echo ')) {
      continue;
    }

    // git clone
    if (trimmedLine.includes('git clone')) {
      const repoMatch = trimmedLine.match(/git clone.*?([^\s]+\.git)/);
      const branchMatch = trimmedLine.match(/-b\s+([^\s]+)/);

      nodes.push({
        kind: 'git_clone',
        label: 'Git Clone',
        repoUrl: repoMatch ? repoMatch[1] : 'https://github.com/user/repo.git',
        branch: branchMatch ? branchMatch[1] : 'main',
      });
      continue;
    }

    // git checkout
    if (trimmedLine.includes('git checkout')) {
      const branchMatch = trimmedLine.match(/git checkout\s+([^\s]+)/);
      if (branchMatch) {
        nodes.push({
          kind: 'git_clone',
          label: 'Git Checkout',
          repoUrl: 'https://github.com/user/repo.git',
          branch: branchMatch[1],
        });
      }
      continue;
    }

    // apt-get install
    if (trimmedLine.includes('apt-get install')) {
      const packages = trimmedLine.match(/apt-get install.*?([^\s]+(?:\s+[^\s]+)*)/);
      nodes.push({
        kind: 'linux_install',
        label: 'Linux Install',
        osPkg: 'apt',
        packages: packages ? packages[1] : 'git curl',
      });
      continue;
    }

    // pip install
    if (trimmedLine.includes('pip install') || trimmedLine.includes('python -m pip install')) {
      nodes.push({
        kind: 'prebuild_python',
        label: 'Install Python Dependencies',
      });
      continue;
    }

    // python -m py_compile (컴파일 체크)
    if (trimmedLine.includes('py_compile') || trimmedLine.includes('python -m py_compile')) {
      nodes.push({
        kind: 'build_python',
        label: 'Build Python',
      });
      continue;
    }

    // python -m pytest (테스트)
    if (trimmedLine.includes('pytest') || trimmedLine.includes('python -m pytest')) {
      nodes.push({
        kind: 'run_tests',
        label: 'Run Tests',
        testType: 'unit',
        command: trimmedLine,
      });
      continue;
    }

    // python deploy.py (배포)
    if (trimmedLine.includes('python deploy.py') || trimmedLine.includes('python deploy')) {
      const envMatch = trimmedLine.match(/--env=([^\s]+)/);
      nodes.push({
        kind: 'deploy',
        label: 'Deploy',
        environment: envMatch ? envMatch[1] : 'production',
        deployScript: trimmedLine,
      });
      continue;
    }

    // npm ci / npm install
    if (trimmedLine.includes('npm ci') || trimmedLine.includes('npm install')) {
      nodes.push({
        kind: 'prebuild_node',
        label: 'Install Dependencies',
        manager: 'npm',
      });
      continue;
    }

    // yarn install
    if (trimmedLine.includes('yarn install')) {
      nodes.push({
        kind: 'prebuild_node',
        label: 'Install Dependencies',
        manager: 'yarn',
      });
      continue;
    }

    // pnpm install
    if (trimmedLine.includes('pnpm install')) {
      nodes.push({
        kind: 'prebuild_node',
        label: 'Install Dependencies',
        manager: 'pnpm',
      });
      continue;
    }

    // npm test / yarn test
    if (trimmedLine.includes('npm test') || trimmedLine.includes('yarn test')) {
      nodes.push({
        kind: 'run_tests',
        label: 'Run Tests',
        testType: 'unit',
        command: trimmedLine,
      });
      continue;
    }

    // npm run build / yarn build
    if (trimmedLine.includes('npm run build') || trimmedLine.includes('yarn build')) {
      nodes.push({
        kind: 'build_npm',
        label: 'Build NPM',
      });
      continue;
    }

    // python setup.py build
    if (trimmedLine.includes('python setup.py build')) {
      nodes.push({
        kind: 'build_python',
        label: 'Build Python',
      });
      continue;
    }

    // mvn package / gradle build
    if (trimmedLine.includes('mvn package') || trimmedLine.includes('gradle build')) {
      nodes.push({
        kind: 'build_java',
        label: 'Build Java',
      });
      continue;
    }

    // docker build
    if (trimmedLine.includes('docker build')) {
      const dockerfileMatch = trimmedLine.match(/-f\s+([^\s]+)/);
      const tagMatch = trimmedLine.match(/-t\s+([^\s]+)/);

      nodes.push({
        kind: 'docker_build',
        label: 'Docker Build',
        dockerfile: dockerfileMatch ? dockerfileMatch[1] : 'Dockerfile',
        tag: tagMatch ? tagMatch[1] : 'myapp:latest',
      });
      continue;
    }

    // deploy 관련 명령어
    if (
      trimmedLine.includes('deploy') ||
      trimmedLine.includes('kubectl') ||
      trimmedLine.includes('./deploy')
    ) {
      nodes.push({
        kind: 'deploy',
        label: 'Deploy',
        environment: 'production',
        deployScript: trimmedLine,
      });
      continue;
    }

    // curl로 슬랙 알림
    if (trimmedLine.includes('curl') && trimmedLine.includes('slack')) {
      nodes.push({
        kind: 'notify_slack',
        label: 'Notify Slack',
        channel: '#deployments',
        message: 'Deployment completed!',
      });
      continue;
    }

    // 기타 명령어는 커스텀으로 처리
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      nodes.push({
        kind: 'prebuild_custom',
        label: 'Custom Command',
        script: trimmedLine,
      });
    }
  }

  return nodes;
}
