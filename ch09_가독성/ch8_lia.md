<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 9장. 가독성

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

테스트 가독성을 높이는 방법을 다룸. 테스트 이름을 짓는 규칙과 입력 값을 어떻게 정할지 살펴보고, 테스트를 효과적으로 구성하는 방법을 알아본다.

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

이 장에서는 프로젝트에 후발 주자로 합류한 개발자들이 프로덕션 코드와 테스트를 어떻게 유지보수할 수 있는지 알아볼 예정.

가독성은 코드를 읽는 사람이 무엇을 하고 어디에서 하는지 이해할 수 있도록 해야 함

가독성의 여러 요소

- 단위 테스트 이름 짓기
- 변수 이름 짓기
- 검증과 실행 단계 분리
- 초기화 및 설정 해제

### 9.1 단위 테스트 이름 짓기

테스트 이름이나 테스트가 포함된 파일 구조에는 다음 세가지 중요한 정보가 포함되어야 함

- 작업 단위의 진입점(혹은 현재 테스트 중인 기능 이름)
- 진입점을 테스트하는 상황
- 작업 단위의 종료점이 실행해야 하는 동작

> **테스트 이름은 사용하는 언어데 따라 가독성이 다르다?**
> 한국어가 아닌 영어로 작성하는 편, 테스트 이름을 잘 짓는 것이 무엇보다도 중요한데 영어는 문장 구조에서 동사가 먼저 나오는 형태이지만 한국어는 문장 맨 마지막에 위치하기 때문
> 동사를 가장 왼쪽에 배치할 수 있는 영어가 좀 더 명확하다고 생각
>
> ```tsx
> // descirbe() 블록을 사용하지 않은 경우
> it("When I call entry point X with a null value, then it should do Y.", () => {
> 	// AAA 패턴에 맞추어 코드를 작성한다.
> });
>
> // describe() 블록을 사용한 경우
> describe("When I call entry point X", () => {
> 	desribe("with a null value", () => {
> 		it("should do Y.", () => {
> 			// AAA 패턴에 맞추어 코드를 작성한다.
> 		});
> 	});
> });
> ```
>
> → 영어로 테스트 이름을 지을 때는 준비해야 하는 것과 실제로 수행해야 하는 것부터 명확히 인지한채 테스트 코드 내부를 읽을 수 있다는 장점이 있음. 팀 내에서 한국어로 테스트를 작성하기로 합의했다면 다음과 같이 작성하길 추천
>
> ```tsx
> // describe() 블록을 사용하지 않은 경우
> it("진입점 X를 null 값으로 호출하면, 작업 단위의 종료점에서 Y가 수행되어야 한다.", () => {
> 	// AAA 패턴에 맞추어 코드를 작성한다.
> });
>
> // describe() 블록을 사용한 경우
> desribe("진입점 X를 테스트할 때", () => {
> 	describe("null 값으로 호출하면", () => {
> 		it("Y를 수행해야 한다.", () => {
> 			// AAA 패턴에 맞추어 코드를 작성한다.
> 		});
> 	});
> });
> ```

필수 정보 세 가지를 포함해야 하는 또 다른 이유

- 이름을 명확하고 이해하기 쉽게 지었다면 테스트 코드를 읽거나 디버깅할 필요 없이 로그만 읽고도 실패 원인을 이해할 수 있음. → 디버깅 시간과 코드를 읽는 시간을 훨씬 절약할 수 있음.

좋은 테스트 이름은 문서 역할도 할 수 있음

### 9.2 매직 넘버와 변수 이름

- 매직 넘버: 하드코딩된 값, 기록에 남지 않은 값, 명확하게 이해되지 않는 상수나 변수를 의미.
  - ‘매직’: 마치 마법처럼 이 값들이 작동하지만 왜 그렇게 작동하는지 알 수 없다는 의미로 쓰임

```tsx
// 예제 9-3) 매직 넘버를 포함한 테스트
describe("password verifier", () => {
	test("on weekends, throws exceptions", () => {
		expect(() => verifyPassword("jhGGu78!", [], 0)) // 매직넘버 사용
			.toThrowError("It's the weekend!");
	});
});
```

- 세 가지 매직넘버

```tsx
// 예제 9-4 매직 넘버 수정하기
describe("verifier2 - dummy object", () => {
	test("on weekends, throws exceptions", () => {
		const SUNDAY = 0,
			NO_RULES = [];
		expect(() => verifyPassword2("anything", NO_RULES, SUNDAY)).toTrhowError(
			"It's the weekend!"
		);
	});
});
```

- anything: 아무거나 라는 의미 전달. 이 테스트에서 비밀번호는 중요하지 않다는 것을 알려줄 수 있음.

- 변수 이름과 값은 중요한 것을 설명하는 역할도 하지만, 코드를 읽는 사람이 어떤 부분을 신경 쓰지 않아도 되는지 알려 주는 역할도 함.

