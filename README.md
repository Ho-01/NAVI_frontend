# NAVI: Outdoor Escape Room 🏯
> **한국 전통 문화유산을 배경으로 한 스토리 기반 퍼즐 어드벤처 게임**  
> 첫 번째 시나리오: **경복궁**

![GitHub last commit](https://img.shields.io/github/last-commit/Ho-01/NAVI_frontend?color=blue&style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/Ho-01/NAVI_frontend?color=brightgreen&style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/Ho-01/NAVI_frontend?style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/Ho-01/NAVI_frontend?style=social)

---

## 🎮 프로젝트 개요
NAVI는 한국의 역사적 장소를 무대로 한 **위치 기반 스토리형 퍼즐 게임**입니다.  
플레이어는 실제 장소(예: 경복궁)를 탐험하며 NPC와 대화하고 퍼즐을 풀고,  
아이템을 수집하면서 한국의 전설과 역사를 체험할 수 있습니다.  

- **시나리오 확장형**: 매달 새로운 시나리오 추가 (서울 → 전국 주요 문화유산)  
- **스토리 + 퍼즐 융합**: 한국 요괴, 전설, 역사적 사건을 기반으로 한 서사  
- **플랫폼**: 웹 버전(PC/모바일 브라우저) → 차후 앱 출시 예정  

👉 [데모 플레이 (Vercel 배포)](https://navi.vercel.app)  

---

## 🛠 기술 스택

### Frontend
- [Phaser 3](https://phaser.io/) + [Vite](https://vitejs.dev/)
- 배포: [Vercel](https://vercel.com/)
- 특징:
  - JSON 기반 시나리오 로딩
  - 대화/컷씬/퍼즐 씬 모듈화 (`DialogScene`, `ProblemScene`, `TypeDragScene` 등)

### Backend
- Spring Boot (Java 17, Gradle)  
- Database: SQLite (개발용), MySQL (운영 고려)  
- Hosting: AWS EC2 (t4g.nano/micro) + Nginx  
- 기능:
  - JWT 기반 인증 (게스트/구글/카카오 로그인)
  - 진행도, 힌트, 아이템, 랭킹 관리
  - 로그 수집 (ELK: Elasticsearch, Logstash, Kibana)

---

## 📂 폴더 구조

```bash
NAVI/
├── frontend/        # Phaser + Vite 클라이언트
│   ├── src/
│   │   ├── scenes/        # TitleScene, DialogScene, ProblemScene ...
│   │   ├── assets/        # 이미지/사운드
│   │   └── ui/            # 공통 UI 컴포넌트
│   └── vite.config.js
│
├── backend/         # Spring Boot 서버
│   ├── src/main/java/com/navi
│   │   ├── auth/          # 로그인, JWT
│   │   ├── user/          # 유저 엔티티, 서비스
│   │   ├── scenario/      # 시나리오 진행 관리
│   │   └── ...
│   └── build.gradle
│
└── docs/            # 기획 문서, 시나리오 JSON, 아트 리소스
