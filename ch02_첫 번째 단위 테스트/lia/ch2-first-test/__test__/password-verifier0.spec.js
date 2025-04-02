const { verifyPassword } = require("../password-verifier0");

test("badly names test", () => {
	// 테스트 준비 - 함수에 전달할 매개변수를 초기화한다.
	const fakeRule = input => ({ passed: false, reason: "fake reason" });

	// 함수 실행의 인자로 전달한다.
	const errors = verifyPassword("any value", [fakeRule]);

	// 함수의 반환값을 기대값과 비교한다.
	expect(errors[0]).toMatch("fake reason");
});

// 2-5. USE 전략 적용 버전
test("verifyPassword, given a failing rule, returns errors", () => {
	const fakeRule = input => ({ passed: false, reason: "fake reason" });

	const errors = verifyPassword("any value", [fakeRule]);

	expect(errors[0]).toMatch("fake reason");
});

// 2-6. describe() 블록 추가하기
describe("verifyPassword", () => {
	test("given a falling rule, returns errors", () => {
		const fakeRule = input => ({ passed: false, reason: input });

		const errors = verifyPassword("any value", [fakeRule]);

		expect(errors[0]).toContain("fake reason");
	});
});

// 2-7. 추가 정보를 표혆하는 중첩 구조
describe("verifyPassword", () => {
	describe("with a failing rule", () => {
		test("returns errors", () => {
			const fakeRule = () => ({
				passed: false,
				reason: "fake reason",
			});

			const errors = verifyPassword("any value", [fakeRule]);

			expect(errors[0]).toContain("fake reason");
		});
	});
});

// 2-8. fakeRule() 함수를 한 단계 위로 올리기
describe("verifyPassword", () => {
	describe("with a failing rule", () => {
		// fakeRule() 함수를 test() 구역보다 한단계 위로 끌어올림
		const fakeRule = () => ({
			passed: false,
			reason: "fake reason",
		});

		test("returns errors", () => {
			const errors = verifyPassword("any value", [fakeRule]);

			expect(errors[0]).toContain("fake reason");
		});
	});
});

// 2-9. test()를 it() 함수로 변경하기
describe("verifyPassword", () => {
	describe("with a failing rule", () => {
		it("returns errors", () => {
			const fakeRule = () => ({
				passed: false,
				reason: "fake reason",
			});

			const errors = verifyPassword("any value", [fakeRule]);

			expect(errors[0]).toContain("fake reason");
		});
	});
});
