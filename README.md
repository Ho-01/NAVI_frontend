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

## 🛠 기술 스택

### 🎨 Frontend
![Phaser](https://img.shields.io/badge/Phaser-3-2E86C1?logo=phaser&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge)  
배포: ![Vercel](https://img.shields.io/badge/Vercel-▲-000000?logo=vercel&logoColor=white&style=for-the-badge)

---

### ⚙️ Backend
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot&logoColor=white&style=for-the-badge)
![Java](https://img.shields.io/badge/Java-17-007396?logo=java&logoColor=white&style=for-the-badge)
![Gradle](https://img.shields.io/badge/Gradle-8-02303A?logo=gradle&logoColor=white&style=for-the-badge)  
Database: ![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white&style=for-the-badge) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white&style=for-the-badge)  
Infra: ![AWS EC2](https://img.shields.io/badge/AWS%20EC2-t4g.nano%2Fmicro-FF9900?logo=amazon-aws&logoColor=white&style=for-the-badge) ![Nginx](https://img.shields.io/badge/Nginx-1.25-009639?logo=nginx&logoColor=white&style=for-the-badge)

---

### 📊 Logging & Monitoring
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8.13-005571?logo=elasticsearch&logoColor=white&style=for-the-badge)
![Logstash](https://img.shields.io/badge/Logstash-8.13-005571?logo=logstash&logoColor=white&style=for-the-badge)
![Kibana](https://img.shields.io/badge/Kibana-8.13-005571?logo=kibana&logoColor=white&style=for-the-badge)

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
