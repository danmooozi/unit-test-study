<!-- 단순한 책 내용만 정리하는 스터디에서 벗어나 자신의 생각을 정리하고, 그걸 바탕으로 실무에 적용할 수 있는 내용을 찾는 스터디가 되었으면 좋겠습니다. -->
<!-- 참고한 글 - https://tech.kakaopay.com/post/frontend-study-journey/ -->

> [!Note]
> 6장. 비동기 코드 단위 테스트

## Summary

<!-- 한 줄 요약을 통해 발표자는 본인이 주제를 정확하게 이해했는지 점검하고, 스터디원들은 한 눈에 주제를 파악할 수 있습니다. -->

비동기 코드는 그 특성상 단위 테스트를 작성하기 어려운 부분이 있으며, 이를 해결하기 위해 진입점 분리 등의 패턴을 활용할 수 있음. 콜백 방식과 async/await 방식의 차이, 통합 테스트와 단위 테스트의 장단점 및 단위 테스트를 위한 코드 구조 변경 방법에 대해 다룸

## Concept

<!-- 책을 바탕으로 발표 주제의 이론적 개념 및 필요한 배경 지식을 설명합니다. -->

작업이 완료되기까지 기다려야하는 과정이 필요하기 때문에 비동기성은 코드와 그 코드를 테스트하는 과정을 더 까다롭게 만들 수 있음

## 6.1 비동기 데이터 가져오기

예시) example.com이라는 웹사이트가 정상적으로 작동하는지 확인하는 모듈.

이 모듈은 메인 URL에서 콘텐츠를 가져와 ‘예시가 되는’이라는 단어가 포함되어 있는지 확인하여 웹 사이트가 정상인지 판단함.

- 두 가지 방식으로 기능 구현
  1. 콜백 메커니즘
  2. async/await 메커니즘
     여기서 콜백은 다른 유형의 종료점을 가짐
- 예제 웹 사이드에서 콘텐츠를 가져오기 위해 `node-fetch` 라이브러리 사용

```tsx
// 예제6-1) isWebsiteAlibe() 콜백과 async/await 버전
// 콜백 버전
const fetch = require("node-fetch");
const isWebsiteAliveWithCallback = callback => {
	const website = "http://example.com";
	fetch(website)
		.then(response => {
			if (!response.ok) {
				// 이 네트워크 문제를 어떻게 테스트할 수 있을까?
				throw Error(response.statusText); // 예외 처리를 위해 사용자 정의 오류를 던짐
			}
			return response;
		})
		.then(response => response.text())
		.then(text => {
			if (text.includes("illustrative")) {
				callback({ success: true, status: "ok" });
			} else {
				// 이 경로를 어떻게 테스트할 수 있을까?
				callback({ success: false, status: "text missing" });
			}
		})
		.catch(err => {
			// 이 종료점을 어떻게 테스트할 수 있을까?
			callback({ success: false, status: err });
		});
};

// async/await 버전
const isWebsiteAliveWithAsyncAwait = async () => {
	try {
		const resp = await fetch("http://example.com");
		if (!resp.ok) {
			// 비정상적인 응답을 어떻게 테스트할 수 있을까?
			throw resp.statusText; // 예외 처리를 위해 사용자 정의 오류 던짐
		}
		const text = await resp.text();
		const included = text.includes("illustrative");
		if (included) {
			return { success: true, status: "ok" };
		}
		// 다른 웹사이트 콘텐츠를 어떻게 테스트할 수 있을까?
		throw "text missing";
	} catch (err) {
		return { success: false, status: err }; // 오류를 응답으로 감쌈
	}
};
```

→ 연결에 실패하거나 웹 페이지에 텍스트가 없을 때 발생하는 오류를 콜백이나 함수의 반환값으로 변환하여 함수 호출자에 실패를 알려줌

### 6.1.1 통합 테스트를 이용한 첫 시도

콜백 버전에 대한 통합 테스트를 어떻게 작성할 수 있을지,

```tsx
// 예제6-2) 초기 통합 테스트
test("NETWORK REQUIRED (callback): correct content, true", done => {
	samples.isWebsiteAliveWithCallback(result => {
		expect(result.success).toBe(true);
		expect(result.status).toBe("ok");
		done();
	});
});
```

- 콜백 함수가 종료점인 함수를 테스트하려면 직접 작성한 콜백 함수를 전달해야 함.
- 이 콜백 함수에서 전달된 값의 정확성을 확인할 수 있고,
- 테스트 프레임워크가 제공하는 장식을 이용하여 테스트가 끝났음을 알릴 수 있음
  - 제스트는 `done()` 함수 제공

### 6.1.2 작업 기다리기

- 예제 6-2에서 콜백을 종료점으로 사용하기 때문에 테스트는 병렬 실행이 완료될 때까지 명시적으로 기다려야 함.
- (비동기 네트워크 호출(`fetch`)이 **백그라운드에서 실행되기 때문에**, 테스트 함수는 **콜백이 호출될 때까지 기다려야** 합니다.)
- 대부분의 테스트 프레임워크는 이를 위한 특별한 헬퍼 함수를 가지고 있음
- 제스트는 제스트의 테스트 함수 내에서 매개변수로 전달받을 수 있는 done 콜백을 사용하여 **테스트가 done()을 명시적으로 호출할 때까지 기다려야 한다고** 신호를 보낼 수 있음.
- done()이 호출되지 않으면 테스트는 기본적으로 5초 후에 타임아웃되어 실패함(설정 가능)
- (test 함수는 기본적으로 동기 실행을 기대함)