### 9.3 검증과 실행 단계 분리

- 가독성을 높이려면 검증 단계와 실행 단계를 한 문장에 넣지 말아야 함.

```tsx
// 예제 9-5) 검증과 실행 단계 분리하기
expect(verifier.verify("any value")[0]).toContain("fake reason"); // 올바르지 않은 예

// 올바른 예
const result = verifier.verify("any value");
expect(result[0]).toContianer("fake reason");
```

→ 두번째가 디버깅하기 훨씬 쉬움. 별 것 가닌 것 같아도 이 작은 차이를 무시하면 안됨

### 9.4 초기화 및 설정 예제

- 단위 테스트에서 초기화(setup)와 해제 함수는 남용되기 쉬움
- 이는 테스트에 필요한 초기 설정이나 테스트가 끝난 후 목을 다시 초기화하는 등 해제 작업의 가독성을 떨어뜨림.
- 특히 초기화 함수에서 이 현상이 더욱 두드러짐

```tsx
// 예제 9-6) beforeEach() 함수를 사용하여 목 초기화하기
describe("password verifier", () => {
	let mockLog;
	beforeEach(() => {
		mockLog = Substitute.for<IComplicatedLogger>(); // beforeEach() 함수에서 목을 초기화함
	});

	test("verify, with logger & passing, calls logger with PASS", () => {
		const verifier = new PasswordVerifier2([], mockLog); // 초기화 함수에서 설정한 목 사용
		verifer.verify("anything");

		mockLog.received().info(
			// 초기화 함수에서 설정한 목을 사용함
			Arg.is(x => x.includes("PASSED")),
			"verify"
		);
	});
});
```

- 설정 함수에서 목과 스텁을 설정하면 테스트 내에서는 해당 객체를 어디서 만들었는지 찾을 수 없음. 따라서 테스트를 읽는 사람은 모의 객체가 사용되고 있다는 사실이나 테스트가 모의 객체가 어떤 값이나 동작을 수행하는지 알지 못할 수 있음
- 하나의 파일 내에 여러 테스트가 있을 때 여러 목과 스텁을 사용하면 또 다른 문제가 생길 수 있음.
  초기화 함수가 모든 테스트에서 사용되는 상태를 처리하는 곳이 되어 버림.
  이 때문에 목과 스텁이 어떤 것은 여기에서 쓰고 어떤 것은 저기에서 쓰는 ‘뒤죽박죽’인 상태가 되어 이해하기 어렵고 관리하기도 힘듬
- 목은 테스트 내에서 직접 초기화하고 모든 기댓값을 설정하는 것이 훨씬 더 가독성이 좋음.

```tsx
// 예제 9-7) 초기화 함수를 사용하지 않고 테스트 내에서 모의 함수 맏르기
describe("password verifier", () => {
	test("verify, with logger & passing, calls logger with PASS", () => {
		const mockLog = Substitute.for<IComplicatedLogger>(); // 테스트 내에서 목 초기화

		const verifier = new PasswordVerifier2([], mockLog);
		verifier.verify("anything");

		mockLog.received().info(
			Arg.is(x => x.includes("PASSED")),
			"verify"
		);
	});
});
```

- 테스트 내에서 초기화를 해야 목이 언제 생성되는지, 어떻게 동작하는지 등 필요한 모든 것을 한눈에 알 수 있음
- 팩토리 함수 사용하여 목 생성하고 이를 여러 테스트에서 사용할 수 있도록 리팩토링. 유지보수성 높임

```tsx
// 예제 9-8) 팩토리 함수 사용하기
describe("password verifier", () => {
	test("verify, with logger & passing, calls logger with PASS", () => {
		const mockLog = makeMockLogger(); // 팩토리 함수를 사용하여 mockLog() 모의 함수를 생성

		const verifer = new PasswordVerifier2([], mockLog);
		verifier.verify("anything");

		mockLog.received().info(
			Arg.is(x => x.includes("PASSED")),
			"verify"
		);
	});
});
```

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 테스트 이름을 지을 때는 테스트할 작업 단위 이름과 현재 무엇을 테스트하려고 하며 어떤 결과가 나와야 하는지 등 정보를 포함해야 함
- 매직 넘버를 사용하는 대신 의미 있는 이름의 변수로 감싸거나 문자열일 경우 값 자체에 설명을 사용해야 함.
- 검증과 실행 단계를 분리해야함. 이 둘을 합치면 코드는 짧지만 이해하기는 훨씬 어려움
- 가급적 `beforeEach()` 함수 같은 초기화 함수를 사용하지 않도록 함. 대신에 팩토리 함수를 만들어 테스트 준비 단계를 보다 명확히 하여 가독성을 높이는 방식을 사용해 보자.
