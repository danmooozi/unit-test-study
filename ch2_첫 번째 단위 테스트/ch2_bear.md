<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!NOTE]
>  Chapter2 72 첫 번째 단위 테스트 72 ~ 116

## Summary
<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

제스트를 이용해서 테스트 하는 방식을 간단하게 설명하고 예제를 말해주고 있다.
describe, it, test, beforeEach, test.each등의 여러 함수들을 설명해주고 있다.
해당 함수들을 사용하면 어떤게 좋아지고 무엇을 주의해야하는지 알려주고 있다.

## Concept
<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->
### 프레임 워크가 제공하는 기능

1. 테스트 코드의 일관성
   - 항상 동일한 방식으로 코드를 작성 가능하다. 또 이미 구조화된 방식으로 테스트를 작성하기에 누구나 쉽게 읽고 이해 할 수 있다.
2. 반복성
   - 새로운 테스트를 작성하는 작업도 쉽게 할 수 있다.
3. 신뢰성과 시간 절약
4. 공동의 이해

### 비밀번호 검증의 예제

```js
const verifyPassword = (input, rules) => {
    const errors = [];
    rules.forEach(rule => {
        const result = rule(input);

        if (!result.passed) {
            errors.push(`error ${result.reason}`)
        }
    })
    return errors;
}
```

### USE 전략

테스트 코드의 이름이 너무 불친절 -> 제목만 읽어도 무엇을 테스트 하려는지 알게 해야함

- 테스트 하려는 대상 (Unit: 지금은 verifyPassword 함수)
- 입력 값이나 상황에 대한 설명 (Senario: 결과로 false를 반환하는 상황)
- 기대값이나 결과에 대한 설명 (Expectation: 에러 메세지를 반환)

위를 사용하면 아래와 같이 바뀐다.
- badly named test -> `verifyPasswor, given a failing rule, returns errors`

### 문자열 비교와 유지 보수성

- 문자열을 검증할 경우는 toMatch에 정규 표현식을 넣거나 toContain을 사용해서 비교할 수 있다고 생각
- 문자열이 가지고 있는 것이 의미가 중요한 것이라면 띄어쓰기나 마침표에 따라서 결과가 달라지는 것은 유지보수성과 불안정성을 높인다.

### describe 함수

- describe 함수를 통해 구역을 나눌 수 있다.
- 가독성 측면에서 논리적인 영역의 역할을 하기도 하지만 기능적으로도 독립적인 테스트 환경을 보장해 준다.
- describe를 사용해서 위 의 USE 전략을 하나씩 나눌 수도 있다.
  - decribe (Unit)
    - describe (Senario)
      - test (expectation)
- 위와 같이 중첩구조를 사용하면 특정 시나리오 내에서 여러 기대 동작들을 테스트 할 수 있다.
  - 위에서 test를 여러개 둘 수 있다는 말
  
### it 함수

- test 함수의 별칭이라고 말할 수 있다.
- 그저 더 가독성을 높이기 위한 함수임으로 쓸지 말지는 우리의 몫이다.

### verifyPassword() 함수 리팩터링 및 테스트 코드 변경

```js
class PasswordVerifier1 {
    constructor() {
        this.rules = [];
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    verify(input) {
        const errors = [];
        this.rules.forEach((rule)=> {
            const result = rule(input);
            if(result.passed === false) {
                errors.push(result.reason);
            }
        })
        return errors;
    }
}
```

- 위와 같이 변경 된 이후에는 addRule과 verify의 함수 모두 호출해야 테스트가 가능해진다.

```js
describe('PasswordVerifier', () => {
    describe('with a failing rule', () => {
        it('has an error message based on the rule reason', () => {
            const verifier = new PasswordVerifier1();
            const fakeRule = () => ({
                passed: false,
                reason: 'fake reason'
            })

            verifier.addRule(fakeRule);
            const errors = verifier.verify('any value');

            expect(errors[0]).toContain('fake reason')
            // 여기에서 오류가 하나만 있음을 검증하고 싶다면
            expoet(errors.length).toBe(1);
        })
    })
})
```

- 하지만 위와 같이 했을 경우에는 첫 번쨰 검증이 실패가 되게 되면 두번째 검증은 실행되지 않는다.
- 이럴 경우에는 테스트 케이스를 분리하고 이름을 따로 붙이는 것이 낫다.

```js
describe('PasswordVerifier', () => {
    describe('with a failing rule', () => {
        it('has an error message based on the rule reason', () => {
            const verifier = new PasswordVerifier1();
            const fakeRule = () => ({
                passed: false,
                reason: 'fake reason'
            })

            verifier.addRule(fakeRule);
            const errors = verifier.verify('any value');

            expect(errors[0]).toContain('fake reason')
        })

        it('has exactly one error', () => {
            const verifier = new PasswordVerifier1();
            const fakeRule = () => ({
                passed: false,
                reason: 'fake reason'
            })

            verifier.addRule(fakeRule);

            expoet(errors.length).toBe(1);
        })
    })
})
```

