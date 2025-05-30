<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

테스트 신뢰성. 버그 있는지 없는지를 정확하게 판단할 수 있는 테스트를 작성하는 방법과 올바른 테스트 실패와 잘못된 테스트의 실패의 차이점을 알아보기

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

좋은 테스트는 다음 세 가지 특성을 만족해야 함

- 신뢰성: 신뢰할 수 있는 테스트란 버그가 없고 올바른 대상을 테스트함을 의미함
- 유지 보수성
- 가독성: 테스트를 읽을 수 있는 것 외에도 테스트가 잘못된 경우 문제를 파악할 수 있는 능력을 의미

## 7.1 테스트를 신뢰할 수 있는지 판단하는 방법

- 테스트를 신뢰하지 않는 상황
  - 테스트는 실패했지만 신경 쓰지 않는 경우로 거짓 양성이라고 생각함
  - 테스트가 가끔 통과하거나 테스트가 현재 작업과 관련 없다고 생각하거나 테스트에 버그가 있다고 느낄 때 테스트 결과를 무시해도 괜찮다고 여김
  - 테스트가 통과했지만 의심스러운 경우로, 거짓 음성이라고 생각함
  - ‘만약에 대비하여’ 직접 디버깅하거나 프로그램을 테스트할 필요를 느끼는 경우
- 테스트를 신뢰하는 상황
  - 테스트가 실패했을 때, 코드의 무언가가 잘못되었을까 봐 진심으로 걱정하는 경우로, 쉽게 넘어가지 않고 테스트가 틀렸다고 생각함
  - 테스트가 통과한 경우로, 따로 수동으로 체스트하거나 디버깅할 필요가 없다고 여김

## 7.2 테스트가 실패하는 이유

- 프로덕션 코드에서 실제 버그가 발견된 경우
- 테스트가 거짓 실패(=거짓 양성)를 일으킨 경우
- 기능 변경으로 테스트가 최신 상태가 아닌 경우
- 테스트가 다른 테스트와 충돌하는 경우
- 테스트가 불안정한 경우

### 7.2.1 프로덕션 코드에서 실제 버그가 발견된 경우

### 7.2.2 테스트가 거짓 실패를 일으키는 경우

테스트 자체에 버그가 있으면 거짓 실패, 즉 프로덕션 코드에는 문제없지만 테스트가 실패하는 상황이 발생할 수 있음.

**테스트에 버그가 있는지 찾아내는 방법**

- 다음 항목에 해당하면 거짓 실패를 일으킨다고 볼 수 있음
  - 잘못된 항목이나 잘못된 종료점을 검증하는 경우
  - 잘못된 값을 진입점에 전달하는 경우
  - 진입점을 절못 호출하는 경우

**테스트 버그를 발견했을 때 해야 할 일**

- 침착하자. 버그를 수정하고 테스트를 다시 실행하여 통과하는지만 확인하면 됨
- 테스트가 통과했다고 해서 바로 안심하지 말자.
- 테스트가 계속해서 실패한다면 이는 테스트 문제가 아닌 프로덕션 코드에 문제가 있을 가능성이 크다는 의미임

**향후 잘못된 테스트를 방지하는 방법**

- TDD 방식으로 코드를 작성하면 코드의 어디가 잘못되었는지 쉽게 찾을 수 있어 버그를 미리 막을 수 있음.
- TDD를 사용하면 테스트의 두 가지 상태를 모두 확인할 수 있음
  - 처음에는 테스트가 실패해야 정상
  - 그다음 프로덕션 코드를 작성하여 테스트가 통과하도록 만듬
- 테스트 버그를 줄일 수 있는 또 다른 방법은 테스트 내부의 복잡한 로직을 제거하는 것

### 7.2.3 기능 변경으로 테스트가 최신 상태가 아닌 경우

예) 로그인 기능

- old: 사용자 이름과 비밀번호를 입력해야 로그인 가능
- new: 이중 인증 방식 도입

**무엇을 할 수 있을까?**

1. 테스트를 새로운 기능에 맞게 수정한다.
2. 새로운 기능을 대상으로 새 테스트를 만들고 기존 테스트는 삭제한다.

### 7.2.4 테스트가 다른 테스트와 충돌하는 경우

예) 어떤 테스트는 새로운 기능과 호환되지 않아 실패, 반면 또 다른 테스트는 새로운 기능이 있어야 하는데 그 기능이 적용되지 않아 실패

