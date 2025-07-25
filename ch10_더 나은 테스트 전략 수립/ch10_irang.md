<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

테스트 유형과 수준 그리고 각 테스트 수준에 존재하는 안티 패턴에 대해서 알아보고 조직 내 테스트 유형 간 균형을 맞추는 방법에 대해서 알아보는 챕터이다.

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

## Concept

### 테스트 유형과 수준

일반적이라고 할 수 있는 테스트 유형은 다음과 같다.

- E2E/UI 통합 테스트
- E2E/UI 격리 테스트
- API 테스트
- 통합 테스트
- 컴포넌트 테스트
- 단위 테스트

필자가 테스트 수준을 평가할 때 중요하게 여기는 기준은 다음과 같다.
| 기준 | 비고 |
| ---- | --- |
| 복잡성 | 테스트를 작성하고 읽고 디버깅하는 과정이 얼마나 복잡한지 평가하는 기준이며 낮을수록 좋음. |
| 불안정성 | 다른 팀의 코드, 네트워크, DB, 설정 권한 등 제어권이 없는 요소 때문에 테스트가 실패할 가능성을 평가하는 기준으로 낮을수록 좋음. |
| 테스트를 통과할 때 신뢰도 | 테스트가 통과할 때 개발자에게 얼마나 큰 신뢰를 주는 평가하는 기준으로 높을수록 좋음. |
| 유지보수성 | 테스트를 얼마나 자주 변경해야 하며, 변경이 얼마나 쉬운지 평가하는 기준으로 높을수록 좋음. |
| 실행 속도 | 테스트가 얼마나 빨리 끝나는지 평가하는 기준으로 높을수록 좋음. |

`단위 테스트와 컴포넌트 테스트`

- 단위 테스트

  지금까지 다룬 테스트 유형으로 진입점을 통해 작업 단위를 호출한 후 그 종료점을 확인하는 자동화된 코드

- 컴포넌트 테스트

  단위 테스트에 비해 더 많은 함수나 클래스, 컴포넌트 작업 단위 내에 포함할 수 있어 단위 테스트에 비해 진입점과 종료점 사이에 더 많은 요소를 포함함

| 기준                      | 평가점수(최소1/최대5) | 비고                                                      |
| ------------------------- | --------------------- | --------------------------------------------------------- |
| 복잡성                    | 1/5                   | 모든 유형 중 가장 단순 함                                 |
| 불안정성                  | 1/5                   | 테스트 내 모든 것을 제어할 수 있기 때문에 불안정성이 적음 |
| 테스트를 통과할 때 신뢰도 | 1/5                   | 전체적으로 잘 동작하는지에 대한 확신이 없음               |
| 유지보수성                | 5/5                   | 모든 유형 중 가장 유지보수가 쉬움                         |
| 실행 속도                 | 5/5                   | 인 메모리에 실행되기 때문에 가장 빠름                     |

`통합 테스트`
단위 테스트와 비슷해보이지만 일부 의존성은 스텁으로 대체할 수 없음.

| 기준                      | 평가점수(최소1/최대5) | 비고                                                                                   |
| ------------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| 불안정성                  | 2~3/5                 | 실제 의존성 수에 따라 불안정수가 달라짐                                                |
| 테스트를 통과할 때 신뢰도 | 2~3/5                 | 제어할 수 없는 요소에 대해 제대로 동작한다는 것을 확인할 수 있음                       |
| 유지보수성                | 3~4/5                 | 외부 의존성을 사용하기 때문에 단위테스트보다 복잡함                                    |
| 실행 속도                 | 3~4/5                 | 파일 시스템, 네트워크, DB, 스레드 등에 대한 의존성 때문에 단위 테스트보다 느릴 수 있음 |

`API 테스트`

단위, 컴포넌트, 통합 테스트와 달리 작업 프로세스 외부에서 하는 테스트로 네트워크 서비스의 배포라는 새로운 의존성이 추가되는 테스트

| 기준                      | 평가점수(최소1/최대5) | 비고                                        |
| ------------------------- | --------------------- | ------------------------------------------- |
| 불안정성                  | 3~4/5                 | 네트워크를 사용하면서 불안정성이 더 높아짐  |
| 테스트를 통과할 때 신뢰도 | 3~4/5                 | 통합 테스트보다 더 큰 신뢰감을 느낄 수 있음 |
| 유지보수성                | 2~3/5                 | 환경설정을 더 복잡하게 만듬                 |
| 실행 속도                 | 2~3/5                 | 네트워크 때문에 테스트 속도가 상당히 느려짐 |

`E2E/UI 격리 테스트`

테스트하는 애플리케이션이나 서비스만 대상으로 하고 이 애플리케이션이 필요할 수 있는 외부 애플리케이션이나 서비스는 배포하지 않고 테스트 함. 즉, 이런 부분의 모든 코드를 가짜로 만들어 사용 함.

