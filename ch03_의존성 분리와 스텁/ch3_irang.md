<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
>  정리한 챕터나 페이지 등을 자유롭게 기록 

## Summary
<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->
- 스텁은 내부 의존성을 흉내 내는데 사용할 수 있고 목은 외부 의존성을 흉내 내고 검증하는데 사용 할 수 있다.
- 스텁을 활용하면 항상 동일한 결과를 보장할 수 있다.

## Concept
<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

코드에서 의존하는 외부요소를 `의존성`이라고 한다.

의존성 유형
- 외부로 나가는 의존성
    - 종료점을 나타내는 의존성
    - 특정 논리 흐름의 끝 (DB 저장, 이메일 발송)
- 내부로 들어오는 의존성
    - 종료점을 나타내지 않는 의존성
    - 이전 작업의 결과 (DB 쿼리 결과, 네트워크 응답 결과)


<br /> <br />
테스트에서 실제 의존성을 대체하거나 모방하는데 사용되는 다양한 패턴에 대한 정의
| 카테고리 | 패턴 | 목적 | 사용법 |
| ----- | -------- | ---- | -------- |
|  | 테스트 더블 | 스텁과 목을 포함한 일반적인 이름 | 페이크라기도 함 |
| 스텁(stub) | 더미 객체 | 테스트에서 사용될 값을 지정하는데 사용 | 진입점에 매개변수로 보내거나 준비 단계에서 사용 |
| 스텁(stub) | 테스트 스텁 | 다른 소프트웨어 구성 요소의 간접 입력에 의존할 때 독립적으로 로직을 검증하는데 사용 | 의존성으로 주입하고 SUT에 특정 값이나 동작을 반환하도록 구성|
| 목(mock) | 테스트 스파이 | 다른 소프트웨어 구성 요소에 간접 출력을 보낼 때 독립적으로 로직을 검증하는데 사용 | 실제 객체의 메서드를 오버라이드하고, 함수가 예상대로 호출되었는지 확인|
| 목(mock) | 모의 객체 | 다른 소프트웨어 구성 요소에 대한 간접 출력에 의존하는 경우 독립적으로 로직을 검증하는데 사용 | 가짜 객체를 SUT 의존성으로 주입하고, 가짜 객체가 예상대로 호출되었는지 확인 |

요약하자면,
`스텁`은 내부로 들어오는 의존성을 끊을 때 사용
- 가짜 모듈이나 객체, 데이터를 내부로 보내는 가짜 함수
`목`은 외부로 나가는 의존성을 끊을 때 사용
- 가짜 모듈이나 객체 및 호출 여부를 검증하는 함수
- 단위 테스트에서 종료점을 나타내면 하나의 테스트에서는 하나만 사용하는 것 일반적



스텁을 사용해야하는 이유
날짜/시간을 다루는 라이브러리에 직접 의존하여 특정 요일에만 동작하는 예시 코드를 보여줌.
-> 좋은 테스트 코드 기준에 위반
-> 좋은 테스트 코드는 `언제 실행하든 항상 동일한 결과`를 보장해야함


일반적으로 스텁을 사용하는 설계 방식
- 함수를 사용한 방식
- 모듈을 이용한 방식
- 객체 지향을 이용한 방식



함수를 사용한 방식
- 단순 데이터 조각을 매개변수에 주입 하는 예시
    - 시간 값의 통제권을 함수 호출자에게 전달하는 것으로 변경
    - 이 전달하는 것이 더미지만 스텁이라고도 함
    - 이 간단한 수정만으로도 아래의 장점을 가질 수 있음.
    - 테스트 일관성을 확보
    - 원하는 날짜를 쉽게 설정이 가능
    - verifyPassword 함수가 라이브러리에 대한 의존도가 떨어졌기에 다른 라이브러리 변경 시 최소한의 수정이 가능



```js
const verifyPassword = (input, rules, currentDay) => {
    if ([SATURDAY, SUNDAY].includes(dayOfWeek)) {
        throw Error("It's the weekend!");
    }
    //...
    return [];
}

describe('verifyPassword', () => {
    test('on weekend, throw exceptions', () => {
        expect(() => verifyPassword('anything', [], SUNDAY))
            .thThrowError("It's the weekend!");
    })
})
```

- 함수를 활용한 의존성 주입 예시
    - 자스는 일급 객체라는 특징을 가지기에 가능한 문법
    - verifyPassword 함수를 호출하는 모든 곳에서 어떤 날짜를 전달해야하는지 몰라도 된다는 장점

```js
const verifyPassword = (input, rules, getDayFn) => {
    const dayOfWeek = getDayFn(); // 데이터를 반환하는 함수를 매개변수로 전달 받음.

     if ([SATURDAY, SUNDAY].includes(dayOfWeek)) {
        throw Error("It's the weekend!");
    }
    //...
    return [];
}

describe('verifyPassword', () => {
    test('on weekend, throw exceptions', () => {
        const alwaysSunday = () => SUNDAY;

        expect(() => verifyPassword('anything', [], alwaysSunday))
            .thThrowError("It's the weekend!");
    })
})
```

