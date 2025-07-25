<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

단위 테스트가 팀 내 테스트 전략과 어떻게 맞물리는지 이야기해보자.

테스트 전략의 시작을 위한 첫 번째 단계는 테스트 전략의 범위를 다양한 테스트 유형으로 나누는 것

## 10.1 일반적인 테스트 유형과 수준

- 테스트 수준이 높을수록 실제 의존성을 더 많이 사용하게 되어 전체 시스템 정확성에 대한 신뢰도는 높음
- 그러나 테스트는 더 느려지고 불안정해질 수 있는 단점이 있음.

즉, 테스트를 작성할 때 고려해야 할 여러 기준을 설정하고, 그 기준에 따라 어떤 테스트 유형을 선택할지 판단할 수 있도록 하는 것

### 10.1.1 테스트 평가 기준

결정을 내리는데 가장 우선시해야 하는 것은 문제에 대한 명확한 기준을 세우고, 그것을 바탕으로 선택지를 좁혀 나가는 것

- 일밙적으로 사용하는 테스트 평가표
  | 기준 | 평가 점수(최소/최대) | 비고 |
  | ------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
  | 복잡성(complexity) | 1/5 | 테스트를 작성하고 읽고 디버깅하는 과정이 얼마나 복잡한지 평가하는 기준. 낮을수록 좋음 |
  | 불안정성(flakiness) | 1/5 | 다른 팀의 코드, 네트워크, 데이터베이스, 설정 권한 등 제어할 수 없는 요소 때문에 테스트가 실패할 가능성을 평가하는 기준. 낮을 수록 좋음 |
  | 테스트를 통과할 때 신뢰도(confidence) | 1/5 | 테스트가 통과할 때 개발자에게 얼마나 큰 신뢰를 주는지 평가하는 기준. 높을수록 좋음 |
  | 유지 보수성(maintainability) | 1/5 | 테스트를 얼마나 자주 변경해야 하며, 변경이 얼마나 쉬운지를 평가하는 기준. 높을수록 좋음 |
  | 실행 속도(speed) | 1/5 | 테스트가 얼마나 빨리 끝나는지 평가하는 기준. 높을수록 좋음 |

### 10.1.2 단위 테스트와 컴포넌트 테스트

이 둘은 같은 범주에 속하지만,

컴포넌트 테스트는 단위 테스트에 비해 더 많은 함수나 클래스, 컴포넌트를 작업 단위 내에 포함할 수 있다는 점에서 차이가 있음.

즉, 컴포넌트 테스트는 진입점과 종료점 사이에 더 많은 ‘요소’를 포함함

- 단위 테스트나 컴포넌트 테스트 평가표
  | 기준 | 평가 점수(최소/최대) | 비고 |
  | ------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
  | 복잡성(complexity) | 1/5 | 테스트의 범위가 작고 테스트 내에서 모든 것을 제어할 수 있기 때문에 모든 테스트 유형 중에서 가장 단순 |
  | 불안정성(flakiness) | 1/5 | 테스트 내 모든 것을 제어할 수 있기 때문에 모든 테스트 유형 중에서 가장 불안정성이 적음 |
  | 테스트를 통과할 때 신뢰도(confidence) | 1/5 | 단위 테스트가 통과되면 기분은 좋지만, 시스템이 제대로 동작하는지 확신이 없음. 그저 작은 부분이 잘 작동하는 것을 알 수 있을 뿐 |
  | 유지 보수성(maintainability) | 5/5 | 모든 테스트 유형 중에서 가장 유지보수가 쉬움. 코드를 읽었을 때 이해하기가 상대적으로 쉽기 때문 |
  | 실행 속도(speed) | 5/5 | 파일, 네트워크, 데이터베이스 등 외부 의존성 없이 모든 것이 메모리에서 실행되기 때문에 모든 테스트 유형 중에서 가장 빠름 |

### 10.1.3 통합 테스트

통합 테스트는 일반적인 단위 테스트와 거의 비슷하게 보이지만, 일부 의존성은 스텁으로 대체할 수 없음

