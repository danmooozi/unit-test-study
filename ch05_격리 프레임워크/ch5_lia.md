<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

격리 프레임워크에 대해서 공부하고, 각 프레임워크를 모듈형, 함수형, 객체 지향형으로 어떻게 사용할 수 있는지 알려주는 챕터이다.

## Concept

> 격리 프레임워크란?
> 런타임에 가짜 객체를 생성하고 설정할 수 있는 재사용 가능한 라이브러리를 의미.
> 이러한 객체는 동적 스텁과 동적 목이라 함.

## 5.1 격리 프레임워크 정의

> 격리 프레임워크는 객체나 함수 형태의 목이나 스텁을 동적으로 생성, 구성, 검증할 수 있게 해주는 프로그래밍 가능한 API다. 격리 프레임워크를 사용하면 이러한 작업을 수작업으로 했을 때보다 더 간단하고 빠르며 코드도 더 짧게 작성할 수 있다.

- 격리 프레임워크는 적절하게 사용하면 객체의 상호 작용을 검증하거나 테스트를 하려고 반복적으로 코드를 작성하는 일을 줄여 주고, 테스트 지속성을 높여 오랜 시간 개발자가 프로덕션 코드가 변경될 때마다 테스트를 수정하지 않게 함.
- but, 잘못 적용하면 프레임워크를 남용하게 되어 테스트를 읽을 수도 없고 신뢰할 수도 없는 상황에 이를 수 있으니 주의해야함.

### 5.1.1 선택하기: 느슨한 타입 대 정적 타입

- **느슨한 타입의 자바스크립트 격리 프레임워크**: 이 유형은 순수 자바스크립트 친화적인 느슨한 타입의 격리 프레임워크임. 일반적으로 작업을 수행할 때 설정과 보일러 플레이트 코드가 더 적게 필요하기 때문에 함수형 스타일 코드에 적합함.
- **정적 타입의 자바스크립트 격리 프레임워크**: 더 객체 지향적이고 타입스크립트 친화적인 격리 프레임워크임(substitue.js 등). 전체 클래스와 인터페이스를 다룰 때 매우 유용.

어떤 종류의 의존성을 가짜로 만들어야 하는가?

- **모듈 의존성(import, require)**: 제스트 같은 느슨한 타입의 프레임워크가 좋음.
- **함수형 의존성(단일 함수와 고차함수, 간단한 매개변수와 값)**: 모듈 의존성과 마찬가지로, 제스트 같은 느슨한 타입의 프레임워크가 잘 어울림
- **객체 전체, 객체 계층 구조, 인터페이스**: substitute.js 같은 객체 지향적인 프레임워크가 어울림.

## 5.2 동적으로 가짜 모듈 만들기

제스트를 사용한 예제

- 로거 모듈에 강하게 의존하는 비밀번호 검증기 코드

  ```tsx
  // 예제 5-1) 모듈 의존성을 하드코딩하기
  const { info, debug } = require("./complicated-logger");
  const { getLogLevel } = require("./configuration-service");

  const log = text => {
  	if (getLogLevel() === "info") {
  		info(text);
  	}
  	if (getLogLevel() === "debug") {
  		debug(text);
  	}
  };

  const verifyPassword = (input, rules) => {
  	const failed = rules
  		.map(rule => rule(input))
  		.filter(result => result === false);

  	if (failed.length === 0) {
  		log("PASSED");
  		return true;
  	}
  	log("FAIL");
  	return false;
  };

  module.exports = {
  	verifyPassword,
  };
  ```

  - 구성 서비스의 `getLogLevel()` 함수에서 반환하는 값을 스텁으로 사용하여 가짜로 만들어야 함
  - Logger 모듈의 `info()` 함수가 호출되었는지 모의 함수를 사용하여 검증해야 함

