<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!NOTE]   
> ch09 가독성 (p300 ~ p309)

## Summary
<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->
- 테스트의 이름을 명확히 짓고, 테스트 내 매직 넘버를 사용을 지양하며, 테스트의 검증과 실행 단계를 분리하고, 팩토리 함수를 사용해 준비 단계를 명확히 하여 테스트 가독성을 높일 수 있다.
## Concept
<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->
### 가독성의 요소
- 단위 테스트 이름 짓기
- 변수 이름 짓기
- 검증(assert)과 실행(action) 단계 분리
- 초기화 및 설정 해제

### 단위 테스트 이름 짓기
테스트 이름에 포함되어야 하는 3가지 
   - 작업 단위의 진입점 (or 현재 테스트 중인 기능 이름)
   - 진입점을 테스트하는 상황
   - 작업 단위의 종료점이 실행해야 하는 동작

예를 들어, 테스트 이름을 아래 형식으로 작성한다.
> 진입점 X를 null 값으로 호출하면, Y를 실행한다

이 모든 요소를 하나의 테스트 함수 이름에 포함시킬 수도 있고,
중첩된 `describe()` 블록을 사용해 나눌 수도 있다.

```js
test('verifyPassword, with a failing rule,
    returns error based on rule.reason', () => {
});

describe('verifyPassword', () => {
    describe('with a failing rule', () => {
        it('returns error based on the rule.reason', () => {

        });
    })
})
```
동일한 정보도 위 예제처럼 다른 방식으로 표현할 수 있다.   
이렇게 세가지 요소를 모두 포함한 테스트 함수 이름을 작성하면, 
다른 개발자가 테스트 이름만으로도 무엇을 테스트 하는지 알기 쉽게 된다.

필수 세가지 정보를 포함해야 하는 또 다른 이유는 테스트 실패 시 표시되는 화면 때문이다.   
자동화 빌드 파이프라인이 실패했을 때 보통 표시되는 유일한 정보로 테스트 이름이 많다.   
이름을 명확하고 이해하기 쉽게 지었다면 테스트 코드를 읽거나 디버깅 할 필요 없이 로그만 읽고도 실패 원인을 이해할 수 있다.

또한, 팀에 새로 합류한 사람이 테스트를 읽고 특정 컴포넌트나 시스템의 동작 방식을 이해할 수 있다면,    
가독성이 좋다는 의미다.

### 매직 넘버와 변수 이름
매직 넘버란 하드코딩된 값, 기록에 남지 않은 값, 명확하게 이해되지 않는 상수나 변수를 의미한다.

```js
describe('password verifier', () => {
    test('on weekends, throws exceptions', () => {
        expect(() => verifyPassword('jhGGu78!', [], 0)) // 매직 넘버
            .toThrowError("It's the weekend!");
    });
});
```

`verifyPassword` 함수를 잘 모르고 이 테스트 코드도 작성하지 않은 사람은 코드를 읽었을 때, 함수의 세 번째 인수로 전달하는 0이 무슨 의미인지 알 수 없다.

이렇게 매직 넘버를 사용한 테스트 코드는 아래처럼 수정할 수 있다.

```js
describe('verifier2 - dummy object', () => {
    test('on weekends, throws exceptions', () => {
        const SUNDAY = 0, NO_RULES = [];
        expect(() => verifyPassword2("anything", NO_RULES, SUNDAY)).toThrowError("It's the weekend!");
    });
});
```

**매직 넘버를 의미 있는 변수로 대체**하면 코드를 더 쉽게 이해할 수 있게된다.

### 검증과 실행 단계 분리
가독성을 높이려면 검증 단계와 실행 단계를 한 문장에 넣지 말아야한다.

```js
expect(verifier.verify('any value')[0]).toContain('fake reason'); // 올바르지 않음

const result = verifier.verify('any value');
expect(result[0]).toContain('fake reason'); // 올바른 예
```

첫 번째 예제는 한 줄에 너무 많은 내용이 포함되어 있고, 실행과 검증 부분이 함께 있어 
테스트에서 읽고 이해하기 어렵다.   

### 초기화 및 설정 해제
단위 테스트에서 초기화(setup)와 해제(teardown) 함수는 남용되기 쉽다.   
테스트에 필요한 초기 설정이나 테스트가 끝난 후 목을 다시 초기화하는 등 해제 작업의 가독성을 떨어뜨린다.

다음 예제는 초기화 함수나 `beforeEach()` 함수를 사용하여 목이나 스텁을 설정한다.

```js
describe('password verifier', () => {
    let mockLog;
    beforeEach(() => {
        mockLog = Substitute.for<IComplicatedLogger>(); // beforEach() 함수에서 목 초기화
    });

    test('verify, with logger & passing, calls logger with PASS', () => {
        const verifier = new PasswordVerifier2([], mockLog); // 초기화 함수에서 설정한 목을 사용
        verifier.verify('anything');

        mockLog.received().info( // 초기화 함수에서 설정한 목을 사용
            Arg.is(x => x.includes('PASSED')),
            'verify'
        );
    });
});
```
설정 함수에서 목과 스텁을 설정하면 테스트 내에서는 해당 객체를 어디서 만들었는지 찾을 수 없다.   
따라서 테스트를 읽는 사람은 모의 객체가 사용되고 있다는 사실이나 모의 객체가 어떤 값이나 동작을 수행하는지 알지 못할 수 있다.

하나의 파일 내에 여러 테스트가 있을 때, 여러 목과 스텁을 사용하면 초기화 함수가 모든 테스트에서 사용되는 상태를 처리하는 곳이 되어 버린다. 

**목은 테스트 내에서 직접 초기화하고 모든 기댓값을 설정하는 것**이 가독성에 좋다.

```js
describe('password verifier', () => {
    test('verify, with logger & passing, calls logger with PASS', () => {
        const mockLog = Substitute.for<IComplicatedLogger>(); // 테스트 내에서 목 초기화

        const verifier = new PasswordVerifier2([], mockLog);
        verifier.verify('anything');

        mockLog.received().info(
            Arg.is(x => x.includes('PASSED')),
            'verify'
        );
    });
});
```

여기서 유지 보수성을 조금 더 신경 쓴다면 팩토리 함수를 만들어 목을 생성하고 여러 테스트에서 사용할 수 있도록 리팩터링 할 수 있다.

```js
describe('password verifier', () => {
    test('verify, with logger & passing, calls logger with PASS', () => {
        const mockLog = makeMockLogger(); // 팩토리 함수를 사용해 mockLog() 모의 함수를 생성

        const verifier = new PasswordVerifier2([], mockLog);
        verifier.verify('anything');

        mockLog.received().info(
            Arg.is(x => x.includes('PASSED')),
            'verify'
        );
    });
});
```

유지 보수성을 높이기 위해 테스트마다 팩토리 함수를 사용하고, `beforeEach()` 같은 초기화 함수는 전혀 사용하지 않아도 문제가 없다.


## Advantages
<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->
- 테스트 가독성을 높여 몇년 후에 처음 보는 사람이 읽어도 이해할 수 있는 테스트를 작성할 수 있다.

## Disadvantages 
<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case
<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->



## Wrap-up
<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->
- 단위 테스트 이름에는 작업 단위의 진입점, 테스트 상황, 종료점이 실행해야하는 동작을 포함해야한다.
- 테스트 내 사용하는 변수는 매직 넘버를 지양한다.
- 테스트의 검증과 실행 단계를 분리해야한다.
- 테스트의 준비 단계에서는 `beforeEach()` 등의 초기화 함수보다 팩토리 함수를 사용하는 것이 가독성을 높인다.