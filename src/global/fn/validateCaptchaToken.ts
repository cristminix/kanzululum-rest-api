export interface IValidateCaptchaTokenOption{
	score:number
}
export const validateCaptchaToken = async (token:string, secret:string,options:IValidateCaptchaTokenOption = { score: 0.5 }) => {

	const result = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
		method: "POST",
	})
		.then((res:Response) => res.json())
		.then((res:any) => {
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