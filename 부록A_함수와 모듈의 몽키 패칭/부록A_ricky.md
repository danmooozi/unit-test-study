<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

테스트에서 전체 모듈을 페이크로 만드는 방법(불안정하고 권장되지 않는)들을 알아보자.

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

### 시작하기전 알아두어야 할 점

글로벌 패칭이나 함수와 모듈을 스텁으로 대체하는 것은 장단점이 존재한다. 하지만 필자의 경험상 해당 방법은 추천하지 않는다.

그러므로, 어쩔수 없이 사용해야하는 아래와 같은 상황에서만 사용하도록 하자.

1. 수정할 수 없는 외부 코드의 의존성을 페이크해야 할 때
2. 즉시 실행되는 함수나 모듈을 다룰 때
3. 객체가 아닌 함수만 제공하는 모듈을 처리해야 할 때

### 함수와 전역변수의 몽키 패칭

**몽키 패칭**이란 실행 중인 프로그램 인스턴스 동작을 런타임에 수정하는 것을 의미한다.

예를 들어 `Date.now()` 함수를 몽키 패칭하면 그 이후에 실행되는 모든 코드는 변경된 시간을 사용하게 된다.

#### Date.now() 함수를 사용하는 프로덕션 코드

```js
const daysFrom = (to) => {
  const ms = Date.now() - new Date(to).getTime();
  return (ms / 1000) * 60 * 60 * 24;
};

const findRecentlyRebooted = (machines, maxDays) =>
  machines.filter((machine) => daysFrom(machine.lastBootTime) < maxDays);

module.exports = {
  findRecentlyRebooted,
};
```

#### 전역 함수인 Date.now()를 페이크로 만들면 발생할 수 있는 문제

```js
describe("v1 findRecentlyRebooted", () => {
  test("given 1 of 2 machines under threshold, it is found", () => {
    const originalNow = Date.now; // 원래 전역 함수 저장
    const fromDate = new Date(2000, 0, 3); //  Date.now() 함수 페이크
    Date.now = () => fromDate.getTime(); //  Date.now() 함수 페이크

    const rebootTwoDaysEarly = new Date(2000, 0, 1);
    const machines = [
      { lastBootTime: rebootTwoDaysEarly, name: "ignored" },
      { lastBootTime: fromDate, name: "found" },
    ];

    const result = findRecentlyRebooted(machines, 1, fromDate);

    expect(result.length).toBe(1);
    expect(result[0].name).toContain("found");

    Date.now = originalNow; // 원래 Date.now() 함수 복원 --- (1)
  });
});
```

`Date.now()`를 커스텀 함수로 변경한다. 해당 함수는 전역 함수이므로 다른 테스트에 영향을 줄 수 있기 때문에, 테스트가 끝난난후 오리지널 Date.now 로 복원한다.

하지만 문제점이 있다.

1. 테스트의 검증 부분이 실패하면 예외가 발생하므로 원복 하는 코드 (1) 가 실행되지 않을 수 있다. -> 다른 테스트에 영향을 주게 됨.
2. Jest 는 기본적으로 테스트를 병렬적으로 실행하기 때문에 충돌이 발생할 수 있다. (-> `--runInBand` 옵션을 추가하여 병렬 실행을 막는 방법도 있음)

이에 `beforeEach()`, `afterEach()` 와 같은 초기화 함수를 사용할 수도 있음.

#### 초기화 함수 사용

```js
describe("v2 findRecentlyRebooted", () => {
  let originalNow;
  beforeEach(() => (originalNow = Date.now)); // 원래 전역 함수 저장
  afterEach(() => (Date.now = originalNow)); // 원래 Date.now() 함수 복원

  test("given 1 of 2 machines under threshold, it is found", () => {
    const fromDate = new Date(2000, 0, 3);
    Date.now = () => fromDate.getTime();

    const rebootTwoDaysEarly = new Date(2000, 0, 1);
    const machines = [
      { lastBootTime: rebootTwoDaysEarly, name: "ignored" },
      { lastBootTime: fromDate, name: "found" },
    ];

    const result = findRecentlyRebooted(machines, 1, fromDate);

    expect(result.length).toBe(1);
    expect(result[0].name).toContain("found");
  });
});
```

