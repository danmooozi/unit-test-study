<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

테스트 코드를 작성할 때, 유지 보수성을 높이는데 사용할 수 있는 일련의 방법들을 알아보자.

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

### 테스트 실패로 인한 코드 변경을 통해 유지보수성 높이기

> [!Note] 실제 실패 vs 거짓 실패
>
> - 실제 실패: 실제 프로덕션 코드의 버그로 인해 발생한 실패(=프로덕션 코드 문제)
> - 거짓 실패: 프로덕션 코드의 버그가 아닌 다른 이유로 발생하는 실패(=테스크 코드 문제)

#### 1. 테스트가 관련이 없거나 다른 테스트와 충돌하는 경우

- 기존 기능 or 요구사항에 맞추어 작성했던 테스트 코드(더이상 유효하지 않은)
- -> 기존 테스트를 삭제한다.

#### 2. 프로덕션 코드의 API 변경

```ts

export class PasswordVerifier {
  ...
  constructor(rules: ((input) => boolean)[], logger: ILogger) {
    this._rules = rules;
    this._logger = logger;
  }
  ...
}
```

테스트 대상코드의(ex. 생성자 등)

- 매개변수 추가/삭제
- 매개변수의 자료형 변경
- 함수 개수/시그니처 변경

```ts
describe("password verifier 1", () => {
  it("passes with zero rules", () => {
    const verifier = new PasswordVerifier([], { info: jest.fn() }); // 기존 API 사용
    const result = verifier.verify("any input");
    expect(result).toBe(true);
  });

  it("fails with single failing rule", () => {
    const failingRule = (input) => false;
    const verifier = new PasswordVerifier([failingRule], { info: jest.fn() }); // 기존 API 사용
    const result = verifier.verify("any input");
    expect(result).toBe(false);
  });
});
```

=> `PasswordVerifier`의 인스턴스를 만드는 모든 테스트를 수정해야한다. <br/>
=> 테스트할 코드의 생성 과정을 **팩토리 함수**를 이용하여 분리 + 추상화

```ts
describe("password verifier 1", () => {
  const makeFakeLogger = () => {
    return { info: jest.fn() };
  };

  const makePasswordVerifier = (
    rules: ((input) => boolean)[],
    fakeLogger: ILogger = makeFakeLogger()
  ) => {
    return new PasswordVerifier(rules, fakeLogger);
  };

  it("passes with zero rules", () => {
    const verifier = makePasswordVerifier([]);
    const result = verifier.verify("any input");
    expect(result).toBe(true);
  });
});
```

프로덕션 코드내 생성자 시그니처가 `ILogger` 대신 `IComplicatedLogger`로 변경되었을때(매개변수의 자료형 변경) 팩토리 함수의 변경을 통해 리팩토링이 가능하다.

```ts
import Substitute from "@fluffy-spoon/substitute";

const makeFakeLogger = () => {
  return Substitute.for<IComplicatedLogger>();
};

const makePasswordVerifier = (
  rules: ((input) => boolean)[],
  fakeLogger: IComplicatedLogger = makeFakeLogger()
) => {
  return new PasswordVerifier2(rules, fakeLogger);
};
```

> cf) **Substitute**:
> NSubstitute(모킹 라이브러리)의 TypeScript 테스트 더블(mock/stub) 생성 라이브러리

#### 3. 다른 테스트가 변경되었을 경우(순서가 정해진 테스트)

- 단위 테스트는 독립적으로 실행되어야 한다.
- 테스트 간에 어떠한 테스트가 선행되어야 하는 테스트가 있다면, 다음과 같이 리팩터링을 진행한다.
  - 객체를 생성하는 **헬퍼 함수**를 만든다.
  - `beforeEach()` 등으로 테스트마다 필요한 객체를 생성한다.

```ts
import { getUserCache } from "./sharedUserCache";
import { SpecialApp } from "./specialApp";

describe("Test Dependence", () => {
  // 테스트 1
  describe("loginUser with loggedInUser", () => {
    test("no user, login fails", () => {
      const app = new SpecialApp();
      const result = app.loginUser("a", "abc"); // 사용자 캐시가 비어있어야 함 -> 테스트 2가 실행되지 않아야 함(=테스트 2에 의존)
      expect(result).toBe(false);
    });
  });

  // 테스트 2
  test("can only cache each user once", () => {
    getUserCache().addUser({
      key: "a",
      password: "abc",
    });

    expect(() =>
      getUserCache().addUser({
        key: "a",
        password: "abc",
      })
    ).toThrowError("already exists");
  });

  // 테스트 3
  test("user exists, login succeeds", () => {
    const app = new SpecialApp();
    const result = app.loginUser("a", "abc"); // 캐시에 유저정보가 있어야함 -> 테스트 2가 먼저 실행되어야 함(=테스트 2에 의존)
    expect(result).toBe(true);
  });
});
```

