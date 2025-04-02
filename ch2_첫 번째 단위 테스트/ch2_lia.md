<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 2장 첫 번째 단위 테스트

## Summary

제스트로 기본적인 테스트 작성하는 방식, 제스트 함수 사용해서 코드 리팩토링하는 과정을 보여준다.

## Concept

### 준비-실행-검증 패턴 (AAA)

; 테스트를 구조적으로 작성할 수 있도록 도와주는 패턴.
이 패턴을 사용하면 모든 테스트를 간단하고 일관된 방식으로 작성할 수 있음

### 네이밍 방식 - USE 전략

- 테스트코드 이름을 지을 때 고려해야할 세 가지 주요 요소

1. Unit: 테스트하려는 대상
2. Senario: 입력 값이나 상황에 대한 설명
3. Expectation: 기대값이나 결과에 대한 설명
   ‘테스트 대상을 명시하고, 어떤 입력이나 상황이 주어지면 어떤 결과로 이어져야 하는지 간결하고 명확하게 적는다.’

### 제스트 함수, 리팩토링

- desribe()
  - 코드 구조를 좀 더 체계적으로 나누고 관리.
- beforeEach()
  - 각 테스트가 실행되기 전 한번씩 실행. 중복 코드 제거하는데 도움.

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

beforeEach()를 사용하는 것이 중복을 줄여줄 수는 있지만 스크롤 피로감을 줄 수 있고, 이 관점에서는 팩토리 함수를 사용하는게 가독성을 높이고 스크롤 피로감을 줄이는데 도움을 준다.

ide-site/ide-credit 에서 내가 짠 test 코드로 리팩토링을 해보려했으나 중복이 많이 발생한 코드를 못찾음;

ide-site 같은 경우는 beforeEach()를 적절히 사용하고 있는듯함

1. `desribe.each()`: 여러 개의 테스트 그룹을 반복적으로 실행할 때 사용. 주로 같은 테스트 구조를 여러번 반복하고 싶을 때 사용

```
describe.each([
  ['input1', 'expectedOutput1'],
  ['input2', 'expectedOutput2']
])('Test group with %s', (input, expectedOutput) => {
  test(`should return ${expectedOutput} when input is ${input}`, () => {
    expect(myFunction(input)).toBe(expectedOutput);
  });
});
```

-> `input1`과 `input2`를 입력값으로 사용하여 두 개의 테스트 그룹을 생성, 각 그룹마다 같은 테스트 실행

2. `test.each()`: 개별 테스트 케이스를 반복적으로 실행할 때 사용. 주로 동일한 테스트를 여러 번 실행하려고 할 때.

=> `describe.each()`같은 경우는 각 그룹 내에서 `beforeAll`, `beforeEach` 등으로 설정을 공유할 수 있다는 차이가 있는 것 같음

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->
