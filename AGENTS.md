# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## 프로젝트 개요

물로그(mullog) — 하루 물 섭취량을 기록하고 목표 달성 여부를 확인하는 모바일 앱.
로그인 없음, 모든 데이터는 AsyncStorage 로컬 저장.

## 개발 명령어

```bash
npx expo start        # 개발 서버 시작
npx expo start --ios  # iOS 시뮬레이터
npx expo start --android  # 안드로이드 에뮬레이터
npm run lint          # 린트
```

## 기술 스택

- React Native + Expo + TypeScript
- Zustand (상태 관리)
- AsyncStorage (로컬 저장)
- react-native-chart-kit (통계 차트)

## 아키텍처

라우팅은 expo-router 사용. `src/app/` 하위 파일이 곧 라우트.

```
src/
├── app/          # expo-router 라우트 (화면)
├── components/   # 재사용 UI 컴포넌트
├── store/        # Zustand 스토어 (waterStore.ts)
├── services/     # AsyncStorage 래퍼 (storageService.ts)
├── types/        # 타입 정의 (water.ts)
└── utils/        # 순수 함수 (calculateProgress.ts)
```

### 데이터 흐름

버튼 클릭 → `waterStore.addWater()` → Zustand 상태 업데이트 → `storageService` AsyncStorage 저장 → UI 재렌더링

### 화면 구성

- `app/index.tsx` (HomeScreen): 섭취 기록 버튼(+200ml, +300ml, 직접 입력), 진행률 표시, 목표 설정 모달
- `app/statistics.tsx` (StatisticsScreen): 오늘 섭취량, 최근 7일 총합 바 차트, 평균

### 핵심 결정사항

- 7일 통계는 날짜별 하루 총합 기준으로 집계
- 목표 설정은 별도 화면 없이 HomeScreen 모달로 처리