==> 위의 방법에 따라 리팩토링을 진행한다.

```ts
const addDefaultUser = () =>
  // 유저를 생성하는 헬퍼 함수를 분리
  getUserCache().addUser({
    key: "a",
    password: "abc",
  });

const makeSpecialApp = () => new SpecialApp(); // 팩토리 함수로 분리

describe("Test Dependence v2", () => {
  beforeEach(() => getUserCache().reset()); // 테스트 간에 유저 캐시를 리셋

  describe("user cache", () => {
    test("can only add cache use once", () => {
      addDefaultUser();

      expect(() => addDefaultUser()).toThrowError("already exists");
    });
  });

  describe("loginUser with loggedInUser", () => {
    test("user exists, login succeeds", () => {
      addDefaultUser();
      const app = makeSpecialApp();

      const result = app.loginUser("a", "abc");
      expect(result).toBe(true);
    });

    test("user missing, login fails", () => {
      const app = makeSpecialApp();

      const result = app.loginUser("a", "abc");
      expect(result).toBe(false);
    });
  });
});
```

### 테스트가 실패하지 않더라도 리팩토링을 통해 유지 보수성을 높이기

#### 1. private / protected 메서드 사용하지 않기

- private / protected 는 애초에 접근을 제한할 용도로 사용한다.
  - 구현 세부 사항을 숨겨 추후 구현이 변경되더라도 외부에서 보이는 동작은 바뀌지 않도록 하기 위함.
  - 즉, private 메서드를 테스트 하는 것은 시스템 내부의 약속이나 규칙을 테스트하는 것과 같다.
- private 메서드는 시스템 내에서 이 메서드를 호출하는 public 메서드(=더 큰 작업의 일부)가 존재한다.
- 따라서, private 메소드를 사용하는 public 메소드에서 간접적으로 테스트 하는 것이 더 효율적이다.
- private 메소드를 직접 테스트하고싶다면, 해당 메서드는 public / static 으로 변경하는 것이 좋다.

#### 2. 테스트에서도 DRY 원칙 고수

> **D**on't **R**epeat **Y**ourself

- 헬퍼 함수 등을 통하여 DRY 원칙을 지킨다.

#### 3. 초기화 함수를 사용하지 않기

- `beforeEach()` 함수를 사용하여 초기화를 하는 것은, 세밀한 조정이 들어가기 힘듦으로 테스트마다 헬퍼 함수 등을 사용하여 객체를 생성하자.
- 초기화 함수에는 현재 테스트 클래스의 모든 테스트 케이스에 적용되는 코드만 포함한다.

> 잘못된 초기화 함수 사용 예시
>
> - 파일 내 일부 테스트에서만 사용하는 객체를 초기화 함수에서 초기화한다.
> - 길고 이해하기 어려운 초기화 코드를 작성한다.
> - 초기화 함수 내에서 목이나 가짜 객체를 만든다.

#### 4. 매개변수화된 테스트로 중복 코드 제거

- 테스트 케이스마다 input 데이터를 달리하고 싶으면, 각자 다른 테스트 케이스를 작성하는 것 보다 매개변수화된 테스트를 진행한다.
- 매개변수화 패턴은 `beforeEach()` 블록에 있어야 할 설정 로직을 각 테스트의 arrange 단계로 옮길 수 있음.

#### 과잉 명세된 테스트

> 과잉 명세 예시
>
> - 테스트가 객체의 내부 상태만 검증한다.
> - 테스트가 목을 여러 개 만들어 사용한다.
> - 테스트가 스텁을 목처럼 사용한다.
> - 테스트가 필요하지 않아도 특정 실행 순서나 문자열 비교를 포함한다.

#### 1. 목을 사용한 내부 동작 과잉 명세

내부 동작이 실행되었는지에 대한 테스트보다, **종료점(함수 값 리턴, 객체 상태 변경, 서드 파티 호출)에 대한 테스트를 진행**해야 한다.

```ts
export class PasswordVerifier4 {
  ...
  constructor(
    rules: ((input: string) => boolean)[],
    logger: IComplicatedLogger
  ) {
    this._rules = rules;
    this._logger = logger;
  }
  ...
  protected findFailedRules(input: string) { // 내부 메서드
    const failed = this._rules
      .map((rule) => rule(input))
      .filter((result) => result === false);
    return failed;
  }
}
```

```ts
describe("verifier 4", () => {
  describe("overspecify protected function call", () => {
    test("checkFailedRules is called", () => {
      const pv4 = new PasswordVerifier4(
        [],
        Substitute.for<IComplicatedLogger>()
      );

      const failedMock = jest.fn(() => []); // 내부 메서드를 모의 함수로 만든다.
      pv4["findFailedRules"] = failedMock;

      pv4.verify("abc");

      expect(failedMock).toHaveBeenCalled(); // 내부 메서드가 호출되었는지 검증 -> **과잉 명세**
    });
  });
});
```

