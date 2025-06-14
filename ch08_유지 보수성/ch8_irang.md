<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

유지 보수성이 좋은 테스트를 위한 방법들에 대해서 알아보는 챕터

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

### 테스트 실패로부터 테스트 유지보수성을 높이는 방법

테스트 실패는 유지 보수성에 문제가 생길 수 있음을 알려 주는 첫 번째 신호
테스트 실패에는 실제 실패와 거짓 실패가 있음

- 실제 실패: 실제 버그로 발생한 실패를 의미
- 거짓 실패: 프로덕션 코드의 버그가 아닌 다른 이유로 발생하는 실패를 의미

거짓 실패에는 테스트 코드 자체의 버그가 있을 수 있지만 다른 경우도 존재하는데 아래의 경우들이 있음.

`테스트가 관련이 없거나 다른 테스트와 충돌하는 경우`
새로운 기능이 추가되면 기존 테스트와 충돌할 수 있음.
이 경우에 새로운 요구사항이 맞는다고 가정하면 더이상 유효하지 않는 테스트 코드를 제거

`프로덕션 코드의 API 변경`

```js
// 예제 8-1)
export class PasswordVerifier {
	...
    // 규칙 배열, ILogger 인터페이스를 받는 클래스 생성자 함수
	constructor(rules: ((input) => boolean)[], logger: ILogger) {
		this._rules = rules;
		this._logger = logger;
	}
	...
}
```

```js
// 예제 8-2)
// 예제 8-1)를 바탕으로 만든 테스트
describe("password verifier 1", () => {
  it("passes with zero rules", () => {
    const verifier = new PasswordVerifier([], { info: jest.fn() }); // 코드의 기존 API를 사용
    const result = verifier.verify("any input");
    expect(result).toBe(true);
  });

  it("fails with single failing rule", () => {
    const failingRule = (input) => false;
    const verifier = new PasswordVerifier([failingRule], { info: jest.fn() }); // 코드의 기존 API를 사용
    const result = verifier.verify("any input");
    expect(result).toBe(false);
  });
});
```

문제점

유지보수성 관점에서 보면 머지 않아 여러 부분을 수정해야 할 수도 있는 문제점이 보임

어떻게 변경해야하는가?

여러가지 변경점이 있을 수 있는데 이러한 잦은 변경에도 유연한 테스트 코드를 작성하고자 한다면 `테스트할 코드의 생성 과정을 분리하거나 추상화해야 함`

팩토리 함수는 이러한 문제를 해결하는데 큰 도움이 되며 됨.

```js
describe("password verifier 1", () => {
  const makeFakeLogger = () => {
    return { info: jest.fn() }; // fakeLogger() 함수를 생성하는 공통 함수
  };

  const makePasswordVerifier = (
    rules: ((input) => boolean)[],
    fakeLogger: ILogger = makeFakeLogger() // PasswordVerifier의 인스턴스를 생성하는 공통 함수
  ) => {
    return new PasswordVerifier(rules, fakeLogger);
  };

  it("passes with zero rules", () => {
    const verifier = makePasswordVerifier([]); // 팩토리 함수를 사용하여 PasswordVerifier를 생성
    const result = verifier.verify("any input");
    expect(result).toBe(true);
  });
});
```

위 코드에서 PasswordVerifier를 생성하는 부분을 팩토리 함수로 만들었으며 이는 나중에 변경 사항이 발생하더라도 팩토리 함수만 수정하면 됨.

`다른 테스트가 변경되었을 경우`

테스트는 항상 다른 테스트와 독립적으로 실행되어야 하며 같은 기능을 검증하더라도 각 테스트는 서로 격리된 공간에서 실행되어야 함.

가장 먼저 확인해볼 수 있는 것은 순서가 정해진 테스트로 다음의 코드는 UserCache라는 단일 인스턴스를 공유하는 코드를 사용하는 코드를 테스트하는 코드로 순서를 보장받지 않으면 실패가 일어날 수 있는 테스트 코드임.

