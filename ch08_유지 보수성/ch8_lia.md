<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 8장 유지 보수성

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

테스트를 점검할 때 유지 보수성을 높이는 데 사용할 수 있는 방법을 알아본다.

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

유지 보수성이 좋지 않은 테스트를 위한 근본적인 원인을 파악하려면 다음 항목을 점검해 볼 필요가 있음

- 언제 테스트가 실패하여 변경이 필요하다는 사실을 깨닫는가?
- 왜 테스트가 실패하는가?
- 어떤 테스트가 실패했을 때 테스트 코드를 반드시 수정해야 하는가?
- 테스트 코드를 반드시 수정할 필요가 없더라도 언제 코드를 변경하는가?

이 장에서는 테스트를 점검할 때 유지 보수성을 높이는 데 사용할 수 있는 일련의 방법을 소개함

## 8.1 테스트 실패로 코드 변경

- 테스트 실패는 유지 보수성에 문제가 생길 수 있음을 알려 주는 첫 번째 신호임.
- 실제 버그로 발생한 실패: **실제 실패**
- 프로덕션 코드의 버그가 아닌 다른 이유로 발생하는 실패: **거짓 실패**
- 테스트의 유지 보수성을 측정하려면 일정 기간동안 발생하는 거짓 실패 횟수와 그 원인을 분석하는 것부터 시작할 수 있음

거짓 실패의 이유?

### 8.1.1 테스트가 관련이 없거나 다른 테스트와 충돌하는 경우

프로덕션 코드에 새로운 기능을 넣으면 기존 테스트와 충돌할 수 있음.

이 경우 테스트는 버그를 찾는 용도로만 사용하지 않고 새 기능이 추가된 코드의 신규 요구 사항을 제대로 반영했는지 확인하는 용도로도 사용할 수 있음.

또 코드가 변경되어 기대 결과 역시 달라졌을 수 있으니, 새로운 기능에 맞추어 작성된 테스트는 통과할 수 있지만 기존 테스트는 더 이상 유효하지 않을 수 있음

유효하지 않은 테스트는 삭제해도 됨. 삭제하는 규칙에는 예외가 있음. **기능 토글**을 사용하는 경우. 10장에서 살펴보기

### 8.1.2 프로덕션 코드의 API 변경

테스트 대상 코드가 변경되어 함수나 객체를 사용하는 방식이 달라지면, 비록 기능은 동일하더라도 테스트가 실패할 수 있음.

```tsx
// 예제 8-1) 생성자 매개젼수를 두 개 가진 PasswordVerifier 클래스
export class PasswordVerifier {
	...
	constructor(rules: ((input) => boolean)[], logger: ILogger) {
		this._rules = rules;
		this._logger = logger;
	}
	...
}
```

```tsx
// 예제 8-2) 팩토리 함수를 사용하지 않은 테스트
describe("password verifier 1", () => {
	it("passes with zero rules", () => {
		const verifier = new PasswordVerifier([], { info: jest.fn() }; // 코드의 기존 API를 사용하고 있음
		const result = verifier.verify("any input");
		expect(result).toBe(true);
	});

	it("fails with single failing rule", () => {
		const failingRule = (input) => false;
		const verifier = new PasswordVerifier([failingRule], { info: jest.fn() }); // 코드의 기존 API를 사용하고 있음
		const result = verifier.verify("any input");
		expect(result).toBe(false);
	});
});
```

→ 유지 보수성 관점에서 보면 머지 않아 여러 부분을 수정해야 할 수도 있는 문제점이 보임

코드 수명은 길다: 현재 작성 중인 코드는 최소 4-6년, 때로는 10년 이상 그 자리에 있을 수도 있음

앞으로 PasswordVerifer에 일어날 수 있는 몇 가지 변경점?