> **done 콜백의 역할
> done 콜백 사용 예제**
>
> ```tsx
> test("async task test (using done)", done => {
> 	// 3초 후에 콜백을 호출하는 비동기 작업
> 	setTeimeout(() => {
> 		expect(true).toBe(true);
> 		done(); // 비동기 작업이 완료되었음을 제스트에 알림
> 	}, 3000);
> });
> ```
>
> `setTimeout`을 사용하여 3초 후에 done을 호출함. 제스트는 done이 호출될 때까지 기다려 비동기 작업이 완료되ㅓㄴ 시점으로 인심함
>
> **done을 사용하지 않는 경우**
>
> done을 사용하지 않으면 제스트는 코드가 실행된 후 즉시 테스트를 완료함
>
> **타임아웃 설정**
>
> 제스트는 비동기 테스트의 타임아웃 시간을 변경할 수 있는 기능을 제공함
>
> ```tsx
> test("async task test (timeout for 10 seconds)", done => {
> 	jest.setTimeout(10000); // 타임아웃ㅇ르 10초로 설정함
>
> 	setTimeout(() => {
> 		expect(true).toBe(true);
> 		done(); // 비동기 작업이 완료되었음을 제스트에 알림
> 	}, 6000);
> });
> ```
>
> → 타임아웃 10초로 설정, 6초 후에 done을 호출하여 테스트가 성공적으로 완료되게 함.

### 6.1.3 async/await를 사용하는 통합 테스트

```tsx
// 예제 6-3) 콜백과 .then()을 사용한 통합 테스트
test("NETWORK REQUIRED (await): correct content, true", done => {
	samples.isWebsiteAliveWithAsyncAwait().then(result => {
		expect(result.success).toBe(true);
		expect(result.status).toBe("ok");
		done();
	});
});
```

→ 테스트 코드 내에서도 await 문법을 사용할 수 있기 때문에, 콜백을 사용하여 테스트를 굳이 복잡하게 만들 필요가 없음.

```tsx
// 예제 6-4) async/await 를 사용한 통합 테스트
test("NETWORK REQUIRED2 (await): correct content, true", async () => {
	const result = await samples.isWebsiteAliveWithAsyncAwait();
	expect(result.success).toBe(true);
	expect(result.sttus).toBe("ok");
});
```

→ 비동기 코드를 사용하여 async/await 문법을 적용하면 테스트가 거의 일반적인 값 기반 테스트처럼 간단해짐.

진입점이 곧 종료점이 됨.

### 6.1.4 통합 테스트의 어려움

- **긴 실행 시간**: 통합테 스트는 단위 테스트에 비해 훨씬 속도가 느림
- **불안정성**: 통합 테스트는 환경에 따라 실행 시간이 달라지거나 실패와 성공이 일관되지 않는 등 일관성 없는 결과를 나타낼 수 있음.
- **테스트와는 관계없는 코드나 환경 검증:** 통합 테스트는 테스트와 직접적인 관련이 없거나 개발자가 신경 쓰지 않는 환경까지도 테스트함(예를 들어 node-fetch 라이브러리, 네트워크 상태 등)
- **파악하는 데 더 많은 시간이 걸림**: 통합 테스트가 실패하면 실패 원인으로 의심되는 것이 다양하기 때문에 어디가 잘못되었는지 ㄹ찾아보고 디버깅하는 데 더 많은 시간을 쏟게 됨
- **상황을 재현하기 어려움**: 통합 테스트에서 잘못된 웹 사이트 콘텐츠, 웹 사이트 다운, 네트워크 다운 등 부정적인 테스트 상황을 재현하는 것이 필요 이상으로 어려움.
- **결과를 신뢰하기 어려움**: 실패하는 이유가 외부 문제일 수도 코드 내부일 수도 있음.

⇒ 통합 테스트로 채울 수 없는 부분은 단위 테스트나 API 테스트, 컴포넌트 테스트 같은 하위 수준의 테스트로 채우면 됨.

## 6.2 코드를 단위 테스트에 적합하게 만들기

코드를 보다 테스트하기 쉽게 만들어서 의존성을 주입하거나 의존성 자체를 피할 수 있고, 종료점도 보다 더 쉽게 확인할 수 있는 패턴: **진입점 분리 패턴/어댑터 분리 패턴**

### 6.2.1 진입점 분리 패턴

: 프로덕션 코드에서 순수 로직 부분을 별도의 함수로 분리하여 그 함수를 테스트의 시작점으로 사용하는 패턴

특정 비동기 작업을 두 부분으로 나눔

- 비동기 부분
- 비동기 작업이 끝났을 때 호출되는 콜백. 이 콜백을 새로운 함수로 분리하여 순수 논리 작업 단위의 진입점으로 사용함. 이렇게 하면 순수 단위 테스트로 이 함수들을 호출할 수 있음

