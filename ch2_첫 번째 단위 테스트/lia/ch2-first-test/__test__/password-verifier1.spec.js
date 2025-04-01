const { PasswordVerifier1 } = require("../password-verifier1");

// 2-11. 상태 기반 작업 단위 테스트
describe("PasswordVerifier", () => {
	describe("with a failing rule", () => {
		it("has an error message based on the rule.reason", () => {
			const verifier = new PasswordVerifier1();
			const fakeRule = () => ({
				passed: false,
				reason: "fake reason",
			});

			verifier.addRule(fakeRule);
			const errors = verifier.verify("any value");

			expect(errors[0]).toContain("fake reason");
		});
	});
});

// 2-11. 동일한 종료점에서 추가적으로 결과 검증하기
describe("PasswordVerifier", () => {
	describe("with a failing rule", () => {
		it("has an error message based on the rule.reason", () => {
			const verifier = new PasswordVerifier1();
			const fakeRule = () => ({
				passed: false,
				reason: "fake reason",
			});

			verifier.addRule(fakeRule);
			const errors = verifier.verify("any value");

			expect(errors[0]).toContain("fake reason");
		});

		// 별도의 테스트로 분리함
		it("has an one error", () => {
			const verifier = new PasswordVerifier1();
			const fakeRule = () => ({
				passed: false,
				reason: "fake reason",
			});

			verifier.addRule(fakeRule);
			const errors = verifier.verify("any value");

			// 이 테스트에서는 오류 수만 검증함
			expect(errors.length).toBe(1);
		});
	});
});

// 2-13. beforeEach() 함수를 2뎁스로 사용하기
describe("PasswordVerifier", () => {
	let verifier;

	// verifier 변수를 두어 하위의 모든 테스트에서 사용할 수 있도록 설정
	beforeEach(() => {
		verifier = new PasswordVerifier1();
	});

	describe("with a failing rule", () => {
		let fakeRule, errors;

		// describe('with a failing rule') 구역 내에서 사용 가능한 fakeRule() 함수 설정
		beforeEach(() => {
			fakeRule = () => ({ passed: false, reason: "fake reason" });
			verifier.addRule(fakeRule);
		});

		it("has an error message based on the rule.reason", () => {
			errors = verifier.verify("any value");

			expect(errors[0]).toContain("fake reason");
		});

		it("has exactly one error", () => {
			errors = verifier.verify("any value");

			expect(errors.length).toBe(1);
		});
	});
});
