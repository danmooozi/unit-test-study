<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 정리한 챕터나 페이지 등을 자유롭게 기록

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

비동기 코드를 테스트 하는 방법과 타이머, 일반적인 이벤트를 테스트 하는 방법에 대해 소개한다.

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

### 비동기 코드를 테스트 하는 방법

`1. 통합 테스트를 이용한 예시`

`콜백을 사용한 예시`

- 콜백 함수가 종료점인 함수를 테스트하기 위해 콜백함수를 전달
- 테스트가 끝남을 알리기 위해 done() 함수를 호출

```js
const isWebsiteAliveWithCallback = (callback) => {
  const website = "https://www.google.com";
  fetch(website)
    .then((response) => {
      if (response.ok) {
        callback({ success: true, status: "ok" });
      } else {
        callback({ success: false, status: "text missing" });
      }
    })
    .catch((error) => {
      callback({ success: false, status: error });
    });
};

test("NETWORK REQUIRED (callback): correct content, true", (done) => {
  samples.isWebsiteAliveWithCallback((result) => {
    expect(result.success).toBe(true);
    expect(result.status).toBe("ok");
    done();
  });
});
```

> [!NOTE] done 콜백의 역할
>
> 제스트에서 done은 비동기 코드가 완료되었음을 제스트에게 알리는 콜백 함수
> done이 호출될 때까지 테스트를 완료하지 않고 기다림.
> done이 호출되지 않으면 기본 타임아웃 후에 테스트는 실패함.

`async/await을 사용한 예시`

- 진입점이 곧 종료점

```js
const isWebsiteAliveWithAsyncAwait = async () => {
  try {
    const website = "https://www.google.com";
    const response = await fetch(website);

    if (!response.ok) {
      throw response.statusText;
    }

    const text = await response.text();
    const included = text.includes("illustrative");

    if (included) {
      return { success: true, status: "ok" };
    }

    throw "text missing";
  } catch (error) {
    return { success: false, status: error };
  }
};

test("NETWORK REQUIRED (await): correct content, true", async () => {
  const result = await samples.isWebsiteAliveWithCallback();
  expect(result.success).toBe(true);
  expect(result.status).toBe("ok");
});
```

But, 통합 테스트의 한계점이 존재

- 긴 실행 시간
- 불안정성
- 테스트와는 관계없는 코드나 환겸 검증
- 긴 디버깅 시간
- 상황 재현의 어려움
- 낮은 신뢰성

<br />

`2. 단위 테스트를 이용한 예시`

위의 코드를 단위 테스트로 테스트 하기 위한 패턴

- 진입점 분리 패턴

비동기 부분은 그대로 두고 비동기 작업이 끝났을 때 호출되는 콜백을 새로운 함수로 분리

`콜백을 사용한 진입점 분리`

```js
const isWebsiteAlive = (callback) => {
  const website = "https://www.google.com";

  fetch(website)
    .then(throwOnInvalidResponse)
    .then((response) => response.text())
    .then((text) => {
      processFetchSuccess(text, callback);
    })
    .catch((error) => {
      processFetchError(error, callback);
    });
};

const throwOnInvalidResponse = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
};

// 비동기 작업의 성공을 처리
const processFetchSuccess = (text, callback) => {
  const included = text.includes("illustrative");

  if (included) {
    callback({ success: true, status: "ok" });
  } else {
    callback({ success: false, status: "text missing" });
  }
};

// 비동기 작업의 실패를 처리
const processFetchError = (error, callback) => {
  callback({ success: false, status: error });
};

// 새로운 진입점을 실행하는 단위 테스트
// 신뢰성 확보를 위해 새로 생긴 진입점 간에 제대로 작동하는지 확인하기 위해서는 통합 테스트가 최소 한 개는 필요
describe("Website alive checking", () => {
  test("content matches, return true", (done) => {
    samples.processFetchSuccess("illustrative", (result) => {
      expect(result.success).toBe(true);
      expect(result.status).toBe("ok");
      done();
    });
  });

  test("content does not match, return false", (done) => {
    samples.processFetchSuccess("bad content", (result) => {
      expect(result.status).toBe("text missing");
      done();
    });
  });

  test("When fetch fails, return false", (done) => {
    samples.processFetchError("error test", (result) => {
      expect(result.status).toBe("error test");
      done();
    });
  });
});
```

`await를 사용한 진입점 분리`

