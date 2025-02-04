<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

- Jest 소개 및 실습
- 단위테스트 프레임워크
- AAA 패턴 / USE 전략
- Jest 를 통한 테스트 코드 작성법

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

### 제스트의 역할

1. 테스트 라이브러리
2. 검증 라이브러리(expect())
3. 테스트 러너(실행)
4. 테스트 리포터(실행 결과)
5. 격리 기능(목, 스텁, 스파이)

### 단위 테스트 프레임워크의 장점

- 테스트 코드의 일관된 형식
- 반복성
- 신뢰성과 시간 절약
- 공동의 이해

=> 테스트를 작성하는 **코드 영역** 뿐만 아니라 테스트를 실행하고 결과를 출력하는 **실행 영역** 에도 활용되어 테스트 과정을 효율적으로 도와준다.

### AAA 패턴

- Arrange(준비) : 테스트하려는 시스템과 종속성을 원하는 상태로 설정
- Act(실행) : 메서드 호출, 필요한 데이터 / 결과 확인
- Assert(검증) : 결과 검증
  - jest -> expect()
  - js 내장 모듈 -> assert()
  - 그외 -> ...

=> 테스트를 구조적으로 작성할 수 있도록 도와주는 패턴

#### 예제

```js
// 유효한 이메일인지 확인하는 함수
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

test(("이메일 검증 테스트") => {
  // 1️⃣ Arrange (준비)
  const validEmail = "test@example.com";

  // 2️⃣ Act (실행)
  const result = isValidEmail(validEmail);

  // 3️⃣ Assert (검증)
  expect(result).toBe(true);
});
```

### USE 전략

테스트 코드를 작성할때 이름을 명확하게 짓는 것이 상당히 중요하다

> 테스트 이름이 명확할 수록 코드에서 문제가 생겼을때 코드 전문을 자세히 보지 않아도 어디에 문제가 있는지 쉽게 예측 가능

- Unit(테스트 대상)
- Senario(입력값이나 상황)
- Expectation(기댓값 or 결과)

```js
test("isValidEmail, given a valid email format, returns true", () => {
  // 1️⃣ Arrange
  const validEmail = "test@example.com";

  // 2️⃣ Act
  const result = isValidEmail(validEmail);

  // 3️⃣ Assert
  expect(result).toBe(true);
});
```

### describe()

테스트 그룹을 만들어주는 함수

1. 테스트 코드 구조를 좀 더 체계적으로 나누어 관리 가능
2. USE 전략의 세 가지 요소를 분리 가능
   => 가독성 측면 -> 논리적인 영역의 역할
   => 기능적 측면 -> 독립적인 테스트 환경 보장(1장에서 언급)

#### 예제

```js
describe("isValidEmail", () => {
  test("given a valid email format, returns true", () => {
    // 1️⃣ Arrange
    const validEmail = "test@example.com";

    // 2️⃣ Act
    const result = isValidEmail(validEmail);

    // 3️⃣ Assert
    expect(result).toBe(true);
  });

  test("given an invalid email format, returns false", () => {
    // 1️⃣ Arrange
    const invalidEmail = "invalid-email";

    // 2️⃣ Act
    const result = isValidEmail(invalidEmail);

    // 3️⃣ Assert
    expect(result).toBe(false);
  });

  test("given an empty string, returns false", () => {
    // 1️⃣ Arrange
    const emptyEmail = "";

    // 2️⃣ Act
    const result = isValidEmail(emptyEmail);

    // 3️⃣ Assert
    expect(result).toBe(false);
  });
});
```

### test() vs it()

- test()는 일반적인 테스트를 정의할 때 사용됨
  - 테스트 대상과 상황이 명확할때 유용
- it()은 보다 자연어처럼 테스트 이름을 표현할 수 있도록 해주는 함수
  - 동일한 시나리오에서 동일한 진입점에 대해 여러 결과를 검증할때 유용

=> 두가지 스타일을 상황ㅇ에 맞춰 적절히 섞어 사용

### beforeEach()

- 각 테스트가 실행되기 전에 한번 씩 실행 -> 중복 코드가 많은 상황에서 유용하게 사용
- 스크롤 피로감이 생길 수 있다는 단점
- 팩토리 함수를 사용해서 스크롤 피로감을 없앨 수 있음
  > but, 테스트 코드에 한해서는 모든 로직을 공통화 해버리면 오히려 코드 결합도가 높아지고 유연성이 떨어지게 되므로 유의해야 한다.

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 실제 사내에서 사용중인 Jest를 사용이유부터 방법까지 알게되니 낯설었던 코드들이 이해가 가기 시작했다.