**무엇을 할 수 있을까?**

- 문제의 근본적인 원인은 두 테스트 중 하나가 더 이상 쓸모없어졌다는 것
- 어떤 테스트를 없애야 할까?
  - 제품의 기능과 요구 사항을 결정하는 사람, PO한테 물어봐야 함. 어떤 기능이 필요하고 서비스의 요구 사항을 만족하는지에 대한 답은 그 사람들이 할 수 있기 때문

### 7.2.5 테스트가 불안정한 경우

‘불안정한 테스트’: 테스트가 불규칙하게 실패할 때가 있음. 프로덕션 코드가 바뀌지 않았는데도 테스트가 갑자기 실패했다가 다시 통과하고, 또다시 실패하는 경우

## 7.3 단위 테스트에서 불필요한 로직 제거

테스트에 로직을 많이 넣을수록 테스트에 버그가 생길 확률이 기하급수적으로 증가함.

개발자들이 유지 보수성을 충분히 고려하지 않고 테스트를 작성하는 경우, 등 복잡해진 테스트는 디버그와 코드 검증에 더 많은 시간을 소모하게 됨.

다음 내용이 단위 테스트에 포함되어 있다면 이는 불필요한 로직이 포함된 것, 이를 줄이거나 완전히 없애는 편이 좋음

- switch, if, else 문
- foreach, for, while 루프
- 문자열 연결(+ 기호) 등
- try/catch 블록

### 7.3.1 Assert 문에서 로직: 동적 기대값 생성

문자열 연결 예제

```tsx
// 테스트 코드
expect(result).toBe("hello" + name);
// 테스트 코드가 사용하는 테스트 대상 코드(makeGreeting)
return "hello" + name;
```

→ 테스트 대상 코드인 `makeGreeting()` 함수에서 사용하는 로직이 테스트 코드에서도 그대로 사용되고 있다는 것. 함수 로직에 버그가 있다면 테스트에서도 동일한 버그가 발생함

테스트 코드가 실제 코드와 동일한 로직을 사용하기에는 이 테스트는 신뢰할 수 없음. 실제 코드에 버그가 있어도 테스트가 이를 감지하지 못하고 통과할 수 있기 때문

<aside>
📒

검증(assert) 단계에서 기댓값을 동적으로 생성하지 말고 가능하면 하드코딩된 값을 사용해야 함.

</aside>

```tsx
expect(result).toBe("hello abc");
```

### 7.3.2 다른 형태의 로직

- 반복문을 사용하여 입력 값을 동적으로 생성하면 기대 출력 값도 동적으로 생성해야 함.

```tsx
// 예제 7-4) 이름을 찾는 함수
const isName = (input) => {
	return input.split(" ").length === 2;
};

// 예제7-5) 테스트에서 반복문과 if문 사용하기
describe("isName", () => {
	const namesToTest = ["firstOnly", "first second", ""]; // 여러 입력 값 정의

	it("correctly finds out if it is a name", () => {
		namesToTest.forEach((name) => {
			const result = isName(name)'
			// 프로덕션 코드의 로직이 테스트 코드에 포함됨
			if(name.includes(" ")) {
				expect(result).toBe(true);
			} else {
				expect(result).toBe(false);
			}
		});
	});
});
```

- 공백이 있는 경우와 없는 경우를 처리하는 데 if/else 문이 필요함. 이 if/else 문에도 버그가 생길 수 있음.
  - 프로덕션 코드와 동일한 방식으로 값을 처리하거나 결과를 계산하는 로직을 테스트 코드에 포함하면, 프로덕션 코드에 버그가 있을 때 테스트 코드도 동일한 버그를 포함하게 되어 테스트가 버그를 제대로 잡아내지 못함
- 테스트 이름이 너무 모호함.

…

복잡한 테스트를 만들어야 한다면 기존의 간단한 테스트를 대체하지 말고 새로운 테스트로 추가해야 함. 또 이러한 테스트는 단위 테스트가 아닌 다른 테스트를 포함하도록 특정 프로젝트나 폴더에 포함시켜야 함.

### 7.3.3 로직이 더 많이 포함된 경우

테스트에 복잡한 로직이 필요하다면 최소한 유틸리티 함수의 로직을 검증하는 몇 가지 테스트를 추가하는 것이 좋음.→ 나중에 잠재적인 문제를 예방할 수 있음

## 7.4 테스트가 통과하더라도 끝이 아니다

