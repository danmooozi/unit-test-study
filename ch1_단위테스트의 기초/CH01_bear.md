# Chapter1 단위 테스트의 기초

## 1.2 단위테스트의 정의

### 테스트를 작성할 대상

- 주체(subject)
- 시스템(system)
- 테스트 다상(Suite Under Test, SUT)

```text
📚 TIP
SUT는 테스트 중인 주제, 시스템, 테스트의 모음(Suite)을 의미한다. 일부 사람들은 컴포넌트 클래스 코드를 의미하는 CUT(Component, class, code Under Test)라는 용어를 쓰기도 한다. 테스트하고자 하는 주요 대상을 SUT라고 한다.
```

### 작업 단위

- `진입점` -> `종료점`까지, 눈에 띄는 결과가 나타날 때까지 발생하는 모든 작업을 의미한다.
- 함수의 `body` -> 작업 단위 전체나 일부를 의미
- 함수의 `선언과 서명`은 body로의 진입점
- 함수의 `출력이나 실행결과`는 함수의 종료점

## 1.3 진입점과 종료점

- 작업 단위는 진입점과 종료점으로 구성되어있다.
- 작업 단위는 `의미 있는 작업`을 한다.
  - `의미 있는 작업`이란 간단히 값을 반환한느 것부터 상태를 변경하거나 서드 파티 코드를 호출하는 등 뭔가 눈에 띄는 동작을 의미한다.
- 이러한 동작을 `종료점`이라고 한다.

```text
🐻 생각
저희 server의 테스트 코드를 생각해보면 describe가 작업단위이고 test각 각 종료점이 아닐까 싶네용
```

```text
📚 TIP
코드를 작성할 때에는 query와 command가 있다. query는 상태를 변경하지 않고 값만을 변경한다. command는 상태를 변강하지만 값을 반환하지는 않는다. 보통은 둘을 결합해서 사용하지만 두 액션을 분리해서 설계하는 것이 더 나을 때가 많다.

query는 util 함수 같고... command는 흠.. 평소에 잘쓰지 않는 것 같네요. 분리를 해야한다면 모든 함수들을 좀 세분화 하라는 이야기 같아요
```

### 예제 코드

```javascript
let total = 0;

const totalSoFar = () => {
    return total;
}

const logger = makeLogger();

const sum = (numbers) => {
    const [a,b] = numbers.split(',');

    logger.info('this is a very important log output', {
        firstNumWas: a,
        secondNumWas: b
    })

    const result = Number.parseInt(a, 10) + Number.parseInt(b, 10);
    total += result;
    return result;
}
```

위 코드에서는 3가지 종료점이 있다.

1. result를 반환
2. total의 갑 변화
3. logger라는 서드파티 함수 호출

## 1.4 종료점의 유형

위 종료점의 각 유형은

1. undefined가 아닌 값을 반환한다. `(반환 값을 확인)`
2. 호출 전과 후의 상태값이 달라져 **내부 상태를 직접 보지 않고도 확인 가능하다.** `(달라진 상태 값 확인)`
3. 코드 실행 주도권이 없는 서드 파티 함수를 호출한다. `(호출 했는지 확인)`
   - 실행 주도권이 없다는 것은 Logger의 코드를 우리가 작성하지 않은 경우이다.

단위 테스트는 작업 단위를 호출하고 특정 종료점을 테스트 검증을 목표로 사용한다.
최종결과가 테스트가 검증하고자 하는 바와 다르면 단위 테스트는 실패한다.

## 1.5 다른 종료점, 다른 기법

종료점 마다 테스트를 만들어 분리하는 것이 코드 관리 측면에서 유리하고 종료점 종류에 따라 테스트 방법이 다소 다르다.

- **반환값이 있는 종료점**: 작업 단위를 실행하여 진입점을 호출하고 실행 결과 값을 확인
- **상태값을 변경하는 종료점**: 어떤 것을 호출 후 다른 것을 호출하여 확인 혹은 이전에 호출한 것을 다시 호출하여 모든것이 의도대로 흘러갔는지 확인
- **서드파티를 호출하는 종료점**: 모의 객체를 만들어 테스트 결과를 임의로 조작하는 방법

이중 서드파티를 호출하는(모의 객체로 테스트) 종료점이 제일 까다롭다고 한다.

## 1.6 처음부터 테스트코드 작성

```javascript
const sum = (numbers) => {
    const [a,b] = numbers.split(',');
    const result =  parseInt(a) + parseInt(b);

    return result;
}
```

위 코드를 직접 테스트 코드를 작성해보면 프레이워크 없이!

```javascript
const parseInt = () => {
    try{
        const result = sum('1,2');
        if ( result === 3) {
            console.log('parserTest example 1 PASSED');
        } else {
            throw new Error (`arserTest: expected 3 but was ${result}`);
        }
    } catch (e) {
        console.error(e);
    }
}
```