```js
describe("Test Dependence", () => {
  describe("loginUser with loggedInUser", () => {
    test("no user, login fails", () => {
      const app = new SpecialApp();
      const result = app.loginUser("a", "abc"); // 사용자 캐시가 비어있어야 함
      expect(result).toBe(false);
    });
  });

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

  test("user exists, login succeeds", () => {
    const app = new SpecialApp();
    const result = app.loginUser("a", "abc"); // 사용자 캐시가 있어야함.
    expect(result).toBe(true);
  });
});
```

다음의 코드는 독립적인 환경에서 테스트할 수 있도록 각 테스트가 실행되기 전 초기화 하는 함수, 추가하는 함수등 재사용 가능한 헬퍼함수를 만들어야함.

```js
const addDefaultUser = () =>
  getUserCache().addUser({
    key: "a",
    password: "abc",
  });

const makeSpecialApp = () => new SpecialApp(); // 팩토리 함수로 분리

describe("Test Dependence v2", () => {
  beforeEach(() => getUserCache().reset()); // 테스트 간에 유저 캐시를 리셋

  describe("user cache", () => {
    test("can only add cache use once", () => {
      addDefaultUser(); // 재사용 가능함 헬퍼 함수

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

### 테스트 실패가 아니더라도 테스트 유지보수성을 높이는 방법

`private / protected 메서드 사용하지 않기`

private 또는 protected 메서드는 보통 특정한 이유로 메서드에 대한 접근을 제한하는 용도로 사용함.
구현 세부 사항을 숨겨 나중에 구현이 변경되더라도 외부에서 보이는 동작은 바뀌지 않도록 하기 위함.

- private 를 테스트하는 것은 시스템 내부의 약속이나 규칙을 테스트하는 것과 마찬가지로 내부적으로 어떤 동작을 발생시킬지 몰라 전체 코드의 동작에 테스트하는 것에 영향을 줄 수 있음.

- 중요한 점은 시스템의 외부 동작, 즉 public 메서드가 올바르게 작동하는지 확인하는 것으로 public 메서드로 private 메서드를 간접적으로 테스트하는 것이 더 효과적임.

- 그럼에도 private 메서드를 테스트 하고자 한다면,
  - 해당 메서드가 스테이리스한 경우에는 public / static으로 변경
  - 해당 메서드에 독립적으로 동작할 수 있는 로직이 많이 포함되어 있거나, 해당 메서드와 관련된 특정 상태 값을 사용한다면 메서드를 시스템 내에서 특정 역할을 하는 새로운 클래스나 모듈로 분리하는 것이 좋음

`테스트에서도 DRY 원칙 고수`

반복적인 코드는 헬퍼 함수등을 통하여 DRY 원칙을 지킨다.
이는 곧 코드 재사용성이 높아져 동일한 로직을 여러 곳에서 수정해야 하는 번거로움을 줄일 수 있음

> [!Note]
> 그러나 DRY 원칙을 과도하게 적용하면 가독성이 나빠질 수 있어 군형을 유지하는 것이 중요

`초기화 함수 사용하지 않기`

대부분의 개발자가 아래와 같이 초기화 함수를 잘못 사용하는 경우도 존재하고 초기화 함수를 사용하는데에는 한계가 존재

- 파일 내 일부 테스트에서만 사용하는 객체를 초기화 함수에서 초기화함
- 길고 이해하기 어려운 초기화 코드를 작성함
- 초기화 함수 내에서 목이나 가짜 객체를 만듬

따라서 이를 대체할 수 있는 헬퍼함수를 사용

`매개변수화된 테스트로 중복 코드 제거`

모든 테스트가 비슷하게 작성되었다면 매게변수화된 테스트 코드를 작성

- 제스트에서는 test.each() 나 it.each() 함수 사용
- 매게변수화 패턴은 원래 beforeEach() 블록에 있어야 할 설정 로직을 arrange 단계로 옮길 수 있음.
- 매게변수화 패턴은 중복로직을 줄일 수 있음.

### 과잉 명세된 테스트

단순히 코드의 외부 동작을 확인하는 것이 아니라, 코드 내부가 어떻게 구현되어야 하는지까지 검증하는 테스트를 의미 함.

이는 결국 테스트가 지나치게 구체적이고 복잡해서 코드를 변경할 때 테스트를 자주 수정해야 하는 문제 가 생길 수 있음.

다음은 단위 테스트가 과잉 명제되었다고 볼 수 있는 조건

- 테스트가 객체의 내부 상태만 겸증
- 테스트가 목을 여러 개 만들어 사용
- 테스트가 스텝을 목처럼 사용
- 테스트가 필요하지 않은데도 특정 실행 순서나 정확한 문자열 비교를 포함

과잉 명세된 테스트 예시

`목을 사용한 내부 동작 과잉 명세`

```js
export class PasswordVerifier4 {
	private _rules: ((input: string) => boolean)[];
	private _logger: IComplicatedLogger;

