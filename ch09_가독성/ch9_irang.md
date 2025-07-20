<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

테스트 이름을 짓는 규칙과 입력 값을 어떻게 정하는지, 테스트를 효과적으로 구성하는 방법에 대해 소개하는 챕터이다.

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

### 단위 테스트 이름을 짓는 요령

이름을 짓는 기준은 테스트를 명확히 설명하는 데 중요한 역할을 함.

테스트 이름 작성 시, 포함되어야 하는 세 가지 중요한 정보

- 작업 단위의 진입점 (혹은 현재 테스트 중인 기능 이름)
- 진입점을 테스트하는 상황
- 작업 단위의 종료점이 실행해야 하는 동작

필수 정보 세가지를 포함해야하는 이유

- 하나라도 빠지면 테스트를 읽는 사람은 테스트를 이해하기 위해 테스트 코드를 읽어야 하는 번거로움이 있기 때문
- 테스트를 실패 시, 보통 표시되는 유일한 정보는 테스트 이름, 디버깅 시간과 코드를 읽는 시간을 훨씬 절약할 수 있기 때문
- 테스트 이름은 문서 역할도 할 수 있어 팀에 새로운 합류한 사람에게 도움이 되기 때문

### 단위 테스트 입력 값을 정하는 요령

하드코딩 된 값, 기록에 남지 않는 값, 명확하게 이해되지 않는 사우나 변수를 매직넘버라고 함.
매직이라는 표햔은 마치 마법처럼 작동은 하지만 왜 동작하는지는 알 수 없다는 의미로 쓰임.

```js
// 다음의 예제에는 세 가지 매직 넘버가 존재
describe("password verifier", () => {
  test("on weekends, throws exceptions", () => {
    expect(() => verifyPassword("jhGGu78!", 0, [])).toThrowError(
      "It's the weekend!"
    );
  });
});
```

verifyPassword 함수를 잘 모르고 이 테스트 코드를 작성하지 않은 사람이 코드를 읽었을 때
첫번째 인수는 비밀번호 같지만 왜 이 비밀번호일까?, 다른 곳에서도 이 비밀번호를 써야하는가? 등의 궁금증이 있을거고
두번째 인수는 빈 배열이 어떤 역할을 하는지 알기 위해 함수의 구현부를 확인해야하는 번거로움이 있음.
마지막 인수도 마찬가지로 0은 여러가지 의미로 해석될 수 있어 구현부를 확인해야 함.

그렇다면 어떻게 이 매직 넘버들을 수정해야하는가?

```js
// 매직 넘버 -> 의미있는 변수로 대체
// 비밀번호 값은 직접적인 값인 anything으로 변경하여 맥락 상 아무거나라는 의미가 전달 될 수 있도록 변경

describe("verifier2- dummy object", () => {
  test("on weekends, throws exceptions", () => {
    const SUNDAY = 0;
    const NO_RULES = [];

    expect(() => verifyPassword("anything", SUNDAY, NO_RULES)).toThrowError(
      "It's the weekend!"
    );
  });
});
```

### 테스트를 효과적으로 구성하는 방법

1. 검증과 실행 단계분리

가독성 측면에서 검증 단계와 실행 단계를 한 문장에 넣지 않아야 함.

```js
// 다음의 예제에서 첫번째 예제는 한 문장으로
// 두번째 에제에세는 여러 문장으로

expect(verifier.verify("any value")[0].toContain("fake reason")); // 검증 및 실행단계

const result = verifier.verify("any value"); // 검증단계
expect(result[0]).toContain("fake reason"); // 실행단계
```

사소해보일지라도 두번째 예제가 첫번째 예제보다 디버깅하기 훨씬 쉬우며 테스트에서 읽고 이해하기 훨씬 쉬움.

2. 초기화 및 설정해제

단위 테스트에서 초기화와 해제 함수는 남용되기 쉬움.
이는 테스트에 필요한 초기 설정이나 테스트가 끝난 후 목을 다시 초기화하는 등 해제 작업의 가독성을 떨어뜨린다고 함.