1. **기존**: 비동기 코드와 그 결과를 처리하는 로직이 하나의 작업 단위로 섞여 있는 형태. 이 작업 단위는 콜백이나 프로미스를 통해 결과를 반환함
2. **1단계**: 비동기 작업 결과를 처리하는 로직을 별도의 함수로 분리. 비동기 작업 결과를 입력받아 처리하는 역할을 함.
3. **2단계**: 분리된 함수를 외부에 노출시켜 단위 테스트의 진입점으로 사용할 수 있게함. 테스트할 때 외부 의존성 없이 동기적으로 새로운 작업 단위를 검증할 수 있음.

**작업 단위 분리 예제**

1. 기존 상태에서는 `isWebsiteAlive()` 함수에 로직이 포함되어 있음
2. fetch 결과가 처리되는 부분의 로직 코드를 분리하여 두 함수로 나눔. 하나는 성공 케이스를 처리하고, 다른 하나는 오류 케이스를 처리
3. 이 두 함수를 외부로 노출시켜 단위 테스트에서 직접 호출할 수 있게 함.

```tsx
// 예제 6-5) 콜백을 사용하여 진입점 분리하기
// 진입점1 - 작업 단위에서 처음으로 호출하는 1차 관문
const isWebsiteAlive = callback => {
	fetch("http://example.com")
		.then(throwOnIvalidResponse)
		.then(resp => resp.text())
		.then(text => {
			processFetchSuccess(test, callback);
		})
		.catch(err => {
			processFetchError(err, callback);
		});
};

const throwOnInvalidResponse = resp => {
	if (!resp.ok) {
		throw Error(resp.statusText);
	}
	return resp;
};

// 작업 단위의 새로운 진입점 - 각 비동기 작업의 성공과 실패를 처리함 -> 단위 테스트에 사용할 수 있으며, 원래 진입점은 여전히 통합 테스트에 사용할 수 있음.
// 진입점
const processFetchSuccess = (text, callback) => {
	if (text.includes("illustrative")) {
		callback({ success: true, status: "ok" });
	} else {
		callback({ success: false, status: "missing text" });
	}
};

// 진입점
const precessFetchError = (err, callback) => {
	callback({ success: false, status: err });
};
```

- 원래 진입점에서는 여전히 통합 테스트를 하나나 두 개 정도 작성하는 것이 좋음.

새로운 진입점을 호출하는 단위 테스트 작성

```tsx
// 예제 6-6) 분리된 진입점을 사용한 단위 테스트
describe("Website alive checking", () => {
	test("content matches, returns true", done => {
		samples.processFetchSuccess("illustrative", result => {
			expect(result.success).toBe(true);
			expect(result.status).toBe("ok");
			done();
		});
	});
	test("website content does not match, returns fale", done => {
		samples.processFetchSuccess("bad content", result => {
			expect(result.status).toBe("missing text");
			done();
		});
	});
	test("When fetch fails, returns false", done => {
		samples.processFetchError("error text", result => {
			expect(result.status).toBe("error text");
			done();
		});
	});
});
```

- 테스트 내 비동기 작업이 없어도 `done()` 함수는 여전히 호출해야 함. → 콜백 함수가 전혀 호출되지 않는 상황을 잡아내기 위함.
- 하지만, 비동기 작업이 새로 생긴 진입점 간에 제대로 작동하는지 확인하려면 통합 테스트가 최소 한 개는 필요함. →이는 코드 신뢰성 확보를 위함.
  ```tsx
  test("isWebsiteAlive with real website returns true", done => {
  	samples.isWebsiteAlive(result => {
  		expect(result.success).toBe(true);
  		done();
  	});
  });
  ```

**await를 사용한 진입점 분리**

```tsx
// 예제 6-7) 콜백 대신 async/await를 사용한 함수
// 진입점
const isWebsiteAlive = async () => {
	try {
		const resp = await fetch("http://example.com");
		throwIfResponseNotOK(resp);
		const text = await resp.text();
		return processFetchContent(text);
	} catch (err) {
		processFetchError(err);
	}
};

const throwIfResponseNotOK = resp => {
	if (!resp.ok) {
		throw resp.statusText;
	}
};

const processFetchContent = text => {
	const included = text.includes("illustrative");
	if (included) {
		return { success: true, status: "ok" };
	}
	return { success: false, status: "missing text" };
};

const processFetchError = err => {
	throw err; // 값을 반환하는 대신 오류 발생시킴
};
```

- 테스트코드

```tsx
// 예제 6-8) async/await에서 분리된 진입점 테스트하기
describe("website up check", () => {
	test("on fetch success with good content, returns true", () => {
		const result = samples.processFetchContent("illustrative");
		expect(result.success).toBe(true);
		expect(result.status).toBe("ok");
	});

	test("on fetch success with bad content, returns false", () => {
		const result = samples.processFetchContent("text not on site");
		expect(result.success).toBe(false);
		expect(result.status).toBe("missing text");
	});

	test("on fetch fail, throws", () => {
		expect(() => samples.processFetchError("error text")).toThrowError(
			"error text"
		);
	});
});
```