- 고차 함수를 활용한 의존성 주입 예시
    - 함수를 반환하는 함수를 활용한 예시인데 요걸 활용해서 테스트의 준비 단계에서 팩토리 함수를, 실행 단계에서 반환된 함수를 호출하는 상황을 보여줌.
    - 위와 동일하지만 반복되는 부분들을 팩토리 함수로 감싸는 점이 또 다른 장점인 것 같음.


- 자바스크립트 모듈 시스템을 활용한 의존성 주입 예시
    - 외부와 직접적으로 의존을 가진 부분은 해결할 수 있는 방법이 없음.
    - 그러나 `심`이라는 걸로 해당 의존성을 다른 것으로 쉽게 대체할 수 있도록 코드를 작성해야 한다고 함.
    - moment 이라는 모듈을 직접 불러오는 부분을 originalDependencies 객체를 사용해서 직접적인 의존성을 끊어냄
    - dependencies로 실제 의존성도 포함하지만 가짜 의존성도 담을 수 있게 객체를 만듬.
    - 이렇게 봤을 때 비교적 쉽게 의존성 문제를 해결해주긴 하지만 가짜로 만든 의존성에 매우 강하게 묶인다는 단점이 존재 함.
    - 강하게 묶이면 모듈이 바뀔 때 테스트를 전부 수정해야하는 단점이 있음. (아직 이해가 안감)
    - 보통은 이런걸 막기 위해서 `포트`와 `어댑터`를 사용함.
    - 또는 `생성자`나 `인터페이스`를 사용함.
```js
const originalDependencies = {
  moment: require('moment')
}

let dependencies = { ...originalDependencies }; // 실제 의존성과 가짜 의존성을 담는 객체

const inject = (fakes) => {
  Object.assign(dependencies, fakes); // 실제 의존성에 가짜 의존성 추가 
  return function reset() { // 원래 실제 의존성으로 되돌리는 함수
    dependencies = { ...originalDependencies };
  }; 
}

const verifyPassword = (input, rules) => {
  const dayOfWeek = dependencies.moment().day();
  if ([SATURDAY, SUNDAY].includes(dayOfWeek)) {
      throw Error("It's the weekend!");
  }
  //...
  return [];
}

module.exports = { verifyPassword, inject };
```

- 포트
  - 시스템의 내부와 외부를 연결하는 인터페이스
- 어댑터
    - 포트를 통해 들어오는 요청을 처리하는 구체적인 구현체
-> 사용하는 이유는 유연성(외부시스템이 변경되더라도 쉽게 변경이 가능, 어댑터만 바뀌면 됨)    



- 객체 지향적으로 의존성을 주입하는 방법
```js
class PasswordVerifier {
    constructor(rules, timeProvider) {
        this.rules = rules;
        this.timeProvider = timeProvider;
    }

    verify(input) {
        if ([SATURDAY, SUNDAY].includes(this.timeProvider.getDay())) {
            throw new Error("It's the weekend!");
        }
    }
}


import moment from 'moment';

const RealTimeProvider = () => {
    this.getDay = () => moment().day();
}

const passwordVerifierFactory = (rules) => {
    return new PasswordVerifier(new RealTimeProvider()); // PasswordVerifier 클래스에  날짜/시간을 반환하는 걸 의존성으로 주입
}
```
- 이제 이 코드를 실제 테스트 코드에서는 어떻게 사용하는지에 대해서 보여줌.
- 근데 타입에 대해서 관대한 자바스크립트에서 동작할 코드임.

```js
function FakeTimeProvider(fakeDay) {
  this.getDay = function () {
    return fakeDay;
  }
}

describe('verifier', () => {
    test('on weekends, throws exception', () => {
        const verifier = new PasswordVerifier([], new FakeTimeProvider(SUNDAY));
        expect(() => verifier.verify('anything')).toThrow("It's the weekend!");
    });
});
```

- 그 다음은 공통 인터페이스를 추출해서 타입 언어에서도 동작하게 하는 예시를 보여줌.

## Advantages
<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->
- 어떤 식으로 의존성을 대체할 수 있는지 여러 케이스들을 볼 수 있었기에 팀 상황, 현재 프로젝트에 맞는 스텁을 설계할 수 있음.
- 외부와 연결된 직접적인 의존성에 대한 해결방법을 알 수 있었음. 모듈 변경에 따른 코드 변경이 적어짐.

## Disadvantages 
<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case
<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->
- 혼용해서 쓰고 있던 용어를 이제는 구분할 수 있음.
- 3장에서 배웠던 부분들에 대해서 고민해서 코드 작성할 때 설계를 할 것 같음. 결론은 테스트 코드에 용이하게 작성 할 수 있을 것 같음.


## Wrap-up
<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->
- 스텁은 내부로 들어오는 의존성을 끊어줌, 목은 외부로 나가는 의존성을 끊어줌.
- 스텁을 사용하는 방식에는 여러가지가 있고 그 예시를 보여줬음.
- 스텁을 통해 테스트가 불안정해지는 것을 막아주며 일관된 결과를 보장함.
