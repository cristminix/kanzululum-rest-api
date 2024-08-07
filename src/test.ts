export function add(a: number, b: number) {
	return a + b
}

export default {
	async fetch(request: any, env: any, ctx: ExecutionContext) {
		const url: any = new URL(request.url)
		const a = parseInt(url.searchParams.get("a"))
		const b = parseInt(url.searchParams.get("b"))
        const result = add(a, b);
		return new Response(result.toString())
	},
}