예를 들어 실제 환경 설정, 데이터베이스, 파일 시스템 등을 사용하는 경우.

하지만 테스트를 실행하는 방식은 단위 테스트와 유사함.

메모리 내에서 시스템 객체를 생성하고, 그 객체의 특정 기능을 직접 호출하여 테스트를 진행한다는 점에서 동일

| 기준                                  | 평가 점수(최소/최대) | 비고                                                                                                                                                     |
| ------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 불안정성(flakiness)                   | 2-3/5                | 실제 의존성 수에 따라 불안정성이 달라질 수 있음                                                                                                          |
| 테스트를 통과할 때 신뢰도(confidence) | 2-3/5                | 통합 테스트가 통과하면 데이터베이스나 설정 파일처럼 우리가 제어할 수 없는 요소를 사용하는 코드가 제대로 동작한다는 것을 확인할 수 있어 더 큰 신뢰감을 줌 |
| 유지 보수성(maintainability)          | 3-4/5                | 통합 테스트는 외부 의존성을 사용하기 때문에 단위 테스트보다 더 복잡함                                                                                    |
| 실행 속도(speed)                      | 3-4/5                | 파일 시스템, 네트워크, 데이터베이스, 스레드 등에 대한 의존성 때문에 단위 테스트보다 더 느릴 수 있음                                                      |

### 10.1.4 API 테스트

10.1.3 까지의 낮은 수준의 테스트에서는 애플리케이션을 배포하거나 실제로 실행할 필요없이 테스트할 수 있었음.

하지만 API 테스트 단계에서는 애플리케이션을 최소한 일부라도 배포하고 네트워크를 통해 호출해야 함.

단위 테스트, 컴포넌트 테스트, 통합 테스트와 달리 메모리 내부에서 하는 것이 아닌, 작업 프로세스 외부에서 하는 테스트. 이제 더 이상 메모리에서 직접 테스트할 코드를 가짜로 만드는 등 행위를 하지 않음 (= 네트워크와 네트워크 서비스의 배포라는 새로운 의존성이 추가됨)

| 기준                                  | 평가 점수(최소/최대) | 비고                                                                                                                                                        |
| ------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 불안정성(flakiness)                   | 3-4/5                | 네트워크를 사용하면서 불안정성이 더 높아짐                                                                                                                  |
| 테스트를 통과할 때 신뢰도(confidence) | 3-4/5                | API 테스트가 통과되면 통합 테스트를 했을 때보다 더 큰 신뢰감을 느낄 수 있음. 배포 후에도 다른 사람이 우리 팀이 만든 API를 믿고 사용할 수 있다고 느끼기 때문 |
| 유지 보수성(maintainability)          | 2-3/5                | 네트워크는 환경 설정을 더 복잡하게 만들며, 테스트를 변경하거나 API를 추가하거나 변경할 때 더 세심하게 주의를 기울여서 작업해야 함                           |
| 실행 속도(speed)                      | 2-3/5                | 네트워크 때문에 테스트 속도가 상당히 느려짐                                                                                                                 |

### 10.1.5 E2E/UI 격리 테스트

E2E 테스트와 사용자 인터페이스(UI) 테스트는 사용자 관점에서 애플리케이션을 테스트함

‘격리’라는 표현을 사용한 이유는 우리가 테스트하는 애플리케이션이나 서비스만 대상으로 하고 이 애플리케이션에 필요할 수 있는 외부 애플리케이션이나 서비스는 배포하지 않고 테스트한다는 의미를 명시하기 위해서.

해당 테스트에서는 타사의 인증 절차나 동일 서버에서 배포해야 하는 다른 애플리케이션의 API, 테스트 중인 애플리케이션에 속하지 않는 모든 코드를 가짜로 만들어 사용함.

