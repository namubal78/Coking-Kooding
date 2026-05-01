'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { HelpButton, HelpModal, HelpSection } from '@/components/HelpModal'

interface DraftEntry {
  id: number
  sha: string
  date: string
  content: string
}

const DUMMY_DRAFTS: DraftEntry[] = [
  {
    id: 4,
    sha: '4639e23',
    date: '2026-04-28',
    content: `## 변경 개요
은새월드 전용 서브 네비게이션 바를 구현하고, 기능 데모 섹션에 더미 데이터 기반 체험 페이지 4종을 추가했다.

## 핵심 변경
**BEFORE**: 메인 Navbar에 은새월드 링크가 나열되어 시각적으로 복잡했고, 데모 섹션은 3개뿐이었다.
**AFTER**: world/layout.tsx에 \`fixed top-16 h-10\` 서브 네비바를 추가해 메인/월드 영역을 명확히 분리. 데모 7종 (기존 3 + 신규 플래너·운동·앨범·메신저).

## 기술 판단
서브 네비는 \`fixed top-16\`으로 메인 Navbar 바로 아래에 위치시키고, spacer div를 문서 흐름에 삽입해 컨텐츠가 가려지지 않게 처리. 채팅 페이지는 \`h-[calc(100vh-6.5rem)]\`으로 조정.

## 키워드
SubNavigation, WorldLayout, DemoPage, DummyData, TailwindCSS`,
  },
  {
    id: 3,
    sha: '524f293',
    date: '2026-04-24',
    content: `## 변경 개요
전체 UI를 gray-950 기반으로 통일하고 대규모 리팩터링을 진행했다.

## 핵심 변경
**BEFORE**: 페이지마다 배경색이 달랐고 컴포넌트 스타일이 불일치했다.
**AFTER**: 일관된 다크 테마, Tailwind \`backdrop-blur\`를 이용한 글래스모피즘 Navbar, 카드 hover 효과 통일.

## 기술 판단
Tailwind v4에서 \`@layer\` 방식 변경으로 globals.css를 정리. 모바일 \`min-h-screen\` 이슈를 \`dvh\` 단위로 해결하려 했으나 Safari 호환성 문제로 \`min-h-screen\`을 유지함.

## 키워드
UI Refactor, DarkTheme, TailwindCSS, GlassMorphism`,
  },
  {
    id: 2,
    sha: '0dcff5f',
    date: '2026-04-23',
    content: `## 변경 개요
포트폴리오 페이지 완성 및 Slack Bot 배포 알림 연동을 완료했다.

## 핵심 변경
**BEFORE**: 포트폴리오는 정적 카드 목록만 있었고, 배포 결과 알림이 없었다.
**AFTER**: 카테고리 필터(프론트/백엔드/전체), hover 애니메이션, GitHub Actions → Slack \`chat.postMessage\` 알림.

## 기술 판단
Slack Web API Bot Token을 Render 환경변수로 관리. GitHub Actions에서 \`curl\`로 직접 호출해 빌드 성공/실패 분기 알림을 구현함. 실패 시 HTTP 코드와 응답 로그(800자)를 첨부.

## 이슈
백엔드 재배포 중에 dev-log 워크플로우가 실행되어 cold start 401 응답이 슬랙 실패 알림으로 발송됨. 정상 동작 확인.

## 키워드
Portfolio, SlackAPI, CI/CD, GitHubActions`,
  },
  {
    id: 1,
    sha: 'c0dd6d4',
    date: '2026-04-22',
    content: `## 변경 개요
프로젝트 README를 전면 갱신하고 포트폴리오 레이아웃 초안을 작성했다.

## 핵심 변경
**BEFORE**: README에 기본 설명만 있었고 포트폴리오 페이지가 없었다.
**AFTER**: 기술 스택·배포 환경·기능 목록을 포함한 구조화된 README. Tailwind grid 기반 포트폴리오 카드 레이아웃 초안.

## 기술 판단
Next.js 정적 export + GitHub Pages 제약상 \`generateStaticParams\`를 활용해 동적 경로를 빌드 타임에 정적 파일로 생성. ISR은 정적 export와 함께 사용 불가 확인.

## 키워드
README, Portfolio, Next.js, StaticExport`,
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('## ')) {
      return <h3 key={i} className="text-sm font-semibold text-indigo-300 mt-4 mb-1">{line.slice(3)}</h3>
    }
    if (line.startsWith('**BEFORE**:')) {
      return <p key={i} className="text-xs text-gray-400 mb-1"><span className="text-red-400 font-semibold">BEFORE</span>:{line.slice(11)}</p>
    }
    if (line.startsWith('**AFTER**:')) {
      return <p key={i} className="text-xs text-emerald-300 mb-1"><span className="font-semibold">AFTER</span>:{line.slice(10)}</p>
    }
    if (line.trim() === '') return <div key={i} className="h-1" />
    return <p key={i} className="text-xs text-gray-400 leading-relaxed">{line}</p>
  })
}

export default function DemoDraftPage() {
  const [expanded, setExpanded] = useState<number | null>(DUMMY_DRAFTS[0].id)
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-1">Demo · Draft</p>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold">개발 드래프트</h1>
          <HelpButton onClick={() => setHelpOpen(true)} />
        </div>
        <p className="text-gray-500 text-sm mb-8">
          커밋 push 시 Claude AI가 자동으로 작성하는 개발 일지. 이건 더미 데이터 샘플입니다.
        </p>

        <div className="space-y-3">
          {DUMMY_DRAFTS.map(entry => (
            <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-900/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded">
                    {entry.sha}
                  </span>
                  <span className="text-sm text-white font-medium">{formatDate(entry.date)}</span>
                </div>
                <span className="text-gray-600 text-sm">{expanded === entry.id ? '▲' : '▼'}</span>
              </button>

              {expanded === entry.id && (
                <div className="px-5 pb-5 border-t border-gray-800">
                  <div className="mt-4 space-y-0.5">
                    {renderContent(entry.content)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">
          실제 드래프트는 로그인 후 은새월드 → 드래프트에서 확인할 수 있습니다.
        </p>
      </main>

      {helpOpen && (
        <HelpModal title="📝 개발 드래프트 — 구현 방식" onClose={() => setHelpOpen(false)}>
          <HelpSection label="자동 생성 파이프라인" items={[
            '① GitHub push → dev-log.yml 워크플로우 트리거',
            '② 2분 대기 (Docker 빌드·Render 배포 안정화)',
            '③ Spring Boot POST /api/dev-logs/webhook 호출',
            '   X-Webhook-Secret 헤더로 인증 (서버간 시크릿, JWT 아님)',
            '④ 커밋 목록을 Claude Haiku 4.5에 전달 → 한국어 개발일지 요약 생성',
            '⑤ dev_logs 테이블(PostgreSQL)에 저장 + Slack #dev 알림 전송',
          ]} />
          <HelpSection label="편집 기능" items={[
            'Toast UI Editor: 마크다운 WYSIWYG 에디터로 AI 요약 직접 수정',
            'PUT /api/dev-logs/{id}: 수정된 내용으로 DB 덮어쓰기',
            'Slack Bot: 수정 완료 시 #dev 채널에 알림',
            'PDF 출력: window.print() + @media print CSS로 PDF 저장',
          ]} />
          <HelpSection label="보안 & 접근" items={[
            '웹훅: X-Webhook-Secret으로 자체 인증 (Spring Security 우회 허용)',
            '열람: 가족 JWT 로그인 필요 — 공개 블로그와 별개',
            '수정: JWT 인증 + 서버에서 권한 검증',
          ]} />
        </HelpModal>
      )}
    </div>
  )
}