- PasswordVerifer 생성자에 매개변수가 추가되거나 삭제될 수 있음
- PasswordVerifier의 매개변수 중 하나가 다른 자료형으로 바뀔 수 있음
- ILogger의 함수 개수나 함수 시그니처가 시간이 지나면서 변경될 수 있음
- 사용 패턴이 바뀌어서 PasswordVerifier를 인스턴스화하지 않고 함수만 직접 사용할 수도 있음

어떻게 해야 이러한 수정 작업을 줄일 수 있을까?

- 팩토리 함수로 객체를 만드는 과정을 분리해야 한다

  - 테스트할 코드의 생성 과정을 분리하거나 추상화하는 것. 이렇게 하면 생성자의 변경 사항을 중앙에서만 처리하면 됨.
  - 객체를 생성하고 미리 설정하는 함수를 팩토리 함수, 팩토리 메서드라고 함.
  - 팩토리 함수는 이러한 문제를 해결하는 데 큰 도움이 됨.

  ```tsx
  //예제 8-4) 팩토리 함수로 리팩토링하기
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
  		const verifier = makePasswordVerifier([]); // 팩토리 함수를 사용하여 PasswordVerifier를 생성함
  		const result = verifier.verify("any input");
  		expect(result).toBe(true);
  	});
  });
  ```

  → 이렇게 하면 나중에 변경 사항이 발생하더라도 팩토리 함수만 수정하면 되므로 대부분의 테스트는 수정할 필요가 없어짐

### 8.1.3 다른 테스트가 변경되었을 경우

테스트는 항상 다른 테스트와 독립적으로 실행되어야 함

같은 기능을 검증하더라도 각 테스트는 서로 격리된 공간에서 실행되어야 함

> **계속해서 실패하는 테스트**
> ”가끔씩이라도 통과하는 게 어디야. 통과한다는 게 중요한 거지”.라며 어영부영 넘어가기 일쑤였다.
> 결과적으로는 테스트 자체의 버그와 여러 문제로 그동안 신경 쓰지 않았던 버그가 프로덕션 코드에도 많이 숨어 있다는 것을 알아냈다. ‘양치기 소년’이야기처럼 반복적으로 실패하는 테스트가 결국에는 중요한 문제를 드러내는 경우가 종종 있다.

가장 먼저 해볼 수 있는 것.

**순서가 정해진 테스트**

: 어떤 테스트가 이전 테스트의 실행 여부에 따라 결과가 달라지는 상황임.

→ 테스트가 다른 테스트 때문에 설정 값이 바뀌거나 공유 변수 같은 자원의 상태 값이 변경되는 것에 영향을 받기 때문

대부분의 테스트 러너가 테스트를 항상 특정 순서로 실행하지 않는다는 것을 잊지 말아야 함

## 8.2 유지 보수성을 높이는 리팩터링 방법

위는 테스트 실패 때문에 어쩔 수 없이 테스트를 변경해야하는 경우,

테스트가 실패하지 않더라도 시간이 지나도 테스트가 처음의 견고함을 유지하고 유지 보수성을 오래도록 보장할 수 있는 리팩터링 방법을 살펴본다

### 8.2.1 private 또는 protected 메서드 사용하지 않기

- private 또는 protected 메서드는 보통 특정한 이유로 메서드에 대한 접근을 제한하는 용도로 사용함. 이는 구현 세부 사항을 숨겨 나중에 구현이 변경되더라도 외부에서 보이는 동작은 바뀌지 않도록 하기 위함.
- private 메서드를 테스트하는 것은 시스템 내부의 약속이나 규칙을 테스트하는 것과 같음
  private 메서드를 테스트하면 private 메서드를 테스트하는 것은 내부적으로 어떤 동작을 발생시킬지 몰라 전체 모드의 동작을 테스트하는 것에 영향을 줄 수 있음.
- private 메서드는 홀로 존재하지 않음. 결국에는 누군가가 그것을 호출해야만 실행됨.
  즉, private 메서드는 항상 외부 인터페이스로 시작하는 더 큰 작업의 일부라는 것.
  그 작업은 반환 값, 상태 변경, 서드 파티 호출 중 하나로 끝남.
