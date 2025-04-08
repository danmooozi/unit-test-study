 <!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 4장. 모의 객체를 사용한 상호 작용 테스트

## Summary

목을 사용하여 작업 단위가 서드 파티 함수와 올바르게 상호 작용하는지 테스트할 수 있다.

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

### 상호 작용 테스트 정의

> 작업 단위가 제어할 수 없는 영역에 있는 의존성과 어떻게 상호 작용하고 메시지를 보내는지(함수를 호출하는지) 확인하는 방법. 모의 함수나 모의 객체를 사용하여 외부 의존성을 제대로 호출했는지 검증할 수 있음.

- 목(mock)
  - 외부로 나가는 의존성과 연결 고리를 끊는데 사용.
  - 가짜로 만든 모듈이나 객체 및 함수.
  - 단위 테스트에서 종료점을 나타냄
  - 유지 보수성과 가독성 때문에 보통 하나의 테스트에 목은 한 개만 사용하는 것이 일반적
- 스텁(stub)
  - 내부로 들어오는 의존성과 연결 고리를 끊는데 사용
  - 테스트 코드에 가짜 동작이나 데이터를 제공하는 가짜 모듈, 객체, 함수를 의미
  - 검증할 필요가 없고 하나의 테스트에 스텁을 여러 개 사용할 수 있음.
  - 데이터나 동작이 작업 단위로 들어오는 경유지를 나타내며 종료점은 나타내지 않음.

**로거 함수 예제**

```js
const log = require("./complicated-logger");

const verifyPassword2 = (input, rules, logger) => {
	const failed = rules
		.map(rule => rule(input))
		.filter(result => result === false);

	if (failed.count === 0) {
		logger.info("PASSED");
		return true;
	}
	logger.info("FAIL");
	return false;
};
```

- `verifyPassword` 함수가 작업 단위의 진입점
- 종료점 2개 - 하나는 값을 반환, 다른 하나는 log.info 함수 호출

### 목 주입 및 사용 방법

| 스타일      | 기법                                   |
| ----------- | -------------------------------------- |
| 표준        | 매개변수 추가                          |
| 함수형      | 커링 사용, 고차 함수로 반환            |
| 모듈형      | 모듈 의존성 추상화                     |
| 객체 지향형 | 타입이 없는 객체 주입, 인터페이스 주입 |

**1. 표준 - 매개변수 추가**

```js
describe('password verifier with logger', () => {
    describe('when all rules pass', () => {
        it('calls the logger with PASSED'. () => {
            let written = '';
            const mockLog = {
                info: (text) => {
                    written = text
                }
            }
            verifyPassword2('anything', [], mockLog);
            expect(written).toMatch(/PASSED/);
        })
    })
})
```

- 변수 이름을 mockLog로 지어 테스트에 모의 함수나 객체가 있다는 것을 알 수 있게 함
- `mockLog`는 로거 함수의 info 함수와 시그니처가 동일한 프로퍼티를 가짐. 매개변수로 전달받은 text를 written 변수에 저장하여 테스트 코드 내에서 객체의 info 함수가 호출되었는지 확인하는 용도로 사용.
  written에 올바른 텍스트가 저장되어 있으면 info 함수가 호출되었음을 의미. 작업 단위에서 종료점이 올바르게 호출되었음을 입증.

- 이점
  - 더 이상 테스트 코드에서 로거 함수를 명시적으로 불러올 필요가 없음 -> 나중에 실제 로거 함수의 의존성을 변경하더라도 테스트할 코드를 변경할 이유가 줄어든다는 의미
  - 테스트 코드에서 원하는 로거 함수를 어떤 방식으로든 만들어 주입할 수 있음

**일관된 이름 규칙을 고수하라**

- 가독성, 유지 보수성, 신뢰성에 장점

**목과 스텁을 구분하라**

- 이를 구분하지 않고 사용하면, 테스트마다 목을 여러 개 만들거나 스텁을 검증하는 상황이 발생할 수 있음.
- 복잡한 테스트를 만들 때 가독성과 유지 보수성이 떨어지는 테스트를 만들 수 있음.

**2. 모듈형**

모듈 의존성을 별도의 객체로 분리하여 `verifyPassword` 함수를 호출하기 전에 원하는 의존성을 외부에서 주입하도록 만들 수 있음

```js
// 기존 의존성을 담음
const originalDependencies = {
	log: require("./complicated-logger"),
};
// 의존성 중개 계층 코드에서 의존성을 직접 사용하는 대신 중간 계층을 이용하도록 함
let dependencies = { ...originalDependencies };

// 의존성을 초기화하는 함수
const resetDependencies = () => {
	dependencies = { ...originalDependencies };
};
// 가짜 의존성을 새로운 의존성으로 덮어쓰는 함수
const injectDependencies = fakes => {
	Object.assign(dependencies, fakes);
};

const verifyPassword = (input, rules) => {
	const failed = rules
		.map(rule => rule(input))
		.filter(result => result === false);

	if (failed.count === 0) {
		dependencies.log.info("PASSED");
		return true;
	}
	dependencies.log.info("FAIL");
	return false;
};

// 외부에서 의존성을 결정할 수 있도록 밖으로 내보내고 있음
module.exports = {
	verifyPassword,
	injectDependencies,
	resetDependencies,
};
```