```js
const isWebsiteAlive = async () => {
  const website = "https://www.google.com";

  try {
    const response = await fetch(website);
    throwIfResponseNotOk(response);
    const text = await response.text();
    return processFetchContent(text);
  } catch (error) {
    return processFetchError(error);
  }
};

const throwIfResponseNotOk = (response) => {
  if (!response.ok) {
    throw response.statusText;
  }
};

// 콜백 함수를 호출하는 대신 값을 반환
// async/await를 사용하는 코드 작성의 일반적인 패턴
const processFetchContent = (text) => {
  const included = text.includes("illustrative");

  if (included) {
    return { success: true, status: "ok" };
  }

  return { success: false, status: "text missing" };
};

const processFetchError = (error) => {
  throw error;
};

describe("Website  up check", () => {
  test("on fetch success with good content, return true", async () => {
    const result = await samples.processFetchContent("illustrative");
    expect(result.success).toBe(true);
    expect(result.status).toBe("ok");
  });

  test("on fetch success with bad content, return false", async () => {
    const result = await samples.processFetchContent("text not on site");
    expect(result.success).toBe(false);
    expect(result.status).toBe("text missing");
  });

  test("on fetch fail, throws", async () => {
    await expect(samples.processFetchError("error text")).rejects.toThrowError(
      "error text"
    );
  });
});
```

- 어댑터 분리 패턴

의존성으로 있던 비동기 코드를 분리하여 어댑터로 감싸고, 이를 다른 의존성처럼 주입할 수 있게 하는 방식

```js
// network-adapter.js
// 네트워크 모듈은 프로젝트에서 node-fetch를 가져오는 유일한 모듈로 의존성이 변경되면 이 파일만 수정하면 된다는 의미
const fetch = require("node-fetch");

const fetchUrlText = async (url) => {
  const response = await fetch(url);

  if (response.ok) {
    const text = await response.text();

    return { ok: true, text };
  }

  return { ok: false, text: response.statusText };
};
```

`함수형 어댑터`
어댑터를 함수형 접근방식으로 사용하는 예시

```js
// website-verifier.js
// 네트워크 모듈을 함수의 매개변수로 주입
// 테스트코드에서는 이 매개변수에 가짜 네트워크 어뎁터를 전달할 수 있음.
const isWebsiteAlive = async (network) => {
  const result = await network.fetchUrlText("https://www.google.com");

  if (result.ok) {
    const text = result.text;
    return onFetchSuccess(text);
  }

  return onFetchError(result.text);
};

// 매개변수에 직접 만든 객체를 주입해서 테스트하는 예시

const makeStubNetworkWithResult = (fakeResult) => {
  return {
    fetchUrlText: () => {
      return fakeResult;
    },
  };
};

describe("unit test website verifier", () => {
  test("with good content, return true", async () => {
    const stubSyncNetwork = makeStubNetworkWithResult({
      ok: true,
      text: "illustrative",
    });
    const result = await webverifier.isWebsiteAlive(stubSyncNetwork);
    expect(result.success).toBe(true);
    expect(result.status).toBe("ok");
  });

  test("with bad content, return false", async () => {
    const stubSyncNetwork = makeStubNetworkWithResult({
      ok: true,
      text: "upexpected content",
    });
    const result = await webverifier.isWebsiteAlive(stubSyncNetwork);
    expect(result.status).toBe("text missing");
  });
});
```

`객체 지향, 인터페이스 기반 어댑터`

위에서 전달하는 매게변수 주입을 생성자 주입 패턴으로 확장

```ts
export interface INetworkAdapter {
  fetchUrlText(url: string): Promise<NetworkAdapterResults>;
}

export interface NetworkAdapterResults {
  ok: boolean;
  text: string;
}

export class NetworkAdapter implements INetworkAdapter {
  async fetchUrlText(url: string): Promise<NetworkAdapterResults> {
    const response = await fetch(url);

    if (response.ok) {
      const text = await response.text();
      return Promise.resolve({ ok: true, text });
    }

    return Promise.reject({ ok: false, text: response.statusText });
  }
}

export class WebsiteVerifier {
  constructor(private network: INetworkAdapter) {}

  isWebsiteAlive = async (): Promise<WebsiteAliveResult> => {
    let netResult: NetworkAdapterResults;
    try {
      netResult = await this.network.fetchUrlText("https://www.google.com");

      if (!netResult.ok) {
        throw netResult.text;
      }

      const text = netResult.text;
      return this.processNetSuccess(text);
    } catch (error) {
      return this.processNetError(error);
    }
  };

  processNetSuccess = (text: string): WebsiteAliveResult => {
    const included = text.includes("illustrative");

    if (included) {
      return { success: true, status: "ok" };
    }

    return { success: false, status: "text missing" };
  };

  processNetError = (error: any): WebsiteAliveResult => {
    return { success: false, status: error };
  };
}

const makeStubNetworkWithResult = (
  fakeResult: NetworkAdapterResults
): INetworkAdapter => {
  const stubNetwork = Subsitute.for<INetworkAdapter>();
  stubNetwork.fetchUrlText(Arg.any()).returns(Promise.resolve(fakeResult));

  return stubNetwork;
};

describe("unit test website verifier", () => {
  test("with good content, return true", async () => {
    const stubNetwork = makeStubNetworkWithResult({
      ok: true,
      text: "illustrative",
    });
    const verifier = new WebsiteVerifier(stubNetwork);

    const result = await verifier.isWebsiteAlive();
    expect(result.success).toBe(true);
    expect(result.status).toBe("ok");
  });

  test("with bad content, return false", async () => {
    const stubNetwork = makeStubNetworkWithResult({
      ok: true,
      text: "upexpected content",
    });
    const verifier = new WebsiteVerifier(stubNetwork);

    const result = await verifier.isWebsiteAlive();
    expect(result.status).toBe("text missing");
  });
});
```