- private 메서드를 보면 시스템 내에서 이 메서드를 호출하는 public 메서드나 기능을 찾아야 함.
- 결국 중요한 점은 시스템의 외부 동작, 즉 public 메서드가 올바르게 작동하는지 확인하는 것. public 메서드를 간접적으로 테스트하는 것이 더 효과적임
- private 메서드를 테스트하겠다고 마음먹었다면, 해당 메서드를 public이나 static메서드로 바꾸거나 최소한 내부 메서드로 변경하는 것이 좋을 수 있음.
  이 메서드를 사용하는 코드를 public 메서드로 만들어 테스트하면 좀 더 형태가 깔끔해짐.

---

1. **메서드를 public으로 만들기**
   - 반드시 나쁜 것만은 아님.
2. **메서드를 새로운 클래스나 모듈로 분리하기**
   - 메서드에 독립적으로 동작할 수 있는 로직이 많이 포함되어 있거나, 해당 메서드와 관련된 특정 상태 값을 사용한다면 메서드를 시스템 내에서 특정 역할을 하는 새로운 클래스나 모듈로 분리하는 것이 좋음.
3. **스테이트리스한 private 메서드를 public이나 static 메서드로 만들기**

### 8.2.2 테스트에서도 DRY 원칙 고수

- 단위 테스트에서 중복은 프로덕션 코드에서 중복만큼이나 아니 그 이상으로 개발자에게 좋지 않은 영향을 줄 수 있음. 코드에 중복이 있으면 어떤 변경이 발생했을 때 모든 중복된 부분을 함께 수정해야 하기 때문.
- DRY(Don’t Repeat Yourself) 원칙은 프로덕션 코드뿐만 아니라 테스트 코드에도 적용되어야 함.
- 헬퍼 함수를 사용하면 테스트 중복 부분을 줄일 수 있음
- Warning) 모든 것은 과유불급. 중복을 제거하는 것이 지나치면 가독성을 해칠 수도 있음.
- DRY 원칙을 적용하면 코드 재사용성이 높아 동일한 로직을 여러 곳에서 수정해야 하는 번거로움을 줄일 수 있음

### 8.2.3 초기화 함수를 사용하지 않기

- `beforeEach()`
- 중복을 제거려는 목적으로 자주 사용
- 잘못 사용하는 방식
  - 파일 내 일부 테스트에서만 사용하는 객체를 초기화 함수에서 초기화함
  - 길고 이해하기 어려운 초기화 코드를 작성함
  - 초기화 함수 내에서 목이나 가짜 객체를 만듬
- 초기화 함수 사용 한계 (⇒ 헬퍼 함수로 해결할 수 있음)
  - 초기화 함수는 객체를 초기화할 때만 유용함
  - 초기화 함수를 사용하는 것만이 중복을 없애는 최선책을 아님. 중복 코드를 없앤다는 것은 단순히 객체를 생성하고 초기화하는 것뿐만아니라, 검증 단계의 로직을 간단하게 하거나 코드를 특정 방식으로 호출하는 것도 포함함
- 초기화 함수는 매개변수나 반환 값을 가질 수 없음
- 초기화 함수는 값을 반환하는 팩토리 메서드로 사용할 수 없음. 테스트 실행 전에 실행되어 특정 테스트의 필요에 맞게 세밀하게 조정할 수 없음. 모든 테스트에 동일한 초기화 작업을 적용해야 하므로 특정 상황에 맞춘 설정을 지원하지 못함. 하지만 테스트에서는 특정 값을 요청하거나 매개변수로 공용 코드를 호출해야 하는 경우가 있음.
- 초기화 함수에는 현재 테스트 클래스의 모든 테스트에 적용되는 코드만 포함해야 함. 그렇지 않으면 코드가 읽기 어렵고 이해하기 힘듬

### 8.2.4 매개변수화된 테스트로 중복 코드 제거