테스트 코드

```js
const {
	verifyPassword,
	injectDependencies,
	resetDependencies,
} = require("./password-verifier-injectable");

describe('password verifier', () => {
    afterEach(resetDependencies);

    describe('given logger and passing scenario', () => {
        it('calls the logger with PASS'. () => {
            let logged = '';
            const mockLog = {
                info: (text) => {
                    logged = text
                }
            }
            injectDependencies({log: mockLog});

            verifyPassword('anything', []);

            expect(logged).toMatch(/PASSED/);
        })
    })
})
```

- 주의할 점
  - 테스트하고 싶은 모듈마다 의존성을 초기화하거나 주입할 수 있는 `resetDependencies`와 `injectDependencies` 함수를 외부로 노출하고 있어야 한다는 것
- 프로젝트가 모듈 의존성을 주입할 수 있도록 설계되어 있다면, 이 두 함수를 재사용 가능한 함수로 추상화하여 반복적인 코드를 줄일 수 있음

**3. 함수형**

1. 커링 스타일

   - lodash 의 \_.curry 사용

2. 고차 함수 사용
   > 커링과 부분 적용의 차이
   >
   > - 커링: 함수가 하나의 매개변수를 받아 여러 단계에 걸쳐 호출되는 방식. 예를 들어 f(a)(b)(c)처럼 인자를 하나씩 받는 여러 함수로 변환하는 것을 의미
   > - 부분 적용: 여러 매개변수를 받는 함수에서 일부 매개변수를 고정한 새로운 함수를 만드는 방식. 예를 들어 f(a, b, c)에서 a와 b를 고정한 새로운 함수 g(c)를 만드는 것을 의미
   >
   > ```js
   > const addNumbers = (a, b, c) => {
   > 	return a + b + c;
   > };
   > // 커링
   > const addNumbersInCurrying = a => b => c => {
   > 	return a + b + c;
   > };
   > //부분 적용
   > const addNumbersInPartialApplication = a => (b, c) => {
   > 	return a + b + c;
   > };
   > ```
   >
   > 두 개념 모두 고차 함수를 사용하여 함수를 만든다는 것.

**4. 객체 지향형**

클래스 기반 생성자 주입하기

```js
class PasswordVerifier {
	_rules;
	_logger;

	constructor(rules, logger) {
		this._rules = rules;
		this._logger = logger;
	}

	verify(input) {
		const failed = this._rules
			.map(rule => rule(input))
			.filter(result => result === false);

		if (failed.length === 0) {
			this._logger.info("PASSED");
			return true;
		}
		this._logger.info("FAIL");
		return false;
	}
}
```

테스트 코드

```js
describe("duck typing with function constructor injection", () => {
	describe("password verifier", () => {
		test("logger&passing scenario, calls logger with PASSED", () => {
			let logged = "";
			const mockLog = { info: text => (logged = text) };
			const verifier = new PasswordVerifier([], mockLog);
			verifier.verify("any input");

			expect(logged).toMatch(/PASSED/);
		});
	});
});
```

- `PasswordVerifier` 클래스를 생성할 때 생성자를 통해 규칙(rules)과 로거(logger)를 전달함. -> 객체를 생성할 때 반드시 필요한 의존성을 명확히 알 수 있음
- 생성자를 사용하면 의존성이 필수적이라는 것을 명확히 나타낼 수 있어 코드의 가독성과 유지 보수성을 높일 수 있음

**인터페이스 주입**

프로덕션 코드에 ILogger 인터페이스 적용하기

```ts
// 새로운 인터페이스로, 프로덕션 코드의 일부
export interface ILogger {
	info(text: string): void;
}

// SimpleLogger 클래스는 ILogger 인터페이스를 구현함
class SimpleLogger implements ILogger {
	info(text: string): void {
		// 로그 처리 로직
	}
}

export class PasswordVerifier {
	private _rule: any[];
	private _logger: ILogger;

	constructor(rules: any[], logger: ILogger) {
		this._rules = rules;
		this._logger = logger;
	}

	verify(input: string): boolean {
		const failed = this._rules
			.map(rule => rule(input))
			.filter(result => result === false);

		if (failed.length === 0) {
			this._logger.info("PASSED");
			return true;
		}
		this._logger.info("FAIL");
		return false;
	}
}
```

테스트 코드 - 수작업으로 작성한 가짜 ILogger 주입하기

```ts
class FakeLogger implements ILogger {
	written: string;
	info(text: string) {
		this.written = text;
	}
}

describe("password verifier with interfaces", () => {
	test("verify, with logger, calls logger", () => {
		const mockLog = new FakeLogger();
		const verifier = new PasswordVerifer([], mockLog);

		verifier.verify("anything");

		expect(mockLog.written).toMatch(/PASS/);
	});
});
```

- 객체 지향 방식에서도 동일한 패턴이 반복된다는 점을 보여 주기 위해 FakeLogger 클래스 작성함.