- 제스트는 목을 만들고 검증할 수 있는 몇 가지 방법을 제시, 그중 하나는 테스트 파일의 가장 위쪽에 `jest.mock([모듈 이름])` 과 같은 식으로 목을 만들 대상을 지정하는 것,
  그 다음 테스트에서 가짜 모듈을 불러와(require) 원하는 방식으로 재구성할 수 있음.

  ````tsx
  // 예제 5-2) jest.mock()으로 직접 모듈 API를 가짜로 만들기
  // 모듈을 가짜로 만듬
  jest.mock('./complicated-logger');
  jest.mock('./configuration-service');

      const { stringMatching } = expect;
      const { verifyPassword } = require('./password-verifier');
      // jest.mock() 함수로 만든 가짜 모듈 인스턴스를 불러옴.
      const mockLoggerModule = require('./complicated-logger');
      const stubConfigModule = require('./configuration-service');

      describe('password verifier', () => {
      	// 각 테스트가 끝날 때마다 제스트로 만든 모든 가짜 객체를 초기화함
        afterEach(jest.resetAllMocks);

        test(`with info log level and no rules,
                it calls the logger with PASSED`, () => {
          // 가짜 모듈의 getLogLevel() 함수의 반환 값이 'info'를 반환하도록 함
          stubConfigModule.getLogLevel.mockReturnValue('info');

          verifyPassword('anything', []);

      		// 가짜 모듈의 모의 함수가 호출되었는지 검증
          expect(mockLoggerModule.info).toHaveBeenCalledWith(stringMatching(/PASS/));
        });

        test(`with debug log level and no rules,
                it calls the logger with PASSED`, () => {
          // 이 테스트 내에서 함수의 반환 값이 'debug'가 되도록 설정
          stubConfigModule.getLogLevel.mockReturnValue('debug');

          verifyPassword('anything', []);

      		// 가짜 모듈의 모의 함수가 호출되었는지 검증
          expect(mockLoggerModule.debug).toHaveBeenCalledWith(stringMatching(/PASS/));
        });
      });

      ```

      ### 5.2.1 제스트 API에 대해 알아 둘 점

      - 자바스크립트의 ‘호이스팅’ 특성 때문에 모듈을 가짜로 만드는 코드(jest.mock 사용)는 파일 가장 위쪽에 위치해야 함.
      - 제스트 공식 문서 확인

      ### 5.2.2 직접 의존성의 추상화 고민

      - jest.mock의 단점은 제어권이 있는 코드까지 모두 가짜로 만들어 버린다는 것. 이렇게 하면 실제 의존성을 더 간단한 내부 API로 추상화하여 숨기는 방식의 이점을 놓칠 수 있음. 이러한 접근 방식은 포트와 어댑터 아키텍처라고 하며, 코드의 유지 보수성이 뛰어나다는 장점이 있음.
      - 직접 의존성이 문제가 되는 이유?
          - 이러한 API를 직접 사용하면 추상화된 API가 아닌 모듈 API를 테스트에서 직접 가짜로 만들어야 함. 이렇게 하면 모듈의 원래 API 설계가 테스트 구현에 밀접하게 결합되어 API가 변경될 때마다 수많은 테스트를 함께 변경해야 함.
  ````

## 5.3 함수형 스타일의 동적 목과 스텁

간단한 함수를 가짜로 만드는 방법

```tsx
test("given logger and passing scenario", () => {
	let logged = ""; // 전달된 값을 저장할 변수를 선언
	const mockLog = { info: text => (logged = text) }; // 전달된 값을 해당 변수에 저장
	const passVerify = makeVerifier([], mockLog);

	passVerify("any input");

	expect(logged).toMatch(/PASSED/); // 변수 값을 검증
});

// 격리 프레임워크인 제스트 사용
test("given logger and passing scenario", () => {
	const mockLog = { info: jset.fn() };
	const verify = makeVerifier([], mockLog);

	verify("any input");

	expect(mockLog.info).toHaveBeenCalledWith(expect.stringMatchin(/PASS/));
});
```

- `jest.fn()` 을 사용하여 모의 함수를 만들면 실제로는 시간 절약을 많이 할 수 있음
- 특정 함수의 호출을 추적하거나 검증할 때 매우 유용하게 사용할 수 있음.

⇒ `jest.fn()` 은 단일 함수 기반의 목과 스텁에 잘 맞음.

## 5.4 객체 지향 스타일의 동적 목과 스텁

### 5.4.1 느슨한 타입의 프레임워크 사용

복잡한 인터페이스 예시 사용

```tsx
// 예제 5-6) 스텁을 직접 만드는 경우 보일러 플레이트 코드가 길어지는 예
import { PasswordVerifier } from "./00-password-verifier";
import { IComplicatedLogger } from "./interfaces/complicated-logger";