| 기준                                  | 평가 점수(최소/최대) | 비고                                                                                                                                                                                               |
| ------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 불안정성(flakiness)                   | 4/5                  | 사용하는 의존성이 많기 때문에 테스트가 느려지거나, 타임아웃이 발생하거나, 제대로 작동하지 않을 가능성이 커짐                                                                                       |
| 테스트를 통과할 때 신뢰도(confidence) | 4/5                  | 이 유형의 테스트가 통과하면 큰 안도감을 느낌. 애플리케이션에 대한 신뢰도가 크게 상승함                                                                                                             |
| 유지 보수성(maintainability)          | 1-2/5                | 의존성이 더 많이 추가되어 설정이 복잡해지고, 테스트를 변경하거나 작업 흐름을 추가해야 하거나 변경할 때 더욱더 주의를 기울여야 함. 테스트가 필연적으로 길어지며, 보통은 여러 단계로 나누어 테스트함 |
| 실행 속도(speed)                      | 1-2/5                | 이 테스트는 로그인이나 캐싱, 여러 페이지 탐색 등 사용자 인터페이스를 살펴보는 과정에서 속도가 매우 느려질 수 있음                                                                                  |

### 10.1.6 E2E/UI 시스템 테스트

E2E 및 UI 시스템 테스트 단계에서는 가짜인 것이 없음.

실제 운영 환경에 가장 가까운 상태에서 수행함. 모든 의존성 애플리케이션과 서비스가 실제로 있지만 테스트 시나리오에 맞게 다르게 구성될 수 있음.

| 기준                                  | 평가 점수(최소/최대) | 비고                                                                                                                                  |
| ------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 불안정성(flakiness)                   | 5/5                  | 오만 가지 이유로 테스트가 실패할 수 있으며, 그 원인도 매우 다양함                                                                     |
| 테스트를 통과할 때 신뢰도(confidence) | 5/5                  | 이 수준의 테스트는 통과했을 때 관련된 모든 코드가 아무런 조작 없이 전부 제대로 작동한다고 느끼게 하므로 가증 높은 신뢰감을 줄 수 있음 |
| 유지 보수성(maintainability)          | 1/5                  | 의존성이 많고 테스트 진행을 위한 작업 흐름이 길어 유지 보수가 어려움.                                                                 |
| 실행 속도(speed)                      | 1/5                  | UI와 실제 의존성을 사용하기 때문에 테스트 속도가 매우 느림. 하나의 테스트를 완료하는 데 몇 분에서 몇 시간이 걸릴 수 있음              |

> **E2E 격리 테스트와 E2E 시스템 테스트는 타깃 환경과 목적에 차이가 있다
> E2E 격리 테스트**는 QA 서버나 개발 서버에서 하며, 실제 운영 환경의 의존성을 배제하고 테스트를 수행함. 예를 들어 Cypress를 사용하여 애플리케이션의 로그인 기능을 테스트할 때, 실제 인증 서버 대신 모의 서버를 이용하여 인증 절차를 검증하는 방식임. 이 경우 외부 서비스나 API는 스텁으로 대체되어 애플리케이션의 특정 기능이나 사용자 흐름을 검증하는 데 중점을 둠.
> **E2E 시스템 테스트**는 스테이징 환경에서 수행되며, 이 환경은 실제 운영 환경과 동일한 조건을 갖춤. 모든 의존성이 실제로 동작하며, 전체 시스템이 제대로 동작하는지 검증하는 것이 목적임. 예를 들어 Cypress를 사용하여 실제 인증 서버와 통신하면서 로그인 기능을 테스트할 때 운영 환경과 동일하게 구성된 스테이징 환경에서 테스트를 진행함

## 10.2 각 테스트 수준마다 존재하는 안티 패턴

### 10.2.1 E2E 테스트만 사용하는 안티 패턴

안티 패턴인 이유?

이 수준의 테스트는 매우 느리고, 유지 보수하기 어렵고, 디버깅이 힘들며, 불안정성이 높음. 이러한 비용은 계속 발생하는 반면, 새로운 E2E 테스트를 작성하는 것에서 얻는 가치는 점점 줄어들기 때문