- 하지만 이렇게 되면 보다시피 중복 코드가 많아진다 이럴때 `beforeEach()`를 사용해 보자

### beforeEach() 함수 사용

  - `beforeEach()`는 각 테스트가 실행되기 전에 한 번씩 실행되는 함수다.

```js
describe('PasswordVerifier', () => {
    let verifier;
    
    beforeEach(() => {
        verifier = new PasswordVerifier1();
    })

    describe('with a failing rule', () => {
        let fakeRule, errors;

        beforeEach(() => {
            fakeRule = () => ({ passed: false, reason: 'fake reason'});
            verifier.addRule(fakeRule)
        })

        it('has an error message based on the rule reason', () => {
            const errors = verifier.verify('any value');

            expect(errors[0]).toContain('fake reason')
        })

        it('has exactly one error', () => {
            verifier.addRule(fakeRule);

            expoet(errors.length).toBe(1);
        })
    })
})
``` 

- 이렇게 하면 함수가 짧아지고 가독성이 좋아진다.
- 다만 여기에서 주의 해야하는 부분들이있는데 `beforeEach()`로 선언한 부분들은 전역변수(?)와 같은 느낌이기에 변경이 되게 되면 다른 모든 곳에서 영향을 받게 된다.
- 제스트는 병렬수행을 하기 때문에 verifier 처럼 여러 곳에서 접근 가능한 변수를 두는 상태 기반 테스트는 잠재적으로 문제가 될 수 있다.

### beforeEach와 스크롤 피로감

- beforeEach를 사용하면 많은 중복 코드를 줄일 수 있다.
- 다만 시나리오와 테스트가 많아지는경우 초기화 부분을 찾으려 많은 스크롤을 올려야하는 스크롤 피로감을 느낄 수 있다.

### 팩토리 함수 사용

- 객체나 특정 상태를 쉽게 생성하고, 여러 곳에서 동일한 로직을 재사용 할 수 있도록 도와주는 간단한 헬퍼 함수이다.

```js
const makeFailingRule = (reason) => {
    return () => {
        return { passed: false, reason: reason }
    }
}

const makePassingRule = () => {
    return () => {
        return { passed: true, reason: ''}
    }
}
```

- 위와 같이 실패하는 rule과 성공하는 rule을 만드는 함수를 통해서 만들게 되면 초기화를 어디서 하는지 위로 스크롤 하지 않아도 함수명을 토대로 가독성이 좋아질 수 있다.
- it/test 함수 내에서 모든 정보를 파악 할 수 있다는 점에서 좋다.

### 다양한 입력 값을 받는 테스트

- 지금까지와는 다른게 여러 입력 테스트를 하고 싶으면 `.each()`를 사용하면 된다.
  
```js
describe('one uppercase rule', () => {
    test.each([
        ['Abc', true],
        ['aBc', true],
        ['abc', false]
    ])('given %s %s', (input, expected) => {
        const result = oneUpperCaseRule(input);
        expect(result.passed).toEqual(expected)
    })
})
```

- 위와 같이 하면 여러 입력을 배열을 통해 테스틑 할 수 있다.
- 하지만 위와 같이 하면 true 인 경우와 false인 경우를 동일하게 하는 것보다 둘을 분리해서 성공하는 경우와 실패하는 경우를 나누는게 나을 것 같다.

### 예정된 오류가 발생하는지 확인

- 에러가 발생하는지 확인하는 방법은 .toThrowError()를 사용하면 된다.


## Advantages
<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

### 팩토리 함수

- 지금까지 beforeEach만을 사용하고 있었던 것 같은데 테스트 파일이 길 경우에는 팩토리 함수를 사용해 보는 것도 좋아보인다.

## Disadvantages 
<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

### 문자열 비교

- 에러 메세지를 비교를 한다면 toMatch나 toContain을 사용하는것이 괜찮아 보이지만
- 우리 코드에서는 메세지를 테스트 하는 경우는 많이 없다고 생각이 됨.
- 서비스 코드에서 문자열을 비교하는건 다소 불편하지 않을까 생각이 들긴함
  - 에러코드나 에러타입으로 비교하는게 좋다고 생각함

## Example Case
<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

## Wrap-up
<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 프레임 워크를 이용해 테스트 코드를 작성하게 되면 여러 측면에서 도움이 된다.
- test를 설명할 때는 USE 패턴을 이용하는게 좋다.
- beforeEach를 통해 중복되는 함수를 줄일 수 있다.
  - 하지만 테스트가 많아지면 스크롤 피로감이 생길 수 있다.
- 위 문제를 팩토리 함수를 통해 해결 가능하다.
- 입력이 다른 반복적인 테스트를 위해서는 test.each를 사용할 수 있다.
  - 다만 테스트를 일반화 할 수록 가독성이 다소 떨어질 수 있다.
  - 이 때 입력값만을 배열로 사용하고 결과 값이 다르면 별도의 테스트로 작성하는게 좋다.