describe("working with long interfaces", () => {
	describe("password verifier", () => {
		class FakeLogger implements IComplicatedLogger {
			debugText = "";
			debugMethod = "";
			errorText = "";
			errorMethod = "";
			infoText = "";
			infoMethod = "";
			warnText = "";
			warnMethod = "";

			debug(text: string, method: string) {
				this.debugText = text;
				this.debugMethod = method;
			}

			error(text: string, method: string) {
				this.errorText = text;
				this.errorMethod = method;
			}

			info(text: string, method: string) {
				this.infoText = text;
				this.infoMethod = method;
			}

			warn(text: string, method: string) {
				this.warnText = text;
				this.warnMethod = method;
			}
		}

		test("verify, w logger & passing, calls logger with PASS", () => {
			const mockLog = new FakeLogger();
			const verifier = new PasswordVerifier([], mockLog);

			verifier.verify("anything");

			expect(mockLog.infoText).toMatch(/PASSED/);
		});
	});
});
```

격리 프레임워크 사용하여 간단하고 가독성 좋게 만들기

```tsx
// 예제 5-7) jest.fn() 함수로 인터페이스를 모의 함수로 구현하기
import { IComplicatedLogger } from "./interfaces/complicated-logger";
import { PasswordVerifier } from "./00-password-verifier";

describe("working with long interfaces", () => {
	describe("password verifier", () => {
		test("verify, w logger & passing, calls logger with PASS", () => {
			const mockLog: IComplicatedLogger = {
				info: jest.fn(),
				warn: jest.fn(),
				debug: jest.fn(),
				error: jest.fn(),
			};

			const verifier = new PasswordVerifier([], mockLog);
			verifier.verify("anything");

			expect(mockLog.info).toHaveBeenCalledWith(
				expect.stringMatching(/PASSED/),
				expect.stringMatching(/verify/)
			);
		});
	});
});
```

주의사항

- 인터페이스가 변경되어 함수가 추가되면 모의 객체를 정의하는 코드를 수정하여 해당 함수를 추가해야 함.
- 테스트 중인 코드가 정의되지 않은 함수를 사용하면 상황이 복잡해질 수 있음.

### 5.4.2 타입스크립트에 적합한 프레임워크로 전환

정적 타입 격리 프레임워크에 해당하는 프레임워크인 substitute.js를 사용

```tsx
// 예제 5-8) substitute.js를 사용하여 가짜 인터페이스 만들기
import { IComplicatedLogger } from "./interfaces/complicated-logger";
import { PasswordVerifier } from "./00-password-verifier";
import { Substitute, Arg } from "@fluffy-spoon/substitute";

describe("working with long interfaces", () => {
	describe("password verifier", () => {
		test("verify, with logger and passing, calls logger with PASS", () => {
			const mockLog = Substitute.for<IComplicatedLogger>(); // 모의 객체 생성

			const verifier = new PasswordVerifier([], mockLog);
			verifier.verify("anything");

			mockLog.received().info(
				// 모의 객체의 호출 여부를 검증
				Arg.is(x => x.includes("PASSED")),
				"verify"
			);
		});
	});
});
```

여기까지 목

다음 스텁

## 5.5 동적 스텁 설정

제스트는 모듈과 함수 의존성의 반환 값을 조작하는 함수로 `mockReturnValue()` 와 `mockReturnValueOnce()` 를 제공함.

```tsx
// 예제5-9) jest.fn()을 사용하여 모의 함수의 반환 값 조작하기
test("fake same return values", () => {
	const stubFunc = jest.fn().mockReturnValue("abc");

	// 값이 동일하게 유지됨
	expect(stubFunc()).toBe("abc");
	expect(stubFunc()).toBe("abc");
	expect(stubFunc()).toBe("abc");
});