→ async/await와 관련된 키워드를 추가하거나 코드 실행을 기다리기 위해 신경 쓸 필요 없음. 로직 작업 단위를 비동기 부분과 분리했기 때문

```tsx
// 통합테스트 부분
test("isWebsiteAlive with real website returns true", async () => {
	const result = await samples.isWebsiteAlive();
	expect(result.success).toBe(true);
	expect(result.status).toBe("ok");
});
```

### 6.2.2 어댑터 분리 패턴

: 본질적으로 비동기적인 요소를 분리하고 이를 추상화하여 동기적인 요소로 대체할 수 있게 하는 패턴

- 논리 코드를 별도의 진입점으로 분리하는 대신 기존 코드에서는 의존성으로 있던 비동기 코드를 분리하여 어댑터로 감싸고, 이를 다른 의존성처럼 주입할 수 있게 함.
- 어댑터를 사용하는 쪽 필요에 맞게 단순화된 특별한 인터페이스를 만드는 것도 일반적: **인터페이스 분리 원칙**
- 의존성을 분리하고 어댑터로 감싸면 테스트에서 해당 의존성을 더 간단하게 만들고 가짜로 대체할 수 있다.
  - 네트워크 어댑터 모듈로 node-fetch 모듈을 감싸면 애플리케이션에서 필요한 기능만 노출하고 문제에 가장 적합한 언어로 표현할 수 있다

```tsx
// 예제 6-9) 네트워크 어댑터 코드
const fetch = require("node-fetch");

const fetchUrlText = async url => {
	const resp = await fetch(url);
	if (resp.ok) {
		const text = await resp.text();
		return { ok: true, text: text };
	}
	return { ok: false, text: resp.statusText };
};
```

- 네트워크 어댑터 모듈은 프로젝트에서 node-fetch를 가져오는 유일한 모듈. → 나중에 의존성이 변경되더라도 이 파일만 수정하면 된다는 의미.
- 함수의 이름과 기능 모두 단순화함
- URL에서 상태와 텍스트를 가져오는 과정을 숨기고, 이를 더 사용하기 쉬운 하나의 함수로 추상화함.

사용하기

1. **모듈 방식**

   ```tsx
   // 예제 6-10) 네트워크 어댑터 모듈을 사용하는 isWebsiteAlive() 함수
   const network = require("./network-adapter");

   const isWebsiteAlive = async () => {
   	try {
   		const result = await network.fetchUrlText("http://example.com");
   		if (!result.ok) {
   			throw result.text;
   		}
   		const text = result.text;
   		return processFetchSuccess(text);
   	} catch (err) {
   		throw processFetchFail(err);
   	}
   };
   ```

   ```tsx
   // 예제 6-11) jest.mock을 사용하여 네트워크 어댑터를 가짜로 만들어 대체하기
   jest.mock("./network-adapter"); // 네트워크 어댑터 모듈의 모의 객체로 대체
   const stubSyncNetwork = require("./network-adapter"); // 모의 객체로 대체된 모듈을 가져옴
   const webverifier = require("./website-verifier");

   describe("unit test website verifier", () => {
   	beforeEach(jest.resetAllMocks); // 다른 테스트에서 발생할 수 있는 문제를 피하려고 모든 스텁을 리셋

   	test("with good content, returns true", async () => {
   		stubSyncNetwork.fetchUrlText.mockReturnValue({
   			ok: true,
   			text: "illustrative",
   		}); // 스텁에서 반환 값 흉내 냄
   		const result = await webverifier.isWebsiteAlive(); // 테스트에서 await 사용
   		expect(result.success).toBe(true);
   		expect(result.status).toBe("ok");
   	});

   	test("with bad content, returns false", async () => {
   		stubSyncNetwork.fetchUrlText.mockReturnValue({
   			ok: true,
   			text: "<span>hello world</span>",
   		});
   		const result = await webverifier.isWebsiteAlive();
   		expect(result.success).toBe(false);
   		expect(result.status).toBe("missing text");
   	});
   });
   ```

   - 예제 6-1 코드에서 사용했던 진입점 다시 활용

2. **함수형**

   - 네트워크 모듈의 설계는 동일하게 유지되지만, 이를 websiteverifier에 주입하는 방식이 달라짐.

   ```tsx
   // 예제 6-12) isWebsiteAlive()의 함수형 주입 설계하기
   const isWebsiteAlive = async network => {
   	const result = await network.fetchUrlText("http://example.com");
   	if (result.ok) {
   		const text = result.text;
   		return onFetchSuccess(text);
   	}
   	return onFetchError(result.text);
   };
   ```

   - 네트워크 어댑터 모듈이 함수의 매개변수로 주입되도록 만듬
   - 더 적은 보일러플레이트 코드로 함수를 만들 수 있음

   ```tsx
   // 예제 6-13) 함수형 주입을 사용한 네트워크 어댑터 단위 테스트
   const webverifier = require("./website-verifier");

   // 네트워크 어댑터 인터페이스의 중요한 부분과 일치하는 커스텀 객체를 생성하는 새로운 헬퍼 함수임.
   const makeStubNetworkWithResult = fakeResult => {
   	return {
   		fetchUrlText: () => {
   			return fakeResult;
   		},
   	};
   };

   describe("unit test website verifier", () => {
   	test("with good content, returns true", async () => {
   		const stubSyncNetwork = makeStubNetworkWithResult({
   			ok: true,
   			text: "illustrative",
   		});
   		const result = await webverifier.isWebsiteAlive(stubSyncNetwork); // 직접 만든 객체 주입
   		expect(result.success).toBe(true);
   		expect(result.status).toBe("ok");
   	});

   	test("with bad content, returns false", async () => {
   		const stubSyncNetwork = makeStubNetworkWithResult({
   			ok: true,
   			text: "unexpected content",
   		});
   		const result = await webverifier.isWebsiteAlive(stubSyncNetwork); // 직접 만든 객체 주입
   		expect(result.success).toBe(false);
   		expect(result.status).toBe("missing text");
   	});
   });
   ```

   - `jest.mock`으로 모듈을 간접적으로 페이크로 만들 필요도, 그런 모듈을 다시 가져올(`require`)필요도 없음
   - `jest.resetAllMocks`를 호출하여 모의 함수나 객체를 초기화할 이유도 사라짐.