| 기준                      | 평가점수(최소1/최대5) | 비고                                                                                          |
| ------------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| 불안정성                  | 4/5                   | 사용하는 의존성이 많기 때문에 제대로 동작하지 않을 가능성이 높아짐                            |
| 테스트를 통과할 때 신뢰도 | 4/5                   | 애플리케이션에 대한 신뢰도가 상승함                                                           |
| 유지보수성                | 1~2/5                 | 보통 여러 단계로 나누어 테스트하며 의존성이 많이 추가되어 설정이 복잡해짐                     |
| 실행 속도                 | 1~2/5                 | 로그인이나 캐싱, 여러 페이지 탐색 등 사용자의 인터페이스를 살펴보는 과정에서 오래걸릴 수 있음 |

`E2E/UI 시스템 테스트`

여기서는 가짜인 것이 없이 모든 것을 진짜로 테스트 함.

| 기준                      | 평가점수(최소1/최대5) | 비고                                                |
| ------------------------- | --------------------- | --------------------------------------------------- |
| 불안정성                  | 5/5                   | 오만 가지 이유로 테스트가 실패할 수 있음            |
| 테스트를 통과할 때 신뢰도 | 5/5                   | 전부 제대로 동작한다고 생각할 수 있음               |
| 유지보수성                | 1/5                   | 의존성이 많고 테스트 진행을 위한 작업 흐름이 길어짐 |
| 실행 속도                 | 1/5                   | UI와 실제 의존성을 사용하기 때문에 매우 느림        |

### 각 테스트 수준에 존재하는 안티패턴

`E2E 테스트만 사용하는 안티패턴`

테스트의 거의 대부분을 E2E 테스트로 운용하거나 E2E만 사용하는 경우로

- E2E 테스트 효율성 하향으로 이어짐
- 고수준 테스트는 불안정성이 높아 여러가지 이유로 실패할 수 있는데 그 중 일부는 실제 테스트와 관련 없는 이유 때문에 이러한 오류를 구분해야하는 리소스가 큼

그렇다고 E2E 테스트를 하지 말아야하는 것은 아님
-> 최소화 하자

`저수준 테스트만 사용하는 안티패턴`

저수준 테스트만 사용하는 경우로

- 하나의 통합된 시스템으로 제대로 작동하는지에 대한 신뢰도는 얻지 못함

그렇다고 단위 테스트는 하지 말아야하는 것은 아님
-> 고수준의 테스트도 함께 작성하자

`저수준 테스트와 고수준 테스트의 단절`

속도를 위한 저수준 테스트, 신뢰를 위한 고수준 테스트를 함께 사용하면 이상적이지만 서로 다른 수준의 테스트간에 단절되어 있으면 예상치 못한 오류나 비효율성이 따라오기 마련

- 여러 테스트가 여러 수준에서 반복적으로 생김
- 테스트를 작성하는 사람이 달라 서로 다른 파이프라인에서 각기 다른 유형의 테스트가 실행될 가능성이 높아짐, 이는 곧 서로간에 관심이 없어질 수 있다는 의미

### 조직 내 테스트 유형 간 균형을 맞추는 방법

테스트 레시피 전략을 추천

`테스트 레시피 전략`
특정 기능을 어떻게 테스트할지 간단한 계획을 세우는 것으로 주요 시나리오 뿐만 아니라, 예외적인 상황이나 극단적인 경우도 모두 포함해야 함

`테스트 레시피 작성 방법`
최소 두 사람이 함께 작업하는 것이 좋으며 작성하기에 가장 좋은 시점은 기능 작업을 시작하기 직전
테스트 레시피는 기능이 제대로 작동한다는 신뢰감을 주는 시나리오 목록을 의미하는 것으로 일반적으로 저수준 테스트와 고수준 테스트 간에는 1:5 또는 1:10 비율을 유지

`테스트 레시피 예시`
사용자 프로필 기능에 대한 테스트 레시피

- E2E: 로그인, 프로필 화면으로 이동, 이메일 업데이트, 로그아웃, 새 이메일로 다시 로그인, 프로필 화면 업데이트 확인
- API: 더 복잡한 데이터를 사용하여 UpdateProfile API 호출
- 단위 테스트: 잘못된 이메일로 프로필 업데이트 로직 확인
- 단위 테스트: 동일한 이메일로 프로필 업데이트 로직 확인
- 단위 테스트: 프로필 데이터 변환 및 데이터 복원

`테스트 레시피 사용시점`
기능이나 사용자 스토리를 작업하기 직전에 어떤 시나리오를 테스트할지 구상해보는 것이 좋음
그 다음, 그 시나리오를 어떤 수준에서 테스트하면 좋을지 결정 해야 함

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

- 각 테스트 수준에 존재하는 안티패턴을 알 수 있었음

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->
