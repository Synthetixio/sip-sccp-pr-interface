import axios from "axios";

export default async function handler(req, res) {
	try {
		// PROD
		const githubAccountName = process.env.NEXT_PUBLIC_PROD_GITHUB_ACCOUNT_NAME;
		const githubRepoName = process.env.NEXT_PUBLIC_PROD_GITHUB_REPO_NAME;

		// DEV
		// const githubAccountName = process.env.NEXT_PUBLIC_DEV_GITHUB_ACCOUNT_NAME;
		// const githubRepoName = process.env.NEXT_PUBLIC_DEV_GITHUB_REPO_NAME;

		const opt = req.query?.opt;
		let endpoint = "";

		if (opt === "sip")
			endpoint = `https://api.github.com/repos/${githubAccountName}/${githubRepoName}/contents/content/sips`;
		else if (opt === "sccp")
			endpoint = `https://api.github.com/repos/${githubAccountName}/${githubRepoName}/contents/content/sccp`;
		else res.status(400).send("unknown");

		const contentRes = await axios({
			url: endpoint,
			method: "get",
			headers: {
				Authorization:
					"token " + (req.headers?.authorization ?? req.query?.access_token),
				"Content-Type": "application/json",
				Accept: "application/vnd.github+json",
			},
		});

		const fileList = contentRes.data
			?.filter((cnt) => cnt.name != "assets" && cnt.name != "asset")
			.map((cnt) => cnt.name);

		const files = fileList
			.map((file) => Number(file.split(".")[0].split("-")[1]))
			.sort((a, b) => b - a);

		res.send(files[0] + 1);
	} catch (error) {
		console.log(error?.response.data ?? error);
		res.status(400).send(error?.response.data ?? error);
	}
}