- E2E 테스트의 가치 하향
  - E2E 테스트를 처음 작성하면 테스트를 통과할 때 큰 신뢰감을 얻을 수 있음.
    - 여러 경로에서 불러온 코드를 한 번에 확인하며, 애플리케이션과 다른 시스템 간 연결 부분을 관리하는 코드도 함께 검증하기 때문
  - 두번째 E2E 테스트는 보통 첫 번째 테스트에서 큰 변화는 없음. 여기서 얻는 신뢰도는 첫 번재 테스트에 비해 훨씬 적음. 하지만 디버깅이나 코드 수정, 코드 읽기, 코드 실행에 드는 비용은 첫 번재 테스트와 거의 차이가 없음.
    즉, 첫 번째 테스트에서 얻을 수 있었던 가치 대비 두 번째 테스트에서 얻는 가치가 상대적으로 너무 작음.
  - 첫 번째 테스트에서 약간의 수정만 하고 싶다면, 이전 테스트보다 더 낮은 수준에서 테스트하는 것이 훨씬 실용적임. 다음 시나리오를 더 낮은 수준에서 테스트하면서도 거의 동일한 신뢰도를 얻을 수 있다면 굳이 또 다른 E2E 테스트를 실행하여 더 많은 비용을 지불할 필요는 없음.
- 빌드 분석자
  - E2E 테스트(고수준 테스트)는 불안정성이 높아 여러 가지 이유로 실패할 수 있음. 그 중 일부는 실제 테스트와 관련 없는 이유 때문임.
    따라서 조직 내에서는 실패 이유를 체계적으로 분석하고, 그 이유가 실제로 중요한 문제인지 아니면 사소한 오류인지 구분하는 역할이 필요함. 보통 이러한 역할은 QA팀이 맡음
    → **빌드 분석자**라고 함.
    빌드가 실패하면 데이터를 분석하고 몇 시간에 걸친 검토 끝에 “네, 겉으로는 실패한 것처럼 보이지만 실제로는 문제없습니다.”라고 말해야하는 사람들.
    보통 조직 내에서 어떻게든 릴리즈를 마무리 해야한다며 빌드를 성공시켜야 한다고 압박함.
    스트레스 많고, 답답함을 많이 느낌 → 대충 힘들다는 말 같음
    고수준 E2E 테스트가 많은 조직에서 빌드 분석자가 많음