‘잘못된 신뢰’: 신뢰하지 말아야 할 테스트를 신뢰하지만, 그 사실을 아직 모르는 상태를 의미함.

- 테스트가 통과하더라도 그 테스트를 믿지 못하는 몇 가지 이유
  - 검증 부분이 없는 경우
  - 테스트를 이해할 수 없는 경우
  - 단위 테스트가 불안정한 통합 테스트와 섞여 있는 경우
  - 테스트가 여러 가지를 한꺼번에 검증하는 경우
  - 테스트가 자주 변경되는 경우

### 7.4.1 검증 부분이 없는 경우

- 테스트에 검증 부분이 없으면 함수 호출 내 검증 로직이 숨어 있을 수 있음. 그러나 함수 이름에 어떤 설명도 포함하지 않으면 가독성이 떨어질 수밖에 없음.
- 테스트 API 중에는 예외가 발생하지 않음을 확인하는 기능을 제공하는 것도 있음.
  - 예) 제스트 - `expect(() => someFunction()).not.toThrow(error)`
- 테스트를 많이 작성해 보지 않은 경험 부족으로 검증 단계를 빼먹는 경우도 있음.
  → 빠진 검증 부분을 추가하거나 도움이 되지 않는 테스트를 삭제하는 것이 좋음.

### 7.4.2 테스트를 이해할 수 없는 경우

어떤 문제들이 있을 수 있는지?

- 이름이 적절하지 않은 테스트
- 코드가 너무 길거나 복잡한 테스트
- 변수 이름이 헷갈리게 되어 있는 테스트
- 숨어 있는 로직이나 이해하기 어려운 가정을 포함한 테스트
- 결과가 불분명한 테스트(실패도 아니고 통과도 아닌 경우)
- 충분한 정보를 제공하지 않는 테스트 메시지

테스트가 실패했는지 통과했는지 이해하지 못하면 그 테스트를 신경 써야 하는지 여부조차도 알 수 없음

### 7.4.3 단위 테스트가 불안정한 통합 테스트와 섞여 있는 경우

- 통합 테스트는 단위 테스트보다 의존성이 많아 불안정할 가능성이 더 높음.
- 이러한 테스트가 같은 폴더에 있거나 하나의 테스트 실행 명령어로 함께 실행된다면 의심해 보아야 함.

⇒ 통합 테스트와 단위 테스트를 분리하여 두 테스트가 섞이지 않도록 **안정적인 테스트 영역**을 만드는 것이 중요.

- 빠르고 신뢰할 수 있는 테스트만 포함되어야 함.
- 개발자는 최신 코드 버전을 받아 해당 네임스페이스나 폴더의 모든 테스트를 실행할 수 있어야 하며, 프로덕션 코드에 변경이 없는 한 모든 테스트가 통과할 것이라는 믿음을 가질 수 있어야 함.

### 7.4.4 테스트가 여러 가지를 한꺼번에 검증하는 경우

종료점(관심사)를 두 개 가진 함수 예시

```tsx
// 값을 반환하면서 동시에 매개변수로 전달된 콜백 함수를 실행함.
const trigger = (x, y, callback) => {
	callback("I'm triggered");
	return x + y;
};
```

두 가지 종료점을 동시에 확인하는 테스트 예제

```tsx
describe("trigger", () => {
	it("works", () => {
		const callback = jest.fn();
		const result = trigger(1, 2, callback);
		expect(result).toBe(3);
		expect(callback).toHaveBeenCalledWith("I'm triggered");
	});
});
```

테스트에서 여러 가지를 테스트하면 문제가 되는 이유

1. 테스트 이름이 모호하기 때문
2. 대부분의 단위 테스트 프레임워크에서 검증이 실패하면 테스트 프레임워크가 특별한 예외를 던짐. → 테스트가 실패한 것으로 처리됨
   - `expect(result).toBe(3)` 검증이 실패하면 다음 코드는 전혀 실행되지 않음

따로 구현하고 순차적으로 실행하는 것이 좋음.

```tsx
// 예제7-7) 두 종료점을 별도의 테스트로 확인하기
describe("trigger", () => {
	it("triggers a given callback", () => {
		const callback = jest.fn();
		trigger(1, 2, callback);
		expect(callback).toHaveBeenCalledWith("I'm triggered");
	});

	it("sums up given values", () => {
		const result = trigger(1, 2, jest.fn());
		expect(result).toBe(3);
	});
});
```

