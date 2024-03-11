import axios from "axios";

export default async function handler(req, res) {
	if (req.method === "GET") {
		try {
			// PROD
			const clientID = process.env.NEXT_PUBLIC_PROD_GITHUB_CLIENT_ID;
			const clientSecret = process.env.PROD_GITHUB_SECRET;

			// DEV
			// const clientID = process.env.NEXT_PUBLIC_DEV_GITHUB_CLIENT_ID;
			// const clientSecret = process.env.DEV_GITHUB_SECRET;

			const requestToken = req.query.code;

			const ghRes = await axios({
				method: "post",
				url: `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${clientSecret}&code=${requestToken}`,
				headers: {
					accept: "application/json",
				},
			});
			res.redirect(`/create?access_token=${ghRes.data?.access_token}`);
		} catch (error) {
			console.log(error?.response.data ?? error);
			res.status(400).send(error?.response.data ?? error);
		}
	} else {
		res.status(404).send();
	}
}