- 제스트에서는 `test.each()` 나 `it.each()` 함수 사용할 수 있음.
- 매개변수화 패턴은 원래 `beforeEach()` 블록에 있어야 할 설정 로직을 각 테스트의 준비 단계로 옮길 수 있음
- 검증 로직의 중복을 줄일 수 있음.

## 8.3 과잉 명세된 테스트

- 단순히 코드의 외부 동작을 확인하는 것이 아니라, 코드 내부가 어떻게 구현되어야 하는지까지 검증하는 테스트를 의미
- 단순히 관찰 가능한 동작(종료점)이 올바른지 확인하는 것을 넘어서 코드 내부의 구현 세부 사항까지 확인함.
- 단위 테스트가 과잉 명세되었다고 볼 수 있는 조건
  - 테스트가 객체의 내부 상태만 검증함
  - 테스트가 목을 여러 개 만들어 사용함
  - 테스트가 스텁을 목처럼 사용함
  - 테스트가 필요하지 않은데도 특정 실행 순서나 정확한 문자열 비교를 포함함

### 8.3.1 목을 사용한 내부 동작 과잉 명세

- 작업 단위의 종료점을 확인하는 대신 클래스나 모듈의 내부 함수가 호출되었는지만 검증하는 것.

```tsx
// 예제 8-11) protected 메서드를 호출하는 코드
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
		// 내부 메서드
		const failed = this._rules
			.map(rule => rule(input))
			.filter(result => result === false);
		return failed;
	}
}
```

```tsx
// 예제 8-12) 과잉 명세된 테스트: protected 메서드 호출 검증하기
describe("verifier 4", () => {
	describe("overspecify protected function call", () => {
		test("checkFailedRules is called", () => {
			const pv4 = new PasswordVerifier4(
				[],
				Substitute.for<IComplicatedLogger>()
			);

			const failedMock = jest.fn(() => []); // 내부 메서드를 모의 함수로 만듬
			pv4["findFailedRules"] = failedMock;

			pv4.verify("abc");

			expect(failedMock).toHaveBeenCalled(); // 내부 메서드가 호출되었는지 검증하고 있음. 이렇게 작성하면 안됨.
		});
	});
});
```

- 메서드가 값을 반환한다면 그 메서드를 모의 함수로 만들지 않는 편이 좋음. 메서드 호출 자체는 종료점을 나타내지 않기 때문.
- **그럼 어떻게 해야함?**
  우선 종료점부터 찾기. 실제 종료점은 수행하고자 하는 테스트 종류가 무엇이냐에 따라 달라질 수 있음
  - **값 기반 테스트**: 필자가 매우 추천하는 방식, 가능하면 값을 기반으로 테스트하기
    호출된 함수의 반환 값을 확인하는 방식.
    PasswordVerifier4 클래스의 verify() 메서드가 값을 반환하므로(pv4.verify(”abc”)) 값 기반 테스트에 적합함
  - **상태 기반 테스트**: 진입점 함수와 같은 레벨에 위치하는 형제 함수나 속성을 확인하는 것.
  - **서드 파티 테스트**: 서트 파티 테스트를 위해서는 목을 사용해야 하고, 코드 내부에서 파이어-앤-포겟(fire-and-forger) 위치를 찾아야 함.
    - 작업이나 명령을 실행한 후 결과를 기다리지 않고 바로 다름 작업을 수행하는 방식. 특히 비동기 작업에서 자주 사용됨.

### 8.3.2 결과와 순서를 지나치게 세밀하게 검증

- 한번에 모든 것을 검증하려고 하지 말고, 검증을 여러 작은 검증 구문으로 나누어 각각의 측면을 명확하게 확인하는 것이 좋음.