- 빌드 분석의 고충을 해결하는 방법
  - 탄탄하게 설계된 자동화 테스트 파이프라인을 구축하는 것.
  - → 불안정한 테스트가 있더라도 빌드가 성공했는지 자동으로판단할 수 있음
  - 넷플릭스는 실제 환경에서 빌드가 어떻게 작동하는지 통계적으로 측정하여 자동으로 배포 승인을 할 수 있는 자체 도구를 개발했다고 공개한 바 있음. ([링크](https://netflixtechblog.com/automated-canary-analysis-at-netflix-with-kayenta-3260bc7acc69))
  - 이러한 파이프라인을 구축하는 것은 가능하지만 많은 시간이 필요하며, 조직 문화도 이러한 변화를 받아들일 준비가 되어있어야 함
- ‘책임 전가’ 사고방식
  - E2E 테스트만으로 운영하는 것이 조직에 해로운 또 다른 이유 - 이러한 테스트를 유지하고 모니터링하는 책임이 QA 팀에만 있기 때문.
    이는 조직 내 개발자들이 빌드 결과에 관심을 가지지 않거나, 그 결과를 알지 못할 수도 있다는 것을 의미함. 테스트를 본인의 소유물로 생각하지 않음.
  - 이 사고방식은 많은 오해를 낳을 수 있으며 나아가 품질 문제까지 일으킬 수 있음.
- 안티 패턴이 생기는 이유
  - 업무 분리
    - 많은 조직이 QA 팀과 개발 팀을 별도로 운영하며, 각 팀이 별도의 파이프라인(자동화된 빌드 작업과 대시보드)을 관리함.
  - 잘되고 있으면 굳이 바꾸지 말자는 사고방식
  - 매몰 비용의 오류
    - 이미 이러한 유형의 테스트를 많이 작성했는데 이제 와서 바꾸거나 낮은 수준의 테스트로 변경하면 그동안 들인 시간과 노력이 모두 헛된 일이 된다고 여기는 잘못된 생각
    - 이러한 테스트를 삭제하고 기본적인 시나리오만 남긴채 그동안 쏟아부었던 시간을 다시 되찾는 것이 더 효율적
- 그렇다면 E2E 테스트는 하지 말아야 할까?
  - 그렇지는 않다.
  - E2E 테스트는 피할 수 없음
  - E2E 테스트의 장점 중 하나는 애플리케이션이 제대로 작동한다는 확신과 신뢰감을 준다는 것
  - 완전히 피하지는 말되, E2E 테스트 수를 최소화할 것을 강력히 추천함

### 10.2.2 저수준 테스트만 사용하는 안티 패턴

- E2E 테스트만 사용하는 것과 반대되는 경우는 저수준 테스트만 사용하는 것
- 유닛 테스트는 빠른 테스트 결과를 얻을 수 있지만, 애플리케이션이 하나의 통합된 시스템으로 제대로 작동하는지에 대한 신뢰도는 얻지 못함
- 결국 테스트를 실행한 후에도 배포하기 전에 정말로 내보내도 괜찮은지 확인하려고 계속 수동 디버깅과 테스트를 수행함.
- 테스트는 빠르게 실행되겠지만, 여전히 많은 시간을 들여 수동으로 테스트하고 검증해야 함.
- 이 안티 패턴은 주로 개발자가 저수준 테스트만 작성하는 데 익숙하거나, 고수준 테스트 작성에 자신이 없거나, 고수준 테스트는 QA팀이 해야 할 일이라고 생각할 때 주로 발생함
- 단위테스는 하지 말아야할까? X. 단위 테스트뿐만 아니라 고수준의 테스트도 함께 작성하길 강력 추천함.

### 10.2.3 저수준 테스트와 고수준 테스트의 단절

- 속도를 위해 저수준 테스트를, 신뢰를 위해 고수준 테스트를 함께 사용하면 이상적이지만, 실제로 이러한 방식은 조직 내에서 여러 문제를 발생시킬 수 있음
- 테스트가 단절되어 있으면 예상치 못한 오류나 비효율성이 따라옴
  - 여러 테스트가 여러 수준에서 반복적으로 생김
  - 저수준 테스트를 작성하는 사람과 고수준을 작성하는 사람이 다름. → 서로가 작성한 테스트에는 관심이 없고, 서로 다른 파이프라인에서 각기 다른 유형의 테스트가 실행될 가능성이 높음. 하나의 파이프라인이 실패하면 다른 테스트를 작성한 쪽은 그 사실을 알지 못하거나 알아도 그다지 관심이 없을 수 있음
  - 상위 수준과 하위 수준 테스트에서 발생할 수 있는 문제점이 모두 드러남.
    상위 수준에서는 긴 테스트 시간, 유지 보수의 어려움, 빌드 분석의 필요성, 불안정성 문제
    하위 수준에서는 충분한 테스트 신뢰도를 얻지 못함.
    저수준 테스트의 속도 이점을 제대로 활용하지 못하는데, 이는 상위 수준에서 결국 테스트가 반복되기 때문.

## 10.3 테스트 레시피 전략

조직 내 테스트 유형 간 균형을 맞추려면 무언가 조치가 필요. 테스트 레시피 전략.

테스트 레시피란 특정 기능을 어떻게 테스트할지 간단한 계획을 세우는 것.

- 이 계획에는 주요 시나리오뿐만 아니라, 예외적인 상황이나 극단적인 경우도 모두 포함해야 함.
- 잘 만든 테스트 레시피는 각 시나리오에 어떤 테스트 수준이 적합하지 판단하는 데 사용할 수 있음

### 10.3.1 테스트 레시피 작성 방법

- 테스트 레시피를 작성할 때는 최소한 두 사람이 함께 작업하면 좋음
  한 명은 개발자 관점에서, 다른 한 명은 테스터 관점에서 접근하는 것이 이상적
  조직 내 테스트 팀이 없을 때는 개발자 둘이서 진행하되, 한 명은 시니어 개발자면 좋음.
  각 시나리오를 테스트 계층의 특정 수준에 맞추는 작업은 주관적인 판단이 많이 개입될 수 있으므로 두 명이 함께 작업하면 서로 당연하게 여긴 부분을 점검하여 보다 정확하게 작업할 수 있음.
- 테스트를 계획하는 데 별도의 도구는 필요 없음.
- 테스트 레시피를 작성하기에 가장 좋은 시점은 기능 작업을 시작하기 직전. 테스트 레시피가 해당 기능의 ‘완료’ 기준에 포함되며, 전체 테스트 레시피가 통과해야 기능이 완성되었다고 볼 수 있음
- 레시피는 고정된 산출물이 아니라, 소프트웨어 개발의 다른 모든 것처럼 계속해서 발전을 거듭하는 작업물임
- 테스트 레시피는 기능이 제대로 작동한다는 ‘신뢰감’을 주는 시나리오 목록을 의마함. 일반적으로 저수준 테스트와 고수준 테스트 간에는 1:5 또는 1:10 비율을 유지하면 좋음. 예를 들어 단위 테스트가 100개 있다면 통합 테스트는 열 개, E2E 테스트는 한 개면 충분함
- 테스트 레시피를 너무 형식적으로 다룰 필요는 없음. 간단한 시나리오 5~20줄 정도를 자동화된 방식으로 어떤 수준에서 테스트할 것인지 간략하게 설명한 목록일 뿐임.
- 예시) 사용자 프로필 기능에 대한 테스트 레시피
  - E2E: 로그인, 프로필 화면으로 이동, 이메일 업데이트, 로그아웃, 새 이메일로 다시 로그인, 프로필 화면 업데이트 확인
  - API: 더 복잡한 데이터를 사용하여 UpdateProfile API 호출
  - 단위 테스트: 잘못된 이메일로 프로필 업데이트 로직 확인
  - 단위 테스트: 동일한 이메일로 프로필 업데이트 로직 확인
  - 단위 테스트: 프로필 데이터 변환 및 데이터 복원

### 10.3.2 언제 테스트 레시피를 사용해야 할까?

1. 기능이나 사용자 스토리를 작업하기 직전에는 팀 동료와 함께 어떤 시나리오를 테스트할지 구상해 보는 것이 좋음
2. 그 시나리오를 어느 수준에서 테스트하면 가장 적합할지 결정함
   - 보통 5~15분 정도 대화를 하면 충분히 많은 것을 결정할 수 있고 이후 코딩을 시작하면 테스트도 함께 작성하게 됨

- 조직 내 자동화나 QA 역할이 있을 때는 개발자가 저수준 테스트를 작성하고 QA가 고수준 테스트를 작성, 이 과정은 기능을 개발하는 것과 동시에 진행. 작업을 기다리지 않오 각자 테스트를 작성함
- 기능 토글을 사용하고 있다면 이를 테스트할 때도 확인해야 함. 기능이 꺼져있다면 해당 기능의 테스트는 실행되지 않도록 해야함

### 10.3.3 테스트 레시피 작성 규칙

- 속도: 어떤 기능이 제대로 동작하는지 신뢰도를 얻는 방법이 E2E밖에 없는 경우를 제외하고, 저수준 테스트를 우선시하기
- 신뢰도: 모든 테스트가 통과되었을 때 ‘이 기능은 잘 동작한다고 확신’한다면 레시피는 완성된 것
- 수정: 코딩하면서 테스트를 추가하거나 삭제해도 괜찮으나, 함께 작성한 사람들에게는 꼭 알려야함
- 적절한 타이밍: 코딩을 시작하기 직전에 누가 코딩할지 정해졌을 때 이 레시피를 작성함
- 페어 프로그래밍: 가능하다면 혼자가 아닌 다른 사람과 함께 작성하기. 사람마다 생각하는 방식이 다르기 때문에 서로의 테스트 아이디어와 관점을 공유하는 것이 중요
- 기존 기능의 테스트를 중복하지 말 것: 현재 시나리오를 이미 다른 테스트에서 테스트한 적이 있다면, 같은 수준에서 이 시나리오를 다시 테스트할 필요는 없음
- 다른 계층에서 테스트를 중복해서 작성하지 말 것: 동일한 시나리오를 여러 테스트 수준에서 반복하지 말아야 함.
- 더 많이, 더 빠르게: 좋은 기준은 테스트 수준 간 비율을 최소 1:5로 맞추는 것.
- 실용성 중시: 모든 기능을 전부 각기 다른 테스트 수준으로 작성해야할 필요 없음. 어떤 기능이나 사용자 스토리는 단위 테스트만으로 충분할 수 있고, 다른 경우에는 API 테스트나 E2E 테스트만으로도 충분할 수 있음.

## 10.4 배포 파이프라인 관리

- 여러 조직에서 성능 테스트나 보안 테스트, 부하 테스트 같은 작업을 통합 자동화 파이프라인의 일부로 실행하며, 이는 배포하거나 풀 리퀘스트를 올릴 때 마다 수행됨.
- 이러한 테스트는 두 가지 그룹으로 나뉨
  - 배포 중단 테스트: 변경 사항에 문제없는지 배포 전에 판단하는 테스트
    - 단위 테스트, E2E 테스트, 시스템 테스트, 보안 테스트 등이 여기에 속함
    - 보통 결과가 명확함
    - 테스트가 통과하면 변경 사항에 문제없다는 의미고, 실패하면 코드를 수정한 후 배포할 수 있음
  - 참고용 테스트: 주요 성과 지표(KPI)를 파악하고 지속적으로 모니터링하는 데 사용함.
    - 코드를 분석하고 복잡도를 스캔하기도 함.
    - 고부하 성능 테스트를 하거나 장시간 실행되는 비기능적 테스트 역시 여기에 포함됨
    - 결과가 단순히 ‘성공’이나 ‘실패’로 나뉘지 않음. 실패하더라도 다음 스프린트 작업으로 다시 추가해서 진행할 수 있으며, 소프트웨어 배포에는 큰 영향을 주지 않음.

### 10.4.1 배포 파이프라인 대 탐색 파이프라인

참고용 테스트가 배포 과정에서 중요한 결과를 확인하는 데 걸리는 시간을 늘리지 않도록 배포에 직접적인 영향을 미치는 테스트와 그렇지 않은 테스트를 구분하여 두 가지 파이프라인으로 운영해야 함.

- **배포 파이프라인**: 배포를 결정하는 테스트에 사용함. 이 파이프라인이 통과하면 코드를 자동으로 프로덕션에 배포해도 된다는 확신을 가질 수 있어야 함. 이 파이프라인의 테스트는 비교적 빠르게 실행 결과를 알려 줄 수 있어야 함.
  - 코드가 커밋될 때마다 자동으로 실행됨. 빌드 → 단위 테스트 → API/E2E 테스트 → 보안 테스트 → 배포 후 상태를 대시보드에 표시
- **탐색 파이프라인**: 참고용 테스트에 사용함. 배포 파이프라인과 병렬로 실행되지만 지속적으로 작동하며, 배포 기준에는 포함되지 않음.
  실행 결과를 기다릴 필요가 없기 때문에 테스트가 오래 결려도 무방함. 오류가 발견되면 다음 스프린트에서 해결해야 할 작업 항목으로 추가하면 됨. 배포는 중단되거나 지연되지 않음
  - 변경 사항이 있을 때마다 지속적으로 자동 실행됨. 린트 → 코드 품질 → 성능 → 부하 → KPI를 대시보드에 표시
- 배포 파이프라인의 목적은 코드가 문제없이 통과될 경우 배포를 진행하는 것이며, 때에 따라서는 프로덕션 환경까지 배포하는 것.
- 탐색 파이프라인의 목적은 리팩터링해야 하는 코드가 어디인지 찾는 데 있음.
- 개발과 배포 과정의 효율성을 높이는 것은 팀원 모두의 적극적인 참여를 이끌어 낼 수 있는 중요한 요소이며, 테스트를 탐색 파이프라인과 배포 파이프라인으로 분리하는 것도 이러한 효율성을 유지하는 효과적인 방법 중 하나임

### 10.4.2 테스트 계층 병렬화

- 테스트 결과를 신속하게 얻는 것은 매우 중요하기 때문에 파이프라인의 각 단계별 결과를 빠르게 받기 위해 여러 테스트 계층을 병렬로 실행하는 것이 일반적임
- 테스트가 끝나면 동적으로 생성된 병렬 환경을 바로 해제하는 방식도 사용할 수 있음
- 병렬 배포 파이프라인 - `단위 테스트` / `API/E2E 테스트` / `보안 테스트`
- 병렬 탐색 파이프라인 - `린트` / `코드 품질` / `빌드 -> 성능 / 부하`
- 동적 환경을 활용할 때 큰 효과를 얻을 수 있음.
- 병렬로 실행할 수 있는 대상은 파이프라인 내 포함된 단계만 해당되는 것이 아님. 일반 테스트도 병렬화할 수 있음. 예를 들어 E2E 테스트가 많아 실행 결과를 받는 데 시간이 오래 걸린다면 이를 병렬 테스트 그룹으로 나눔. → 결과를 받기까지 시간을 크게 단축할 수 있음.

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

- 예시) 크레딧 정산 기능에 대한 테스트 레시피

  - E2E: 로그인, 컨테이너 대시보드 화면으로 이동, 컨테이너 실행, 컨테이너 접속, 크레딧 소모량 확인, 컨테이너 정지, 크레딧 정산(업데이트 확인) 확인
  - API: 컨테이너 정지 API 호출
  - 단위 테스트: 잘못된 dockerId로 크레딧 정산 요청 로직 (실패) 확인 `updateCreditAndResource`
  - 단위 테스트: 동일한 dockerId로 크레딧 정산 요청 로직 확인