3. **객체 지향, 인터페이스 기반 어댑터**

   - 매개변수 주입을 생성자 주입 패턴으로 확장할 수 있음.

   ```tsx
   // 예제 6-14) NetworkAdapter와 인터페이스
   // INetworkAdapter.ts
   export interface INetworkAdapter {
   	fetchUrlText(url: string): Promise<NetworkAdapterFetchResults>;
   }

   export interface NetworkAdapterFetchResults {
   	ok: boolean;
   	text: string;
   }

   // network-adapter.ts
   export class NetworkAdapter implements INetworkAdapter {
   	async fetchUrlText(url: string): Promise<NetworkAdapterFetchResults> {
   		const resp = await fetch(url);
   		if (resp.ok) {
   			const text = await resp.text();
   			return Promise.resolve({ ok: trye, text: text });
   		}
   		return Promise.reject({ ok: false, text: resp.statusText });
   	}
   }
   ```

   `INetworkAdapter` 매개변수를 받는 받는 생성자가 있는 `WebsiteVerifier` 클래스 생성

   ```tsx
   // 예제 6-15) 생성자 주입을 사용하는 WebsiteVerifier 클래스
   // website-verifier.ts
   export interface WebsiteAliveResult {
   	success: boolean;
   	status: string;
   }

   export class WebsiteVerifier {
   	constructor(private network: INetworkAdapter) {}

   	isWebsiteAlive = async (): Promise<WebsiteAliveResult> => {
   		let netResult: NetworkAdapterFetchResults;
   		try {
   			netResult = await this.network.fetchUrlText("http://example.com");
   			if (!netResult.ok) {
   				throw netResult.text;
   			}
   			const text = netResult.text;
   			return this.processNetSuccess(text);
   		} catch (err) {
   			throw this.processNetFail(err);
   		}
   	};

   	processNetSuccess = (text): WebsiteAliveResult => {
   		const included = text.includes("illustrative");
   		if (included) {
   			return { success: true, status: "ok" };
   		}
   		return { success: false, status: "missing text" };
   	};

   	processNetFail = (err): WebsiteAliveResult => {
   		return { success: false, status: err };
   	};
   }
   ```

   이 클래스의 단위테스트는 가짜 네트워크 어댑터를 생성하고 생성자를 사용하여 주입하게 됨

   ```tsx
   // 예제 6-16) 객체 지향을 따르는 WebsiteVerifier 단위 테스트
   import Substitute, { Arg } from "@fluffy-spoon/substitute";
   import {
   	INetworkAdapter,
   	NetworkAdapterFetchResults,
   } from "./INetworkAdapter";
   import { WebsiteVerifier } from "./website-verifier";

   // 네트워크 어댑터 모듈을 테스트하는 헬퍼 함수
   const makeStubNetworkWithResult = (
   	fakeResult: NetworkAdapterFetchResults
   ): INetworkAdapter => {
   	const stubNetwork = Substitute.for<INetworkAdapter>(); //substitute.js 파일을 사용하여 모의 객체 만듬
   	stubNetwork.fetchUrlText(Arg.any()).returns(Promise.resolve(fakeResult)); // 테스트에서 필요한 값을 반환하도록 가짜 객체 설정
   	return stubNetwork;
   };

   describe("unit test website verifier", () => {
   	test("with good content, returns true", async () => {
   		const stubSyncNetwork = makeStubNetworkWithResult({
   			ok: true,
   			text: "illustrative",
   		});
   		const webVerifier = new WebsiteVerifier(stubSyncNetwork);

   		const result = await webVerifier.isWebsiteAlive();
   		expect(result.success).toBe(true);
   		expect(result.status).toBe("ok");
   	});

   	test("with bad content, returns false", async () => {
   		const stubSyncNetwork = makeStubNetworkWithResult({
   			ok: true,
   			text: "unexpected content",
   		});
   		const webVerifier = new WebsiteVerifier(stubSyncNetwork);

   		const result = await webVerifier.isWebsiteAlive();
   		expect(result.success).toBe(false);
   		expect(result.status).toBe("missing text");
   	});
   });
   ```

   - 객체 지향 프로그래밍에서 인터페이스를 사용한 생성자 주입 방식은 매우 일반적이며, 여러 상황에서 의존성을 로직과 분리하여 유지 관리가 쉬운 유효한 방식일 수 있음