	constructor(
		rules: ((input: string) => boolean)[],
		logger: IComplicatedLogger
	) {
		this._rules = rules;
		this._logger = logger;
	}

	verify(input: string): boolean {
		const failed = this.findFailedRules(input); // 내부 메서드 호출

		if (failed.length === 0) {
			this._logger.info("PASSED");
			return true;
		}
		this._logger.info("FAIL");
		return false;
	}

	protected findFailedRules(input: string) {
		const failed = this._rules
			.map(rule => rule(input))
			.filter(result => result === false);
		return failed;
	}
}
```

작업 단위의 종료점을 확인하는 대신 클래스나 모듈의 내부 함수가 호출되었는지만 검증하는 상황

```js
describe("verifier 4", () => {
  describe("overspecify protected function call", () => {
    test("checkFailedRules is called", () => {
      const pv4 = new PasswordVerifier4(
        [],
        Substitute.for<IComplicatedLogger>()
      );
      const failedMock = jest.fn(() => []);

      pv4["findFailedRules"] = failedMock;
      pv4.verify("abc");

      expect(failedMock).toHaveBeenCalled(); // 내부 메서드가 호출되었는지만 검증
    });
  });
});
```

종료점을 검증하지 않는 안티 패턴으로 종료점을 찾아 해당 종료점을 테스트 하는 방법으로 변경이 필요

> [!Note]
> 메서드가 값을 반할 한다면 그 메서드를 모의 함수로 만들지 않는 편이 좋으며 이는 메서드 호출 자체는 종료점을 나타내지 않기 때문

어떻게 종료점을 찾는가?

- 값 기반 테스트:
  가능하면 값을 기반으로 테스트하기 호출된 함수의 반환 값을 확인하는 방식.

- 상태 기반 테스트:
  진입점 함수와 같은 레벨에 위치하는 형제 함수나 속성을 확인하는 방식.

- 서드 파티 테스트:
  서트 파티 테스트를 위해서는 목을 사용해야 하고, 코드 내부에서 파이어-앤-포겟(fire-and-forger) 위치를 찾아야 함.
  작업이나 명령을 실행한 후 결과를 기다리지 않고 바로 다름 작업을 수행하는 방식. 특히 비동기 작업에서 자주 사용됨.

여기서는 PasswordVerifier4 클래스의 verify() 메서드가 값을 반환하므로(pv4.verify(”abc”)) 값 기반 테스트에 적합함.

`결과와 순서를 지나치게 세밀하게 검증`

```js
export class PasswordVerifier5 {
  private _rules: ((input: string) => boolean)[];

  constructor(rules: ((input: string) => boolean)[]) {
    this._rules = rules;
  }

  **verify(inputs: string[]): IResult[] {
    const failedResults = inputs.map((input) => this.checkSingleInput(input));
    return failedResults;
  }**

