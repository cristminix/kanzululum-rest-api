export const validateCaptchaToken = async (token, secret,options = { score: 0.5 }) => {

	const result = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
		method: "POST",
	})
		.then((res) => res.json())
		.then((res) => {
			if (!res.success || res.score <= options.score) {
				return {
					success: false,
					message: "reCAPTCHA validation failed",
				}
			} else {
				return { success: true }
			}
		})
	return result
}