## 6.3 타이머 다루기

타이머를 다룰 때는 어댑터와 진입점을 분리하는 대신 타이머 기능을 비활성화하고 우회하는 것이 더 유용할 때도 있음.

타이머를 처리하는 두 가지 패턴

1. 함수를 직접 몽키 패칭하는 방법
2. 제스트 및 다른 프레임워크를 사용하여 타이머를 비활성화하고 제어하는 방법

### 6.3.1 몽키 패칭으로 타이머를 스텁으로 만들기

- 몽키 패칭: 프로그래밍이 실행 중인 동안 시스템 소프트웨어를 로컬에서 확장하거나 수정하는 방법
- 자바스크립트, 루비, 파이썬 등은 몽키 패칭이 비교적 쉬운 반면, C#, 자바 등 강타입 언어와 컴파일 타임 언어에서는 몽키 패칭이 훨씬 어려움.
- 자바스크립트에서 타이머를 몽키 패칭하는 방법 중 하나

  ```tsx
  // 예제 6-17) 몽키 패칭하고 싶은 setTimeout 코드
  const calculate1 = (x, y, resultCallback) => {
  	setTimeout(() => { resultCallback(x+y); }, 5000};
  };
  ```

  임시로 동기적 함수로 변경하는 발식으로 몽키 패칭 할 수 있음

  ```tsx
  // 예제 6-18) 간단한 몽키 패칭 패턴
  const Samples = require("./timing-samples");

  describe("monkey patching", () => {
  	let originalTimeOut;
  	beforeEach(() => (originalTimeOut = setTimeout)); // 전역 객체에 담겨 있던 원래의 타이머 함수를 따로 보관해 놓음
  	afterEach(() => (setTimeout = originalTimeOut)); // 각 테스트가 끝날 때마다 몽키 패칭된 타이머 함수를 원래의 것으로 복원함

  	test("calculate1", () => {
  		setTimeout = (callback, ms) => callback(); // 타이머 함수를 몽키 패칭함
  		Samples.calculate1(1, 2, result => {
  			expect(result).toBe(3);
  		});
  	});
  });
  ```

  - 테스트 코드의 모든 라인은 동기식으로 진행되므로 콜백 호출을 기다리기 위해 `done()` 을 사용할 필요가 없어빔
  - setTimeout을 몽키 패칭을 이용하여 사용자 정의 함수로 변경
  - 두 번째 매개변수로 들어오는 ms는 더 이상 사용되지 않고 콜백 함수는 즉시 실행됨
  - 유일한 단점
    - 많은 보일러 플레이트 코드 필요
    - 테스트가 끝날 때마다 몽키 패칭된 함수를 원래대로 되돌리는 것을 잊지 말아야 함. 이 때문에 오류가 발생하기 쉬움

  ### 6.3.2 제스트로 setTimeout 대체

  제스트는 자바스크립트의 타이머를 대부분 처리하기 위해 다음 세 가지 주요 기능을 제공함

  - `jest.useFakeTimers`: setTimeout 같은 다양한 타이머 함수를 스텁으로 대체
  - `jest.resetAllTimers`: 모든 가짜 타이머를 실제 타이머로 재설정
  - `jest.advanceTimersToNextTimer`: 가짜 타이머를 작동시켜 콜백을 실행. 실행하면 다음에 예정된 타이머가 실행됨

  ```tsx
  // 예제 6-19) 제스트로 setTimeout 대체하기
  describe("calculate1 - with jest", () => {
  	beforeEach(() => {
  		jest.useFakeTimers();
  	});

  	beforeEach(() => {
  		jest.clearAllTimers();
  	});

  	test("fake timeout with callback", () => {
  		Samples.calculate(1, 2, result => {
  			expect(result).toBe(3);
  		});
  		jest.advanceTimersToNextTimer(); // 다음 예쩡된 타이머를 실행함
  	});
  });
  ```

  - 모든 것이 동기적으로 동작하기 때문에 done() 호출할 필요 없음
  - 동시에, `advanceTimersToNextTimer` 함수를 사용하여 다음 예정된 타이머를 실행해야 함.
    → 사용하지 않으면 가짜로 만든 setTimeout이 영원히 실행되지 않음
    → setTimeout이 재귀적으로 호출되어 반복적으로 타이머 작업을 수행할 때도 유용. 시간을 단계별로 앞으로 진행시킬 수 있는 기능이 매우 유용.
    → 지정된 단계 수만큼 모든 타이머를 앞으로 진행시켜 다음 타이머 콜백이 실행되도록 할 수 있음
    setInterval의 경우

  ```tsx
  // 예제 6-20) setInterval을 사용하는 함수
  const calculate2 = (getInputsFn, resultFn) => {
  	setInterval(() => {
  		const { x, y } = getInputsFn();
  		resultFn(x + y);
  	}, 1000);
  };
  ```

  - 매개변수 두개, 하나는 계산할 입력 값 반환, 하나는 계산 결과를 콜백으로 받음
  - `setInterval` 을 사용하여 계속해서 입력 값을 받아 와 그 결과를 계산함

  ```tsx
  // 예제 6-21) 단위 테스트에서 가짜 타이머 실행하기
  describe("calculate with intervals", () => {
  	beforeEach(() => jest.clearAllTimers());
  	beforeEach(() => jest.useFakeTimers());

  	test("calculate, incr input/output, calculates correctly", () => {
  		let xInput = 1;
  		let yInput = 2;
  		const inputFn = () => ({ x: xInput++, y: yInput++ }); // 콜백 수를 검증하려고 변수 값을 증가

  		const results = [];
  		Samples.calculate2(inputFn, result => results.push(result));

  		jest.advanceTimersToNextTimer(); // setInterval을 한 번 호출
  		jest.advanceTimersToNextTimer(); // setInterval을 두 번 호출

  		expect(results[0]).toBe(3);
  		expect(results[1]).toBe(5);
  	});
  });
  ```