```tsx
// 예제 8-13) 여러 결과를 반환하는 verify()
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

```tsx
// 예제 8-14) 결과의 순서와 구조를 지나치게 세분화한 테스트
test("overspecify order and schema", () => {
	const pv5 = new PasswordVerifier5([input => input.includes("abc")]);

	const results = pv5.verify(["a", "ab", "abc", "abcd"]);

	// 한번에 너무 많은 것을 검증함
	expect(results).toEqual([
		{ input: "a", result: false },
		{ input: "ab", result: false },
		{ input: "abc", result: true },
		{ input: "abcd", result: true },
	]);
});
```

→ 변경될 수 있음. 왜?

- results 배열의 길이가 변경될 때
- 각 결과 객체에 속성이 추가되거나 삭제될 때
- 결과의 순서가 변경될 때

```tsx
// 예제 8-15) 결과 구조를 무시하고 순서만 확인하는 테스트
test("overspecify order but ignore schema", () => {
	const pv5 = new PasswordVerifier5([input => input.includes("abc")]);

	const results = pv5.verify(["a", "ab", "abc", "abcd"]);

	expect(results.length).toBe(4);
	expect(results[0].result).toBe(false);
	expect(results[1].result).toBe(false);
	expect(results[2].result).toBe(true);
	expect(results[3].result).toBe(true);
});

// 예제 8-16) 순서와 구조를 무시하는 테스트
test("ignore order and schema", () => {
	const pv5 = new PasswordVerifier5([input => input.includes("abc")]);

	const results = pv5.verify(["a", "ab", "abc", "abcd"]);

	expect(results.length).toBe(4);
	expect(pv5.findResultFor(results, "a")).toBe(false);
	expect(pv5.findResultFor(results, "ab")).toBe(false);
	expect(pv5.findResultFor(results, "abc")).toBe(true);
	expect(pv5.findResultFor(results, "abcd")).toBe(true);
});
```

- 또 다른 실수. 단위 테스트에서 반환 값이나 속성에 대해 하드코딩된 문자열을 사용하여 검증하는 것

```tsx
// 예제 8-17) 문자열 메시지를 반환하는 비밀번호 검증기
export class PasswordVerifier6 {
  private _rules: ((input: string) => boolean)[];
  **private _msg: string = '';**

  constructor(rules: ((input: string) => boolean)[]) {
    this._rules = rules;
  }

  **getMsg(): string {
    return this._msg;
  }**

  verify(inputs: string[]): IResult[] {
    const allResults = inputs.map((input) => this.checkSingleInput(input));
    **this.setDescription(allResults);**
    return allResults;
  }

  private setDescription(results: IResult[]) {
    const failed = results.filter((res) => !res.result);
    **this._msg = `you have ${failed.length} failed rules.`;**
  }
}
```

```tsx
// 예제 8-18) 문자열의 동등 비교를 이용한 과잉 명세 테스트
describe("verifier 6", () => {
	test("over specify string", () => {
		const pv5 = new PasswordVerifier6([input => input.includes("abc")]);

		pv5.verify(["a", "ab", "abc", "abcd"]);

		const msg = pv5.getMsg();
		expect(msg).toBe("you have 2 failed rules."); // 특정 문자열만 검사하고 있어 확장성이 떨어짐.
	});

	// 더 나은 테스트 작성 방법
	test("more future proof string checking", () => {
		const pv5 = new PasswordVerifier6([input => input.includes("abc")]);

		pv5.verify(["a", "ab", "abc", "abcd"]);

		const msg = pv5.getMsg();
		expect(msg).toMatch(/2 failed/); // 제스트의 .toMath() 함수를 사용하여 문자열을 검증하면 더 좋음.
	});
});
```

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

- 계속해서 실패하는 테스트에 대한 사례가 남일 같지 않았다.
- 리팩토링이 필요해 보이는 테스트 코드들이 존재한다.
  - 초기화 함수를 잘못 사용하고 있는 경우
  - 목을 사용한 내부 동작 과잉 명세
  - 결과와 순서를 지나치게 세밀하게 검증하는 경우

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

테스트가 실패하는 근본 원인을 알고 흔히 발생할 수 있는 테스트 코드 변경 사항을 알 수 있었다. 뿐만아니라 통과하는 테스트에 대해서도 유지 보수성 강화를 위한 방법을 익혔다.
