import { Resend } from "resend"

export const sendEmail = async () => {
	const resend = new Resend("re_bMDRxqFP_P62vGDBkExyBiCka6dQKMsgx")

	const { data, error } = await resend.emails.send({
		from: "kontak@ponpeskanzululumcirebon.com",
		to: "kanzululumdotcom@gmail.com",
		subject: "Hello World",
		html: "<p>Hello from Workers</p>",
	})
}