## 6.4 일반적인 이벤트 처리

### 6.4.1 이벤트 이미터

> **이벤트 이미터?**
> Node.js에서 액션이 완료되었음을 알리기 위해 메시지를 보내 이벤트를 발생시키는 객체
> 자바스크립트 개발자는 이벤트 이미터에서 이벤트를 수신하는 코드를 작성하여 이러한 이벤트가 발생할 때마다 함수가 실행되도록 할 수 있음. 이 경우 이벤트는 식별 문자열과 리스너에 전달한 데이터를 포함함.

```tsx
// 예제 6-22) 이벤트 이미터 기반의 간단한 Adder 클래스 (더할 때마다 이벤트 발생)
const EventEmitter = require("events");

class Adder extends EventEmitter {
	constructor() {
		super();
	}

	add(x, y) {
		const result = x + y;
		this.emit("added", result);
		return result;
	}
}
```

이벤트가 발생했는지 확인하는 가장 간단한 단위 테스트 방법 - 테스트에서 해당 이벤트를 구독하고 add 함수를 호출할 때 이벤트가 발생하는지 확인하는 것

```tsx
// 예제 6-23) 이벤트를 구독하여 이벤트 이미터 테스트하기
describe("events based module", () => {
	describe("add", () => {
		it("generates addition event when called", done => {
			const adder = new Adder();
			adder.on("added", result => {
				expect(result).toBe(3); // 이벤트 매개변수로 전달된 값을 확인할 수 있으며, 이벤트가 트리거되었는지도 간접적으로 테스트할 수 있음
				done();
			});
			adder.add(1, 2);
		});
	});
});
```

- done() 함수를 사용함으로써 이벤트가 실제로 발생했는지 확인할 수 있음
- done() 함수를 사용하지 않았고, 이벤트도 발생하지 않는다면 이벤트를 구독하는 코드가 실행되지 않기에 테스트를 통과함. (아무일도 일어나지 않음)

### 6.4.2 클릭 이벤트 처리

```tsx
// 예제 6-24) 자바스크립트의 클릭 이벤트를 포함한 간단한 웹 페이지
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>File to Be Tested</title>
    <script src="index-helper.js"></script>
  </head>
  <body>
    <div>
      <div>A simple button</div>
      <button data-testid="myButton" id="myButton">Click Me!</button>
      <div data-testid="myResult" id="myResult">Waiting...</div>
    </div>
  </body>
</html>
```

```tsx
// 예제 6-25) 자바스크립트로 작성된 웹 페이지 로직
window.addEventListener("load", () => {
	document
		.getElementById("myButton")
		.addEventListener("click", onMyButtonClick);

	const resultDiv = document.getElementById("myResult");
	resultDiv.innerText = "Document Loaded";
});

function onMyButtonClick() {
	const resultDiv = document.getElementById("myResult");
	resultDiv.innerText = "Clicked!";
}
```

- 버튼을 누를 때 특별한 문자열을 설정하는 간단한 함수
- 테스트 방법
  - 그다지 좋지 않은 방법: 클릭 이벤트를 구독하고 실제로 클릭 이벤트가 발생했는지 확인하기. 큰 의미가 있다고 보기는 어려움. 정말로 확인해야할 것은 클릭이 실제로 어떤 작업을 수행했는지 여부임
  - 더 나은 방법: 클릭 이벤트를 직접 발생시켜 페이지 내부 값이 올바르게 변경되었는지 확인하는 것. 이렇게 해야 실제로 유용한 검증이 됨.

```tsx
// 예제 6-26) 클릭 이벤트를 트리거하고 요소의 텍스트를 테스트하기
/**
 * @jest-environment jsdom
 */
// 이 코드는 window 이벤트를 위해 필요한 설정임
const fs = require("fs");
const path = require("path");
require("./index-helper.js");

const loadHtml = fileRelativePath => {
	const filePath = path.join(__dirname, "index.html");
	const innerHTML = fs.readFileSync(filePath);
	document.documentElement.innerHTML = innerHTML;
};

const loadHtmlAndGetUIElements = () => {
	loadHtml("index.html");
	const button = document.getElementById("myButton");
	const resultDiv = document.getElementById("myResult");
	return { window, button, resultDiv };
};

describe("index helper", () => {
	test("vanilla button click triggers change in result div", () => {
		const { window, button, resultDiv } = loadHtmlAndGetUIElements();
		window.dispatchEvent(new Event("load")); // document.load 이벤트를 흉내 냄

		button.click(); // 클릭 이벤트 발생시킴

		expect(resultDiv.innerText).toBe("Clicked!"); //document의 요소가 실제로 변경되었는지 확인
	});
});
```