```typescript
// 다음은 beforeEach 함수를 사용하여 목을 설정하는 예제
// 지금은 테스트 코드를 이해하는 큰 무리는 없지만
// 이 파일에 beforeEach에서 초기화한 mockLog()함수를 사용하는 테스트가 수십 개 있다고 했을 때
// 이게 어디서 초기되었고 어떻게 동작할까? 라는 생각이 들 수 있음.

describe("password verifier", () => {
  let mockLog;

  beforeEach(() => {
    mockLog = Substitute.for<IComplicatedLogger>();
  });

  test("verify, with logger & passing, calls logger with PASS", () => {
    const verifier = new PasswordVerifier2([], mockLog);
    verifier.verify("anything");

    mockLog.received().info(
      Arg.is((x) => x.includes("PASSED")),
      "verify"
    );
  });
});
```

그래서 결론적으로는 목은 테스트 내에서 직접 초기화하고 모든 기댓값을 설정하는 것이 훨씬 가독성이 좋다고 함.
아래의 예제는 위의 코드를 리팩토링한 코드

```js
// 테스트 내에서 초기화 하여 목이 언제 생성되는지 어떻게 동작하는지 등 필요한 모든 것을 한눈에 알 수 있음.
// 앞에서 배운 유지보수성을 조금 더 신경쓰고자 팩토리 함수를 활용하여 목을 생성

describe("password verifier", () => {
  test("verify, with logger & passing, calls logger with PASS", () => {
    const mockLog = makeMockLogger();

    const verifier = new PasswordVerifier2([], mockLog);
    verifier.verify("anything");

    mockLog.received().info(
      Arg.is((x) => x.includes("PASSED")),
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

사내에서 사용되는 쿠폰 기능과 비슷한 비즈니스 로직을 작성하고
해당 로직을 테스트하는 코드에 발표 주제를 적용시켜 보았음.

### 예시 코드: 쿠폰 적용 관련 로직

```typescript
const applyCoupon = async (code: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code === "WELCOME_UNIT_TEST") {
        resolve(true);
      } else {
        reject(new Error("유효하지 않은 쿠폰입니다."));
      }
    }, 1000);
  });
};

export const useCouponMutation = () => {
  return useMutation<boolean, Error, string>({
    mutationFn: (code: string) => applyCoupon(code),
  });
};

describe("useCouponMutation", () => {
  const VALID_COUPON_CODE = "WELCOME_UNIT_TEST";
  const INVALID_COUPON_CODE = "INVALID_CODE";
  const EXPECTED_ERROR_MESSAGE = "유효하지 않은 쿠폰입니다.";

  it("should return true when applying a valid coupon code", async () => {
    const { result } = renderHook(() => useCouponMutation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(VALID_COUPON_CODE);
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toBe(true);
  });

  it("should return error message when applying an invalid coupon code", async () => {
    const { result } = renderHook(() => useCouponMutation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(INVALID_COUPON_CODE).catch(() => {});
    });
    await waitFor(() => result.current.isError);

    expect(result.current.error?.message).toBe(EXPECTED_ERROR_MESSAGE);
  });
});
```

단위 테스트 이름에 진입점, 상황, 종료점이 실행해야하는 동작을 포함시켜 작성을 해보았는데
나는 보통 테스트 이름을 작성할 때, `should_기대결과_When_테스트상태` 형식으로 작성을 많이 하는 편임.
그 밖에도 책에서 언급한 `메서드명_테스트상태_기대결과` 그리고 `메소드명*기대결과*테스트상태` 등 다양한 형식이 많은편인데
테스트 코드에 대한 컨벤션도 추가되면 좋을 것 같음. 그런데 console 코드에서는 한 형식으로 잘 통일되어 있는 것 같음.

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 테스트 이름을 지을 때는 진입점, 현재 무엇을 테스트하려고 하는가? 그리고 어떤 결과가 나와야하는지에 대한 정보가 포함되어야 함.
- 매직 넘버를 사용하는 대신 의미 있는 이름의 변수로 감싸거나 문자열인 경우에는 값 자체의 의미가 포함되어야 함.
- 검증과 실행 단계를 분리해야 함.
- 가급적 beforeEach()와 같은 초기화 함수를 사용하는 편을 지양해야 함.