### 타이머를 테스트 하는 방법

`1. 몽키 패칭으로 타이머를 스텁으로 만든다.`

`2. jest에서 제공하는 함수로 setTimeout을 대체한다.`

### 일반적인 이벤트를 테스트 하는 방법

`이벤트 이미터`

- 이벤트 구독 활용하여 테스트

```js
describe("events based module", () => {
  describe("add", () => {
    it("generates addition event when called", (done) => {
      const adder = new Adder();
      adder.add("added", (result) => {
        expect(result).toBe(3);
        done();
      });
      adder.add(1, 2);
    });
  });
});
```

`클릭 이벤트`

- 클릭 이벤트를 트리거 하고 HTML 문서의 변경 사용을 활용하여 테스트

```js
describe("index helper", () => {
  it("vanilla button click triggers changes in result div", () => {
    const { window, button, resultDiv } = loadHtmlAndGetUIElements();

    window.dispatchEvent(new Event("load"));

    button.click();

    expect(resultDiv.innerText).toBe("clicked");
  });
});
```

> [!TIP]
> 웹페이지와 상호작용하는 테스트는 DOM 테스트 라이브러리를 활용하자.

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

- 비동기 코드를 보다 쉽게 테스트할 수 있는 진입점, 어댑터 분리 두 가지 접근 방식에 대해서 알 수 있었음.
- 의존성이 강한 코드를 보다 쉽게 테스트 할 수 있는 구조로 바꿔볼 수 있을 것 같음.

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

```


innerHTML, innerText, textContent 웹 개발에서 자주 사용되는 세 가지 중요한 DOM 속성의 차이점을 테스트 해보고자 테스트를 작성.
텍스트를 읽어오고 설정할 수 있다는 점에서 비슷해보이지만, 조금씩 다른 차이가 존재
```

[https://www.freecodecamp.org/news/innerhtml-vs-innertext-vs-textcontent/]

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Text Content Test</title>
  </head>
  <body>
    <p id="innerHTML-example"><span>Hello</span> <b>World</b></p>
    <p id="innerText-example"><span>Hello</span> <b>World</b></p>
    <p id="textContent-example"><span>Hello</span> <b>World</b></p>
  </body>
</html>
```

```js
import { test, expect } from "@playwright/test";

test.describe("Text Content Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("file://" + process.cwd() + "/src/index.html");
  });

  test("innerHTML은 HTML 태그를 포함한 전체 내용을 반환한다", async ({
    page,
  }) => {
    const innerHTML = await page.$eval(
      "#innerHTML-example",
      (el) => el.innerHTML
    );
    expect(innerHTML).toBe("<span>Hello</span> <b>World</b>");
  });

  test("innerText는 보이는 텍스트만 반환한다", async ({ page }) => {
    const innerText = await page.$eval(
      "#innerText-example",
      (el) => el.innerText
    );
    expect(innerText).toBe("Hello World");
  });

  test("textContent는 모든 텍스트 노드의 내용을 반환한다", async ({ page }) => {
    const textContent = await page.$eval(
      "#textContent-example",
      (el) => el.textContent
    );
    expect(textContent).toBe("Hello World");
  });

  test("innerText와 textContent의 차이를 보여준다", async ({ page }) => {
    // CSS로 숨겨진 요소가 있는 경우
    await page.setContent(`
      <div id="hidden-example"><span>Hello</span> <span style="display: none;">Hidden</span> <b>World</b></div>
    `);

    const innerText = await page.$eval("#hidden-example", (el) => el.innerText);
    const textContent = await page.$eval(
      "#hidden-example",
      (el) => el.textContent
    );

    // innerText는 숨겨진 텍스트를 제외
    expect(innerText).toBe("Hello World");
    // textContent는 숨겨진 텍스트를 포함
    expect(textContent).toBe("Hello Hidden World");
  });
});
```

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

- 테스트 하기 어려운 비동기 코드는 진입점 분리, 어댑터 분리 두 가지 접근 방식을 고려해볼 수 있음.
- 비동기 작업이 끝나고 호출되는 콜백을 별도의 함수로 분리하고 진입점으로 두면 이 함수를 동기적으로 검증할 수 있음.
- 비동기적인 의존성 자체를 분리하고 어댑터로 감싸면 테스트에서 해당 의존성을 가짜로 대체할 수 있음.
- 타이머 함수는 몽키 패칭을 이용하여 직접 교체 또는 제스트와 같은 프레임워크로 제어할 수 있음.
- 이벤트 테스트는 HTML 문서의 변경 사항을 이용하여 검증할 수 있음.
