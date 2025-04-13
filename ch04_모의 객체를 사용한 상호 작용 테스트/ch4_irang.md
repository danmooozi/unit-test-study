<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
>  정리한 챕터나 페이지 등을 자유롭게 기록 

## Summary
<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

## Concept
<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

## Advantages
<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

## Disadvantages 
<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case
<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

- ide에서 자주?? 사용되는 커스텀 훅 하나를 테스트 하고자 한다.
- **DOM 이벤트 (mousedown)**을 감지해서 특정 요소 바깥을 클릭 했을 때 콜백을 실행시키는 훅

```ts
import { useEffect, useRef } from 'react';

export function useOutsideClick(callback: () => void) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
}
```

- useOutsideClick 훅은 DOM 이벤트인 mousedown을 외부에서 발생하는지 감지하고, 외부 요소와의 상호작용을 추적하여 콜백을 실행하는 방식으로 동작, 이처럼 외부 이벤트와 상호작용을 감지하므로 외부로 나가는 의존성이라고 볼 수 있을 것 같음

- 이 의존성을 테스트하기 위해 mock을 사용

- onOutsideClick 함수가 예상대로 호출되었는지 확인하는 것으로, 테스트에서 외부 요소와 상호작용을 제대로 감지하고 반응하는지 검증

```ts
import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useOutsideClick } from '@hooks/useOutsideClick';

const TestComponent = ({ onOutsideClick }: { onOutsideClick: () => void }) => {
  const ref = useOutsideClick(onOutsideClick);

  return (
    <div>
      <div data-testid="outside">Outside</div>
      <div data-testid="inside" ref={ref}>
        Inside
      </div>
    </div>
  );
};

describe('useOutsideClick', () => {
  // mockCallback은 useOutsideClickHook의 외부 의존성을 흉내낸 mock
  // mockCallback이 특정 조건에서 호출되는지, 그렇지 않은지에 대한 검증
  let mockCallback: vi.Mock;

  beforeEach(() => {
    mockCallback = vi.fn();
  });

  test('calls handler when clicking outside', () => {
    const { getByTestId } = render(
      <TestComponent onOutsideClick={mockCallback} />
    );

    fireEvent.mouseDown(getByTestId('outside'));

    // 종료점이 호출되었는지 검증
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('does not call handler when clicking inside', () => {
    const { getByTestId } = render(
      <TestComponent onOutsideClick={mockCallback} />
    );

    fireEvent.mouseDown(getByTestId('inside'));

    // 종료점이 호출되지 않았는지 검증
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
```



## Wrap-up
<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->