#### 2. 결과와 순서를 지나치게 세밀하게 검증

테스트 결과가 배열과 같은 구조일 경우, 특정 인덱스를 직접 사용해 값을 검증하는 방식은 다음과 같은 상황에서 문제가 될 수 있다.

- 배열의 길이가 변경될 때
- 각 결과 객체의 속성이 추가/삭제될 때
- 결과의 순서가 변경될 때

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

잘못된 초기화 함수 사용 예시 중에서 '초기화 함수 내에서 목이나 가짜 객체를 만든다' 케이스를 보고, site 코드 중 `beforeEach()` 내에서 모킹된 코드를 본적이 있던거 같아서 찾아보았다.

https://github.com/goorm-dev/ide-site/blob/develop/src/server/service/__tests__/container.test.js

```js
describe("exceedContainerCountLimit", () => {
  const containerLimit = 1;

  // beforeEach() 내에서 새로운 mock을 만들고 있음.
  beforeEach(() => {
    Mocker.create()
      .makeSpy({
        module: serContainer,
        funcName: "getContainerLimit",
      })
      .mockResolvedValue(containerLimit);
  });

  test("containerCount가 정수가 아니면 throw TypeError", async () => {
    await expect(serContainer.exceedContainerCountLimit("st")).rejects.toThrow(
      TypeError
    );
  });

  test("containerCount가 컨테이너 갯수 제한보다 작으면 false 반환하는 지 확인", async () => {
    const isExceed = await serContainer.exceedContainerCountLimit(0);
    expect(isExceed).toEqual(false);
  });
});
```

잘못된 부분을 리팩토링 해보자.

#### 1. 외부에서 모킹하고 내부에서는 초기화만 진행

```js
describe("exceedContainerCountLimit", () => {
  const mockGetContainerLimit = Mocker.create(); // 초기화 함수 외부에서 mock 생성
  const containerLimit = 1;

  // 기존 mock을 초기화
  beforeEach(() => {
    mockGetContainerLimit
      .makeSpy({
        module: serContainer,
        funcName: "getContainerLimit",
      })
      .mockResolvedValue(containerLimit);
  });

  test("containerCount가 정수가 아니면 throw TypeError", async () => {
    await expect(serContainer.exceedContainerCountLimit("st")).rejects.toThrow(
      TypeError
    );
  });

  test("containerCount가 컨테이너 갯수 제한보다 작으면 false 반환", async () => {
    const isExceed = await serContainer.exceedContainerCountLimit(0);
    expect(isExceed).toEqual(false);
    expect(mockGetContainerLimit.mock).toHaveBeenCalled();
  });
});
```

#### 2. 8.13 절의 예제 8-9 와 같이 헬퍼 함수를 사용하도록 리팩토링

```js
// 목 생성 및 초기화를 담당하는 헬퍼 함수
const setupGetContainerLimitMock = (containerLimit) => {
  const mock = Mocker.create();
  mock
    .makeSpy({
      module: serContainer,
      funcName: "getContainerLimit",
    })
    .mockResolvedValue(containerLimit);
  return mock;
};

describe("exceedContainerCountLimit", () => {
  const containerLimit = 1;
  let mockGetContainerLimit;

  beforeEach(() => {
    // 헬퍼 함수 사용
    mockGetContainerLimit = setupGetContainerLimitMock(containerLimit);
  });

  test("containerCount가 정수가 아니면 throw TypeError", async () => {
    await expect(serContainer.exceedContainerCountLimit("st")).rejects.toThrow(
      TypeError
    );
  });

  test("containerCount가 컨테이너 갯수 제한보다 작으면 false 반환하는 지 확인", async () => {
    const isExceed = await serContainer.exceedContainerCountLimit(0);
    expect(isExceed).toEqual(false);
  });
});
```

=> beforeEach에서는 새 mock을 **생성**하는 것이 아닌,<br/>
=> 헬퍼 함수를 호출해 초기화 및 설정한 mock 인스턴스를 **할당**한다.

대부분의 site 코드에서는 1번 방식을 사용하고 있지만, 테스트 격리가 중요한 경우에는 2번 방식을 활용해봐도 좋을 것 같다.

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 유지 보수성을 신경 쓰지 않으면 추후 테스트를 변경하는데 많은 시간이 들어 변경 가치를 잃게 된다.
- 실제 실패는 프로덕션 코드에서 버그가 발견되는 경우고, 거짓 실패는 다른 이유로 테스트가 실패하는 경우다.
- 유지 보수성을 측정하려면 거짓 실패의 횟수와 각 실패의 원인을 분석하면 된다.
- 테스트가 실패하지 않더라도 리팩토링을 통해 유지보수성을 높이자.
- 과잉명세를 조심하자.

```

```
