import axios from "axios";

export default async function handler(req, res) {
	try {
		const opt = req.query?.opt;
		let endpoint = "";

		if (opt === "sip")
			endpoint = `https://api.github.com/repos/Synthetixio/SIPs/contents/content/sips`;
		else if (opt === "sccp")
			endpoint = `https://api.github.com/repos/Synthetixio/SIPs/contents/content/sccp`;
		else res.status(400).send("unknown");

		const contentRes = await axios({
			url: endpoint,
			method: "get",
			headers: {
				Authorization:
					"token " + (req.headers?.authorization ?? req.query.access_token),
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
		console.log(error);
		res.status(400).send();
	}
}
