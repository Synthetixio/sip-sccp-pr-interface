import axios from "axios";

export default async function handler(req, res) {
	try {
		if (req.method === "POST") {
			const { branchName, opt, img, imgExt, username, repo, id } = req.body;

			if (branchName == null || username == null || repo == null || id == null)
				throw "Invaid Fields: branchName, username, repo, id [any]";

			let endpoint = "";
			let filePath = "";

			//  TODO create a branch if it doesn't exist

			//  generate random image name
			const randomName =
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15);

			if (opt === "sip") {
				filePath = `/content/sip/assets/sip-${id}/${randomName}.${imgExt}`;
				endpoint = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
			} else if (opt === "sccp") {
				filePath = `/content/sccp/assets/sccp-${id}/${randomName}.${imgExt}`;
				endpoint = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
			} else res.status(400).send("unknown opt");

			const ghRes = await axios({
				method: "put",
				url: endpoint,
				headers: {
					Authorization: "token " + req.query.access_token,
					Accept: "application/vnd.github+json",
				},
				data: {
					message: "adding image",
					content: Buffer.from(img).toString("base64"),
					branch: branchName,
				},
			});

			if (ghRes.status >= 200 && ghRes.status < 300) {
				const imageUrl = `../content/sccp/asset/sccp-52/snapshot-deviations.svg`;
				res.send(imageUrl);
			}
		} else {
			res.status(404).send();
		}
	} catch (error) {
		console.log(error?.response.data ?? error.response);
		res.status(400).send(error?.response.data ?? error.response);
	}
}