조건부로 한 테스트에서 여러 가지를 검증해도 괜찮은 경우

; 여러 관심사를 한 번에 다루지 않는 경우에 한해서 가능

```tsx
// 예제7-8) 하나의 종료점을 여러 번 검증하기
const makePerson = (x, y) => {
	return {
		name: x,
		age: y,
		type: "person",
	};
};

describe("makePerson", () => {
	it("creates person given passed in values", () => {
		const result = makePerson("name", 1);
		expect(result.name).toBe("name");
		expect(Result.age).toBe(1);
	});
});
```

→ 같은 관심사에 해당하기 때문에 함께 검증함. 첫번째 검증이 실패하면 객체를 만드는 과정에서 큰 문제가 발생했을 가능성이 있으므로 두 번째 검증은 그다지 중요하지 않게 됨

Tip. 테스트를 나눌 때 고려해야 할 점

- 첫번째 검증이 실패했을 때, 다음 검증 결과가 여전히 중요하다면 각 검증을 서로 다른 테스트 두 개로 독립적으로 진행하는 것이 좋음.

### 7.4.5 테스트가 자주 변경되는 경우

## 7.5 불안정한 테스트 다루기

불안정한 테스트

- 코드에 아무런 변화가 없는데도 일관성 없는 결과를 반환하는 테스트를 설명할 때 사용할 수 있음.

- 테스트 수준이 높을수록 실제 의존성을 더 많이 사용하게 됨. 이는 시스템이 제대로 작동한다는 신뢰성은 높이지만 동시에 불안정성도 증가시킴

- 가장 낮은 수준에 해당하는 단위테스트에서는 테스트가 모든 의존성을 완전히 제어할 수 있어 변동 요소가 없음. 이는 의존성을 가짜로 만들거나 메모리에서만 실행되기 때문.
  예상과 다른 결과가 나온다면 이는 프로덕션 코드의 실행 경로나 로직에 중요한 변화가 생겼음을 의미함
- 테스트 수준이 올라갈수록 스텁과 모의 객체를 덜 사용하고 데이터베이스, 네트워크, 환경 설정 등 실제 의존성을 더 많이 사용함.
- 최상위 수준의 테스트는 모든 의존성을 실제로 사용함.
- 테스트를 불신하는 것이 아니라면, 상위 단계로 갈수록 코드가 제대로 동작할 것이라는 믿음이 생겨야 함. 하지만 테스트 결과를 신뢰하지 못한다면 그 믿음은 무의미함.
- 테스트가 프로덕션 크드를 건드리지 않았는데도 가끔 실패하는 경우가 있음. 예를들어
  - 테스트가 세 번에 한 번씩 실패하는 경우
  - 테스트가 불규칙하게 몇 번에 한 번씩 실패하는 경우
  - 네트워크나 데이터베이스 가용성, 다른 API가 사용되지 않았을 가능성, 환경 설정 등 다양한 외부 조건이 제대로 작동하지 않을 때 테스트가 실패하는 경우

### 7.5.1 불안정한 테스트를 발견했을 때 할 수 있는 일

- 문제 정의하기: ‘불안정’이 무엇을 의미하는지 명확히 정의해야 함.
  예를 들어 프로덕션 코드를 변경하지 않고 테스트 케이스를 열 번 실행한 후 결과가 일관되지 않은 테스트를 모두 세어 봄
- 불안정하다고 판단된 테스트는 별도의 카테고리나 폴더에 따로 모아 실행할 수 있도록 함.
  주요 배포 빌드에서 불안정한 테스트를 제외하여 불필요한 잡음을 줄이고, 이 테스트들을 임시로 별도의 파이프라인으로 분리하는 것이 좋음.
  그 다음 각 불안정한 테스트를 하나씩 검토하며 수정, 리팩토링, 삭제 과정을 진행함
  - 수정: 가능한 경우 의존성을 제어하여 테스트 안정서을 높임
  - 리팩터링: 의존성을 제거하거나 제어하여 테스트를 더 낮은 수준의 테스트로 변환해서 불안정성을 제거함
  - 삭제: 테스트로 얻는 이점이 유지 보수 비용을 감당하고도 남을 만큼 충분한지 고민, 오래되고 불안정한 테스트는 차라리 없애는게 나을 수도 있음

### 7.5.2 상위 수준의 테스트에서 안정성을 유지하는 방법

