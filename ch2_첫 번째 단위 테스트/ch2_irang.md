## Summary

- 제스트는 검증, 러너, 리포터 역할을 수행할 수 있는 테스트 라이브러리이다.
- AAA패턴은 테스트를 단순하고 일관된 구조로 작성할 수 있도록 도와주는 패턴이다.
- 테스트 이름을 지을 때는 테스트 대상을 명시하고, 어떤 입력이나 상황이 주어지면 어떤 결과로 이어져야 하는지 간결하고 명확하게 짓는다.
- 제스트에서는 test, description, it, berforEach 함수 등 다양한 함수를 제공하여 조금 더 구조화된 테스트 코드를 작성할 수 있게 도움을 준다.

## Concept

### 테스트 코드 작성

`AAA패턴`으로 작성하면 테스트를 단순하고 일관된 구조로 작성할 수 있으며 AAA패턴은 다음과 같이 3가지로 구분할 수 있다.

**Arrange**(준비)

- 테스트 대상 시스템과 해당 종속성을 원하는 상태로 설정한다.

**Act**(실행)

- 메서드를 호출하고 필요한 데이터를 전달하며 결과 값이 있다면 확인한다.

**Assert**(검증)

- 결과를 검증한다.


> ℹ️ ***Given-When-Then 패턴***
> 
> AAA패턴과 유사하며 우리나라에서는 Given-When-Then 패턴으로 더 널리 알려져 있다.
> 개인적인 생각으로는 AAA 패턴은 개발자 지향적인 워딩이라고 생각되어 비 개발자와 공유하는 테스트에는 GWT패턴을 쓰는게 더 적합할 것 같다.

### 테스트 이름 짓기

USE전략으로 이름을 지을 때 고려해야 할 세가지 주요 요소는 다음과 같다.

**Unit under test**(대상)

- 테스트하려는 대상

**Scenario**(시나리오)

- 입력 값이나 상황에 대한 설명

**Expectation**(기대 동작)

- 기댓값이나 결과에 대한 설명

## Advantages
<code style="color: gray">발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다.</code>

## Disadvantages
<code style="color: gray">발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다.</code>

## Wrap-up

- 테스트 코드 작성 시 일관된 구조로 작성하고자 한다면 AAA패턴을 고려해볼 수 있다.
- 테스트 이름 작성 시에는 USE 전략을 고려해볼 수 있다.
- 제스트에서 제공하는 다양한 함수를 활용한다면 더 구조화된 방식으로 코드를 작성할 수 있다.

## 기억에 남는 것

- AAA 패턴

다음과 같이 `증가`라는 버튼을 클릭했을 때, 숫자를 `1씩 늘려주는` 어플리케이션이 있다고 가정해보자.

```tsx
"use client";

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

간단하게 AAA패턴에 맞춰 테스트 코드를 작성 해본다면 아래와 같은 구조로 작성 해볼 수 있지 않을까? 

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from '@/components/Counter';

test('버튼 클릭 시 카운트 증가', async () => {
  // 1️⃣ Arrange
  render(<Counter />);
  const button = screen.getByRole('button', { name: /증가/i });

  // 2️⃣ Act
  await userEvent.click(button);

  // 3️⃣ Assert
  expect(await screen.findByText(/카운트: 1/i)).toBeInTheDocument();
});
```

- USE 전략 및 문자열 비교와 유지 보수성

```tsx
describe('genStyledComponent function', () => {
  it('should throw an error if tag is not defined', () => {
    expect(() => {
      genStyledComponent();
    }).toThrow('Define tag to create styled component');
  });
});
```

위 테스트 코드는 이미 정의되어 있는 스타일이 포함된 React element를 생성하는 함수를 테스트하는 코드이다. 여기서 USE 전략에 따라 구분 짓는다면 대상은 genStyledComponent함수 시나리오는 if tag is not defined, 기대 동작은 should throw an error 으로 테스트 코드 이름이 나름 친절한?것 같다. 다만 수정해볼 부분이 있다면 문자열을 비교하는 부분이다.

책에서는 문자열 비교 시 정규 표현식을 사용하거나 toContain()메서드로 거짓 양성을 낮춰야 한다고 이야기(p88)하는데 이 부분에서 공감이 많이되어 앞으로의 문자열 비교는 메시지가 담고 있는 의미가 같다면 테스트 결과에 영향을 주지 않는 방향으로 작성하게 될 것 같다.