초기화함수를 사용하면서 테스트 코드가 간결해지고, 한 파일내의 순서는 보장될 수 있지만, 다른 파일의 테스트에서는 이 동작을 보장하지 않는다.

#### Jest 를 사용한 몽키 패칭

Jest 의 `spyOn` 과 `mockImplementation` 함수를 함께 사용하는 방식으로도 몽키 패칭이 가능하다.

#### spyOn

`Date.now = jest.spyOn(Date, 'now')`

- 특정 객체의 함수 호출을 추적하는 역할을 한다.
- 주의점: 함수 이름을 문자열로 전달하므로, 리팩토링할 때 함수 이름을 변경하면 문자열이 자동으로 업데이트 되지 않으므로 주의해야한다.
- 테스트 더블(목, 스텁)과의 차이점은 함수의 실제 구현을 그대로 실행하면서, 그 함수의 입력 값과 출력값을 기록한다.
- 반명에 테스트 더블은 실제 구현을 사용하지 않는다.

-> 스파이는 작업 단위를 감싼 후, 기본 동작을 변경하지 않고 진입점과 종료점에 보이지 않는 추적 레이어를 추가하여 입출력을 추적하는 것이다.

> ex)
>
> ```js
> const math = {
>   add: (a, b) => a + b,
> };
>
> const spy = jest.spyOn(math, "add");
> math.add(1, 2);
>
> expect(spy).toHaveBeenCalled();
> expect(spy).toHaveBeenCalledWith(1, 2);
> ```

#### spyOn 과 mockImplementation 함수 사용

스파이의 본질인 **'기능을 변경하지 않고 추적하는'** 동작이 바로 spyOn 함수만으로 Date.now() 함수를 테스트 페이크로 만드는데 충분하지 않은 이유다.

Date.now() 함수를 실제로 페이크로 만들어 스텁으로 사용하려면 함수 이름이 헷갈리므로 mockImplementation 함수로 기본 작업단위의 기능을 대체해야 한다.

`jest.spyOn(Date, 'now').mockImplementation(() => /* return */)`

#### jest.spyOn() 으로 Date.now() 함수를 몽키 패칭하기

```js
describe("v4 findRecentlyRebooted with jest spyOn", () => {
  afterEach(() => jest.restoreAllMocks()); // 스파이로 추적했던 전역 상태를 복원

  test("given 1 of 2 machines under threshold, it is found", () => {
    const fromDate = new Date(2000, 0, 3);
    Date.now = jest
      .spyOn(Date, "now")
      .mockImplementation(() => fromDate.getTime()); // 동적으로 변하기 때문에 테스트에서 고정된 시간 값을 반환하도록 스텁(mock) 처리.

    const rebootTwoDaysEarly = new Date(2000, 0, 1);
    const machines = [
      { lastBootTime: rebootTwoDaysEarly, name: "ignored" },
      { lastBootTime: fromDate, name: "found" },
    ];

    const result = findRecentlyRebooted(machines, 1, fromDate);

    expect(result.length).toBe(1);
    expect(result[0].name).toContain("found");
  });
});
```

> **jest.fn() 은 왜 사용하면 안될까?**
>
> - jest.fn()과 jest.spyOn()의 차이는? -> 전자는 mock 함수 생성, 후자는 기존 함수에 spy/mock 입힘
> - Date.now는 전역 내장 객체의 메서드
> - jest.fn()으로 덮어쓰면 원본이 사라짐
>   => 따라서 jest.spyOn()으로 스파이 + mockImplementation()으로 동작 대체

### 제스트로 전체 모듈 무시하기

부록 A에서 다루는 여러 기법 중 가장 안정한다.

테스트 대상의 내부 동작을 변경하지 않고 모듈 전체를 단순히 제외하는 방식이기 때문