test("fake multiple return values", () => {
	const stubFunc = jest
		.fn()
		.mockReturnValueOnce("a")
		.mockReturnValueOnce("b")
		.mockReturnValueOnce("c");

	// 값이 동일하게 유지됨
	expect(stubFunc()).toBe("a");
	expect(stubFunc()).toBe("b");
	expect(stubFunc()).toBe("c");
	expect(stubFunc()).toBe(undefined);
});
```

- 첫번째 테스트 - `mockReturnValue()` 함수를 사용하여 테스트 기간 동안 언제나 동일한 값을 반환하도록 설정함
- 두번째 테스트 - `mockReturnValueOnce()` 함수, 함수가 실행되었을 때 최초 한 번만 정해진 값을 반환.
  순서대로 ‘a’, ‘b’, ‘c’ 값을 반환함
  마지막으로 한번더 실행하면 정해진 값이 없으므로 항상 undefined 반환
- 테스트 가독성과 유지 보수성 측면에서 `mockReturnValue()` 함수를 더 선호함

### 5.5.1 목과 스텁을 사용한 객체 지향 예제

```tsx
// 예제 5-10) MAintenanceWindow 의존성을 가진 비밀번호 검증기
import { IComplicatedLogger } from "./interfaces/complicated-logger";
import { MaintenanceWindow } from "./maintenance-window";

export class PasswordVerifier3 {
	private _rules: any[];
	private _logger: IComplicatedLogger;
	private _maintenanceWindow: MaintenanceWindow;

	constructor(
		rules: any[],
		logger: IComplicatedLogger,
		maintenanceWindow: MaintenanceWindow
	) {
		this._rules = rules;
		this._logger = logger;
		this._maintenanceWindow = maintenanceWindow;
	}

	verify(input: string): boolean {
		if (this._maintenanceWindow.isUnderMaintenance()) {
			this._logger.info("Under Maintenance", "verify");
			return false;
		}
		const failed = this._rules
			.map(rule => rule(input))
			.filter(result => result === false);

		if (failed.length === 0) {
			this._logger.info("PASSED", "verify");
			return true;
		}
		this._logger.info("FAIL", "verify");
		return false;
	}
}
```

- `MaintenanceWindow` 인터페이스는 생성자 매개변수로 주입되어 비밀번호 검증을 실행할지 여부를 결정하며 logger() 함수에 적절한 메세지를 보내는데 사용됨.

### 5.5.2 substitute.js를 사용한 스텁과 목

```tsx
// 예제 5-11) substitute.js를 사용하여 비밀번호 검증기 테스트하기
import { Substitute } from "@fluffy-spoon/substitute";
import { PasswordVerifier3 } from "./00-password-verifier";
import { MaintenanceWindow } from "./maintenance-window";
import { IComplicatedLogger } from "./interfaces/complicated-logger";

const makeVerifierWithNoRules = (log, maint) =>
	new PasswordVerifier3([], log, maint);