### 복잡한 인터페이스 처리 방법

복잡해진 인터페이스

```ts
export interface IComplicatedLogger {
	info(text: strin);
	debug(text: string, obj: any);
	warn(text: string);
	error(text: string, location: string, stacktrack: string);
}
```

`IComplicatedLogger` 인터페이스를 구현하는 가짜 로거 클래스

```ts
class FakeComplicatedLogger implements IComplicatedLogger {
	infoWritten = "";
	debugWritten = "";
	errorWritten = "";
	warnWritten = "";

	debug(text: string, obj: any) {
		this.debugWritten = text;
	}

	error(text: string, location: string, stacktrace: string) {
		this.errorWritten = text;
	}

	info(text: string) {
		this.infoWritten = text;
	}

	warn(text: string) {
		this.warnWritten = text;
	}
}
```

- 이 인터페이스를 구현하려면 info, debug, error, warn 메서드를 모두 오버라이드해야함
- 복잡한 인터페이스를 직접 사용할 때 단점
  - 인터페이스의 각 메서드를 호출할 때 전달받은 매개변수를 변수에 직접 저장해야 하므로 메서드마다 각 호출에 대한 매개변수를 검증하는 것이 더 번거로워짐.
  - 내부 인터페이스가 아닌 서드 파티 인터페이스에 의존할 때가 많아 시간이 지나면서 테스트가 더 불안정해질 수 있음
  - 내부 인터페이스에 의존하더라도 긴 인터페이스는 변경될 가능성이 높아 테스트를 변경해야 할 이유도 많아짐.
- 다음 두 조건을 모두 충족하는 가짜 인터페이스만 사용하길 강력히 추천
  - 온전한 제어권이 있는 인터페이스여야 함(즉, 서드 파티에서 제공하는 인터페이스가 아니어야 함)
  - 작업 단위나 컴포넌트의 요구 사항에 맞게 설계된 인터페이스여야 함
    - **인터페이스 분리 원칙** : 인터페이스에 필요한 것보다 더 많은 기능이 포함되어 있으면 필요한 기능만 포함된 더 작은 어댑터 인터페이스를 만들어야 한다는 것. 가능한 한 함수를 더 적게 만들고 이름을 더 명확하게 짓고 매개변수를 덜 사용하도록 하면 좋음.

### 부분 모의 객체

예제)

```js
describe("password verifier with interfaces", () => {
	test("verify, with logger, calls logger", () => {
		// RealLogger 클래스를 인스턴스화 (= 부분 모의 객체)
		const testableLog: RealLogger = new RealLogger();
		let logged = "";
		// 인스턴스의 기존 메서드 중 하나를 가짜 함수로 대체함
		testableLog.info = text => (logged = text);

		const verifer = new PasswordVerifier([], testableLog);
		verifer.verify("any input");

		expect(logged).toMath(/PASSED/);
	});
});
```

- `testableLog`의 메서드 중 일부가 실제 의존성과 로직을 포함한 함수임
- 객체 지향 스타일로도 부분 모의 객체를 표현할 수도 있음

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

### Test Double?

> 의존성이나 외부 시스템으로 인해 테스트를 진행하기 어려운 경우 이를 대신해 테스트를 진행할 수 있도록 만들어주는 가찌 객체.
>
> > 영화 촬영 시 위험한 역할을 대신하는 스턴트 더블에서 비롯됨

Test Double 5가지 종류

1. Dummy: 아무것도 하지 않는 깡통 객체
2. Fake: 단순한 형태로 동일한 기능은 수행하지만, 프로덕션에서 쓰기에는 부족한 객체
   ex) 프로덕션 코드에서 사용하는 repository 대신 Map을 사용하여 기능을 수행하는 등
3. Stub: 테스트에서 요청한 것에 대해 미리 준비한 결과를 제공하는 객체. 그 외에는 응답하지 않음
4. Spy: Stub이면서 호출된 내용을 기록하여 보여줄 수 있는 객체.
   개발자가 원하는 메서드의 행위를 지정하고 다른 메서드는 실제 객체처럼 동작하게 할 수 있음
5. Mock: 행위에 대한 기대를 명세하고, 그에 따라 동작하도록 만들어진 객체

- Mock 을 가장 많이 사용함.

### MSW(Mock Service Worker)를 사용하여 프론트 테스트 코드 생성하기

정확히는 프론트엔드에서 백엔드 모킹을 하는 것 같다. 백엔드 API 구현 여부에 의존하고 있는 문제를 해결해줄 수 있는 것 같음.
[참고](https://cheeseb.github.io/testing/react-testing-mocking/)

## Wrap-up

Mock을 활용한 상호 작용 테스트는 단위 테스트의 신뢰성과 정확성을 크게 향상시킬 수 있는 강력한 방법.
mock, stub, spy 등의 개념을 정확히 이해하고 상황에 맞는 스타일(표준/모듈형/함수형/객체지향형)을 선택함으로써 더 유지보수하기 쉬운, 안정적인 테스트 코드를 구성할 수 있음

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->