- `loadHtml` 과 `loadHtmlAndGetUIElements` 유틸리티 함수 두개 만듬 → UI에서 요소 위치가 바뀌거나 ID가 변경되더라도 테스트를 수정하는 데 큰 문제가 없음
- `docuemnt.load` 이벤트를 임의로 발생시켜 예제 6-25에서 설정한 클릭 이벤트가 등록될 수 있게 함.
- 마치 사용자가 버튼을 누른 것처럼 클릭 이벤트 발생시킴
- 마지막으로 버튼을 눌러 UI 요소가 변경되었는지 확인하여 코드가 이벤트를 제대로 구독하고 작업을 수행했는지 검증함

## 6.5 DOM 테스트 라이브러리 도입

- 오픈 소스 DOM 테스트 라이브러리 - DOM Testing Library
- 좋은 이유
  - 웹 페이지와 상호 작용하는 사용자 관점에 더 가까운 테스트를 작성할 수 있음
  - 요소에 ID를 사용하는 대신 요소의 텍스트로 탐색 쿼리를 실행함.
  - 이벤트를 발생시키는 것이 더 간결하고, 요소가 나타나거나 사라지는 것을 기다리는 작업도 쉽게 처리 가능

```tsx
// 예제 6-27) DOM Testing Library를 사용한 간단한 테스트
const { fireEvent, findByText, getByText } = require("@testing-library/dom"); // 사용할 라이브러리 API를 가져오기

const loadHtml = fileRelativePath => {
	const filePath = path.join(__dirname, "index.html");
	const innerHTML = fs.readFileSync(filePath);
	document.documentElement.innerHTML = innerHTML;
	return document.documentElement; //라이브러리는 대부분 문서 요소를 기반으로 작업을 처리
};

const loadHtmlAndGetUIElements = () => {
	const docElem = loadHtml("index.html");
	const button = getByText(docElem, "Click Me!", { exact: false }); // 대소문자를 무시하거나 문자열의 시작 또는 끝에 누락된 문자를 신경 쓰지 않아도 되는 옵션 -> 중요하지 않은 변경점 때문에 테스트를 수정할 필요가 없어짐
	return { window, docElem, button };
};

describe("index helper", () => {
	test("dom test lib button click triggers change in page", () => {
		const { window, docElem, button } = loadHtmlAndGetUIElements();
		fireEvent.load(window); // 라이브러리의 fireEvent API를 사용하여 이벤트 실행 간소화

		fireEvent.click(button);

		// true가 될 때까지 기다리거나 1초 내에 타임아웃
		expect(findByText(docElem, "Clicked", { exact: false })).toBeTruthy();
	});
});
```

## Advantages

<!-- (선택) 발표 주제를 적용했을 때 얻을 수 있는 이점이나 해결할 수 있는 문제 상황들에 대해 설명합니다. -->

- 테스트 코드의 명확성과 유지 보수성 향상
  진입점을 분리하면 로직이 명확하게 분리되어 각 기능별로 테스트하기 쉬워짐.
  또한 테스트 코드가 길고 복잡해지지 않아 유지보수가 쉬워짐.
- async/await 사용 시 테스트 코드 단순화
  async/await 문법을 사용하면 테스트 코드도 await을 사용해 간결하고 직관적으로 작성 가능. done() 콜백 없이 동기적인 코드처럼 테스트할 수 있음.

## Disadvantages

<!-- (선택) 발표 주제를 적용했을 때 발생할 수 있는 side effect나 trade-off에 대해 설명합니다. -->

- 과도한 분리로 오히려 가독성이 저하될 수 있음.
  지나치게 로직을 분리하면 파일이 많아지고 호출 관계가 복잡해져 전체 흐름을 이해하기 어려워질 수 있음.

## Example Case

<!-- 발표 주제가 적용되어 있는 라이브러리, 실제 업무에 적용되어 있는 코드, 직접 만든 예시 코드, 자신의 느낀점 등을 첨부하여 이해를 돕습니다. -->

## Wrap-up

<!-- 발표를 마무리하며 발표 주제를 다시 요약하고 정리합니다. -->

비동기 코드는 테스트가 까다롭지만, 진입점 분리나 어댑터 분리 등의 패턴을 활용하면 단위 테스트가 가능한 구조로 개선할 수 있음.

콜백 기반 코드는 done()을 사용하여 테스트 종료 시점을 명시해야 하며, async/await 문법을 활용하면 테스트 코드를 간결하게 작성할 수 있음.

단위 테스트로 검증이 어려운 부분은 최소한의 통합 테스트를 통해 보완할 필요가 있음.

핵심은 테스트의 안정성과 속도를 높이기 위해, 비동기 로직과 순수 로직을 분리하는 구조화된 접근 방식이 필요하다는 것.
