// 2-10. 상태 값을 가진 클래스로 리팩터링하기
class PasswordVerifier1 {
	constructor() {
		this.rules = [];
	}

	addRule(rule) {
		this.rules.push(rule);
	}

	verify(input) {
		const errors = [];
		this.rules.forEach(rule => {
			const result = rule(input);
			if (result.passed === false) {
				errors.push(result.reason);
			}
		});
		return errors;
	}
}

module.exports = {
	PasswordVerifier1,
};