- 테스트가 데이터베이스나 네트워크 서비스 같은 외부 시스템을 변경했으면 변경한 내용을 롤백한다.
- 다른 테스트가 외부 시스템의 상태를 변경하지 않도록 한다.
- 외부 시스템과 의존성을 제어할 수 있어야 한다. 예를 들어 해당 시스템을 언제든지 다시 만들 수 있도록 하거나, 제어 가능한 더미 시스템을 만들거나, 테스트 전용 계정을 만들어 안전하게 관리한다.

외부 의존성을 제어하기가 힘들거나 불가능할 경우 다음 방법을 고려해보기

- 저수준 테스트가 이미 특정 기능이나 동작을 검증하고 있다면 일부 고수준 테스트를 삭제한다.
- 일부 고수준 테스트를 저수준 테스트로 바꾼다.
- 새로운 테스트를 작성할 때는 배포 파이프라인에 적용하기 쉬운 테스트 전략과 방법을 고려한다.

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->
종료점(관심사)를 두 개 가진 함수 예시

```js
// 값을 반환하면서 동시에 매개변수로 전달된 콜백 함수를 실행함.
const trigger = (x, y, callback) => {
	callback("I'm triggered");
	return x + y;
};
두 가지 종료점을 동시에 확인하는 테스트 예제

describe("trigger", () => {
	it("works", () => {
		const callback = jest.fn();
		const result = trigger(1, 2, callback);
		expect(result).toBe(3);
		expect(callback).toHaveBeenCalledWith("I'm triggered");
	});
});
```
테스트에서 여러 가지를 테스트하면 문제가 되는 이유

- 대부분의 단위 테스트 프레임워크에서 검증이 실패하면 테스트 프레임워크가 특별한 예외를 던짐. → 테스트가 실패한 것으로 처리됨
- expect(result).toBe(3) 검증이 실패하면 다음 코드는 전혀 실행되지 않음

-> expect 를 한 테스트코드에서 사용하는 경우가 많음. 
맞는 테스트코드일까? ([기존 코드](https://github.com/goorm-dev/ide-site/blob/develop/src/server/service/__tests__/pricing.test.js))

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 테스트가 실패했을 때 그 결과를 믿지 않으면 실제 버그를 놓칠 수 있고, 테스트가 통과했을 때 그 결과를 믿지 않으면 직접 코드를 디버깅하며 테스트해야 함. 잘 작성된 테스트는 이러한 문제를 줄여 줌. 그러나 좋은 테스트를 작성하는 것을 신경 쓰지 않고 작성한 테스트 결과를 믿지 않는다면 뭐 하러 테스트를 작성해야 할까?
- 테스트가 실패하는 이유는 다양함. 프로덕션 코드에서 실제 버그가 발견된 경우, 테스트가 거짓 실패를 일으키는 경우, 기능 변경으로 테스트가 최신 상태가 아닌 경우, 테스트가 다른 테스트와 충돌하는 경우, 테스트가 불안정한 경우 등이 있음. 그러나 그 중에서 실제 버그가 발견된 경우만 테스트 실패의 타당한 이유가 될 수 있음. 나머지 이유들은 테스트를 신뢰할 수 없음을 의미함.
- 테스트에서는 동적으로 결과 값을 생성하거나 프로덕션 코드의 로직을 복사하는 등 복잡성을 피해야 함. 이러한 복잡성은 테스트에 버그가 생길 확률을 높이고 테스트를 이해하는 데 걸리는 시간을 늘림
- 테스트에 검증 부분이 없거나, 무엇을 하는지 이해할 수 없거나, 해당 테스트는 안전하더라도 불안정한 테스트와 함께 실행되거나, 여러 종료점을 검증하거나, 자주 변경된다면 그 테스트는 신뢰할 수 없음
- 불안정한 테스트는 언제 실패할지 알 수 없는 테스트를 의미함. 테스트 수준이 높을수록 실제 의존성이 많아지는데, 이는 시스템의 전체적인 정확성에 대한 신뢰를 높여 주지만 불안정성도 함께 증가시킴. 불안정한 테스트를 더 잘 구분하려면 이를 별도로 실행할 수 있는 카테고리나 폴더에 분리해 두는 것이 좋음
- 테스트 불안정성을 줄이려면 테스트를 리팩터링하거나, 불안정한 고수준 테스트를 덜 불안정한 저수준 테스트로 수정하거나, 불안정한 테스트를 삭제하는 것이 좋음.