테스트에서 특정 모듈을 전혀 신경 쓰지 않으며 그 모듈에서 가짜 데이터조차 반환받을 필요가 없다면, 테스트 파일 상단에 `jest.mock('모듈 경로')`를 추가한다.

### 각 테스트에서 모듈 동작을 페이크로 만들기

> => 책에서도 복잡하다고 했지만,, 여기부분은 이해가 조금 어려웠다..

모듈 동작을 페이크로 만든다는 것은 테스트 코드가 처음 로드되는 전역 객체를 가짜로 만드는 것을 의미한다.

사용중인 프레임워크에 따라 모듈이 내부적으로 캐시되거나 Node.js 의 require.cache 매커니즘을 통해 캐시될 수 있음.

하지만 문제는 이것이 처음에 한 번만 실행되어 같은 파일 안에서 서로 다른 테스트마다 다른 동작이나 데이터를 페이크로 만들때는 어려움이 생긴다.

가짜 모듈에 커스텀 동작은 입히려면 테스트에서 다음 단계를 거쳐야 한다.

CFRA(Clear - Fake - Require - Act)

1. 모듈 제거(Clear): 각 테스트 전에 테스트 러너의 메모리에 캐시되거나 로드된 모든 모듈을 제거
2. 테스트 준비 단계

- 모듈 대체(Fake): 테스트 코드에서 require로 호출될 모듈을 페이크로 만든다.
- 모듈 불러오기(Require): 테스트 실행하기 직전에 테스트 대상 코드를 require로 불러온다.

3. 테스트 실행(Act): 진입점 호출

#### 모듈 동작은 페이크로 만드는 여러가지 방법들

- 기본 require.cache를 사용하여 모듈을 스텁으로 만들기
- 제스트로 커스텀 모듈을 스텁으로 만들기
- 제스트로 직접 목 만들기
- 사이넌으로 모듈을 스텁으로 만들기
- 테스트 더블로 모듈을 스텁으로 만들기

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

#### `mockImplementation(fn)`

- 매 호출마다 함수를 실행해 결과를 반환
- 복잡한 로직, 입력에 따라 반환 결과를 다르게 하고 싶을 때 사용
- 5장에 example case 로 정리해놓음

```javascript
const mockFn = jest.fn();
mockFn.mockImplementation((x) => x * 2);
console.log(mockFn(3)); // 6
```

#### 테스트 더블

책 초반에 배웠던 **테스트 더블**에 대해 슬슬 헷갈려져서 한번 더 정리해봤다.
| 종류 | 설명 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dummy** | 사용되지는 않지만 인자 자리를 채우기 위해 전달되는 객체<br>ex) 콜백 함수에 `null`이나 빈 함수 `() => {}`를 넘기는 경우. |
| **Fake** | 실제와 유사하게 작동하지만 테스트에 적합하게 단순화된 구현<br>ex) 실제 DB 대신 메모리 배열로 만든 `FakeUserRepository`. |
| **Stub** | 미리 정해진 값만 반환하며 로직 없이 고정된 응답을 제공 <br>ex) `apiStub.getUser = () => ({ id: 1, name: "John" })`. |
| **Spy** | 함수가 어떻게 호출되었는지(인자, 횟수 등) 추적 가능하며 원래 동작은 유지할 수도 있음. <br>ex) `jest.spyOn(console, "log")`로 로그 호출 감시. |
| **Mock** | 함수의 호출 방식 자체를 검증하는 데 집중하며, 테스트 내에서 예상된 대로 호출되었는지를 확인 <br>ex) `expect(mockFn).toHaveBeenCalledWith("hello")`. |

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 테스트에서 전역 함수와 모듈을 페이크하거나 몽키 패칭하는 다양한 방법과 주의점을 살펴보았다.
- Jest의 `spyOn`과 `mockImplementation`을 활용하여 전역 함수를 몽키 패칭 할 수 있다.
- 각 테스트에서 모듈 동작을 페이크로 만드는 것은 테스트 격리와 유연성을 위해 중요하다.