- 고수준 테스트가 존재하지 않지만 한 그룹에서 모든 테스트를 작성하다보니, 두 그룹이 소통 없이 테스트를 만들어 따로 작성되고 중복되는 안티 패턴도 줄어들지 않을까..

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

1. 테스트는 수준별로 나뉘며, 각 수준마다 장단점과 목적이 다름

   - 단위 테스트: 빠르고 안정적이지만 전체 시스템 신뢰도는 낮음

   - 통합/컴포넌트 테스트: 일부 외부 의존성 포함, 적당한 신뢰도와 속도

   - API 테스트: 네트워크 레벨에서 애플리케이션 동작 확인 가능

   - E2E 격리 테스트: 외부 의존성은 제거하고 사용자 흐름을 테스트

   - E2E 시스템 테스트: 실제 운영 환경과 유사하게 전체 시스템 검증

2. 평가 기준으로 테스트 유형을 비교할 수 있음

   - 복잡성, 불안정성, 신뢰도, 유지보수성, 실행 속도 등의 기준을 점수화해 비교

   - 테스트를 설계할 때 각 시나리오에 가장 적합한 수준을 선택

3. 안티 패턴 주의

   - E2E만 사용하는 경우: 느리고 불안정하며, 비용이 큼

   - 유닛 테스트만 사용하는 경우: 시스템 전체의 작동 여부를 보장 못함

   - 테스트 수준 간 단절: 중복 테스트, 커뮤니케이션 단절, 효율 저하

4. 테스트 레시피 전략

   - 기능 개발 전에 어떤 시나리오를 어떤 테스트 수준에서 확인할지 계획

   - 실용성과 효율을 고려해 적절한 테스트 비율 구성 (예: 유닛:통합:E2E = 10:2:1)

5. 배포 파이프라인 관리

   - 배포 파이프라인: 빠르고 신뢰도 높은 테스트만 포함

   - 탐색 파이프라인: 코드 품질, 성능 등 참고용 테스트 포함

   - 테스트 병렬화 및 자동화로 속도와 안정성 확보