  findResultFor(results: IResult[], input: string): boolean {
    const result = results.find((res) => res.input === input);
    return result ? result.result : false;
  }

  private checkSingleInput(input: string): IResult {
    const failed = this.findFailedRules(input);
    return {
      input,
      result: failed.length === 0,
    };
  }

  protected findFailedRules(input: string) {
    const failed = this._rules
      .map((rule) => rule(input))
      .filter((result) => result === false);
    return failed;
  }
}
```

반환된 값의 순서와 구조를 지나치게 세분화하는 안티 패턴

```js
test("overspecify order and schema", () => {
  const pv5 = new PasswordVerifier5([(input) => input.includes("abc")]);

  const results = pv5.verify(["a", "ab", "abc", "abcd"]);

  // 한번에 너무 많은 것을 검증하고 있음.
  expect(results).toEqual([
    { input: "a", result: false },
    { input: "ab", result: false },
    { input: "abc", result: true },
    { input: "abcd", result: true },
  ]);
});
```

결과 값 전체를 사용하는 대신 각 결과의 특정 속성만 사용해서 검증하며 순서가 중요하지 않다면 결과 값에 특정 값이 포함되어 있는지만 확인

```js
test("ignore order and schema", () => {
  const pv5 = new PasswordVerifier5([(input) => input.includes("abc")]);

  const results = pv5.verify(["a", "ab", "abc", "abcd"]);

  expect(results.length).toBe(4);
  expect(pv5.findResultFor(results, "a")).toBe(false);
  expect(pv5.findResultFor(results, "ab")).toBe(false);
  expect(pv5.findResultFor(results, "abc")).toBe(true);
  expect(pv5.findResultFor(results, "abcd")).toBe(true);
});
```

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

- 유지보수성이 높은 테스트 코드를 작성할 수 있는 방법들에 대해서 알 수 있었음.
- 과한 DRY 적용은 좋지 않다는 것을 또 한번 느낄 수 있었음.

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

```js
test("기존 이름과 동일한 이름으로 변경 시도 시 검증 없이 성공", async () => {
  const result = await serContainer.validateContainerNameChange({
    dockerId,
    newName: oldName,
  });

  expect(result).toEqual({ region, oldName });
  expect(mockGetUserIdByDockerId.mock).not.toHaveBeenCalled();
  expect(mockIsExistsContainerName.mock).not.toHaveBeenCalled();
});
```

과잉 명세된 테스트의 예시라고 생각되는게
mockGetUserIdByDockerId.mock와 mockIsExistsContainerName.mock이 호출되지 않았는지 검증하는 것은 내부 구현 세부사항을 테스트하는 것이라고 생각 되었음.

내부 구현이 변경되면 테스트가 실패가 실패할 가능성 존재
아래의 상황이 적절한지 모르겠으나 내부 구현이 변경되면 결과는 동일하더라도 테스트는 실패

```js
async function validateContainerNameChange({ dockerId, newName }) {
  const { region, name: oldName } = await getDockerRegionAndName(dockerId);

  // 기존 이름과 동일한 경우
  if (newName === oldName) {
    // 사용자 권한 체크를 위해 호출
    const userId = await getUserIdByDockerId(dockerId);
    const hasPermission = await checkUserPermission(
      userId,
      "CONTAINER_NAME_CHANGE"
    );

    if (!hasPermission) {
      throw new CustomError("권한이 없습니다.");
    }

    return { region, oldName };
  }

  // ... 나머지 로직
}
```

다음과 같이 코드를 변경

```js
test("기존 이름과 동일한 이름으로 변경 시도 시 검증 없이 성공", async () => {
  const result = await serContainer.validateContainerNameChange({
    dockerId,
    newName: oldName,
  });

  expect(result).toEqual({ region, oldName });
});
```

- 내부 구현 세부사항(mock 호출 여부)에 대한 검증을 제거
- 결과값만 검증

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->