describe("working with substitute part 2", () => {
	test("verify, during maintenance, calls logger", () => {
		const stubMaintWindow = Substitute.for<MaintenanceWindow>();
		stubMaintWindow.isUnderMaintenance().returns(true);
		const mockLog = Substitute.for<IComplicatedLogger>();
		const verifier = makeVerifierWithNoRules(mockLog, stubMaintWindow);

		verifier.verify("anything");

		mockLog.received().info("Under Maintenance", "verify");
	});

	test("verify, outside maintenance, calls logger", () => {
		const stubMaintWindow = Substitute.for<MaintenanceWindow>();
		stubMaintWindow.isUnderMaintenance().returns(false);
		const mockLog = Substitute.for<IComplicatedLogger>();
		const verifier = makeVerifierWithNoRules(mockLog, stubMaintWindow);

		verifier.verify("anything");

		mockLog.received().info("PASSED", "verify");
	});
});
```

- 라이브러리를 이용한 덕분에 직접 가짜 객체를 만들 필요는 없었으나 가독성이 떨어지기 시작함.

## 5.6 격리 프레임워크의 장점과 함정

장점

- 손쉬운 가짜 모듈 생성
  : 격리 프레임워크는 보일러 플레이트 코드를 제거하여 모듈 의존성을 쉽게 처리할 수 있게 도와줌. 하지만 이 점은, 코드가 서드 파티 구현에 강하게 결합되도록 만들 수 있기 때문에 단점이 될 수도 있음
- 값이나 오류를 만들어 내기가 더 쉬워짐
  : 격리 프레임워크를 사용하면 복잡한 인터페이스의 모의 객체를 수작업으로 작성하는 것이 훨씬 쉬워짐
- 가짜 객체 생성이 더 쉬워짐
  : 격리 프레임워크를 사용하면 목이나 스텁을 더 쉽게 생성할 수 있음

위험 요소

### 5.6.1 대부분의 경우 모의 객체가 필요하지 않다

작업 단위에는 반환 값, 상태 변화, 서드 파티 의존성 호출 이렇게 세 가지 종류의 종료점이 있을 수 있다는 점 항상 기억하기

테스트를 정의하면서 모의 객체나 모의 함수가 호출되었는지 검증하기 전에 모의 객체 없이도 동일한 기능을 검증할 수 있는지 생각해보기

### 5.6.2 읽기 어려운 테스트 코드

하나의 테스트에 많은 목을 만들거나 검증 단계를 너무 많이 추가하면 테스트 가독성이 떨어져 유지 보수가 어렵고, 무엇을 테스트하고 있는지 이해하기 힘들 수 있음

테스트 가독성이 떨어지고 있다고 느낀다면

- 목이나 검증 단계를 줄이거나
- 테스트를 더 작은 하위 테스트로 쪼개서 전체적인 가독성을 끌어올리기

### 5.6.3 잘못된 대상 검증

실제로 의미 있는 동작을 검증하기보다는 단지 가능하기 때문에 검증하는 실수를 저지를 수 있음

- 내부 함수가 다른 내부 함수를 호출했는지 검증(종료점이 아닌 경우)
- 스텁이 호출되었는지 검증
- 단순히 누군가가 테스트를 작성하라고 해서 호출 여부 검증

### 5.6.4 테스트당 하나 이상 목을 사용

- 테스트에서는 하나의 관심사만 검증하는 것이 좋음
- 각 종료점마다 별도의 테스트를 작성하면 좋음

### 5.6.5 테스트의 과도한 명세화

너무 많이 테스트하면 전체 기능이라는 큰 그림을 놓치게 되고, 너무 적게 테스트하면 작업 단위 간 중요한 상호 작용을 놓치게 됨

다음 방법으로 균형 유지하기

- 목 대신 스텁 사용하기
  : 전체 테스트 중 모의 객체를 사용하는 테스트가 5% 이상이라면 너무 많이 사용하고 있는 것일지도 모름.
  스텁은 여러번 사용해도 상관없지만 모의 객체는 그렇지 않음. 한 번에 하나의 시나리오만 테스트하면 됨
- 가능한 스텁을 목으로 사용하지 않기

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

위에 개념 정리에 격리 프레임워크의 장단점을 비교했으므로 생략

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

```tsx
const axios = require("axios");

const { CustomError } = require("../../utils/error");

const serCredit = require("../credit");
const serProject = require("../project");

jest.mock("../project"); // 또 모킹한 이유가 뭔지?
jest.mock("axios"); // 모듈 가짜로 만듬

describe("service/credit", () => {
	describe("getCredit", () => {
		test("axios.get 요청 실패시 에러를 반환", async () => {
			axios.get.mockRejectedValue({
				response: {
					data: {
						message: "Cannot get credit from credit app",
						code: 500,
					},
				},
			});

			await expect(serCredit.getCredit(USER_ID)).rejects.toThrow(CustomError);
		});

		test("axios.get 요청 성공시 응답값 반환", async () => {
			const res = { credit: 100 };
			axios.get.mockResolvedValue({
				data: res,
			}); // 스텁 설정

			await expect(serCredit.getCredit(USER_ID)).resolves.toEqual(res);
		});
	});
});
```

목과 스텁을 한번에 사용하는 예제를 보니 조금 구분이 가는 것 같다.

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 격리 프레임워크란 테스트 시 의존성을 대체하기 위해 가짜 객체(목, 스텁 등) 를 동적으로 생성/제어할 수 있는 도구.

- 사용 목적은 테스트 코드의 유지 보수성과 간결성을 높이고, 실제 의존성 없이 상호작용 검증이 가능하도록 하기 위함.
- 격리 프레임워크 유형

  | 유형            | 설명                              | 예시          |
  | --------------- | --------------------------------- | ------------- |
  | **느슨한 타입** | JS 친화적, 함수형 스타일에 적합   | Jest          |
  | **정적 타입**   | TS 친화적, 클래스/인터페이스 중심 | substitute.js |

- 장점

  - 모듈/의존성 격리가 쉬움
  - 코드 간결해짐
  - 오류 상황 및 다양한 값 테스트 용이

- 주의사항
  - 남용 시 테스트 코드 복잡성 증가 가능
  - 직접 의존성의 추상화가 없을 경우, 구현 변경 시 테스트도 함께 깨질 위험
