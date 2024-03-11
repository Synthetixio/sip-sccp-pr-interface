import axios from "axios";
import * as cheerio from "cheerio";

//	get all b64 of imgs from html string "file"
const getImages = async ({ file, id }) => {
	const $ = cheerio.load(file);
	const imgs = $("img");
	const images = [];
	for (let i = 0; i < imgs.length; i++) {
		const img = imgs[i];
		const src = img.attribs.src;
		const randomName = Math.random().toString(36).substring(7);
		const ext = src.split(";")[0].split("/")[1];
		const name = `${randomName}.${ext}`;
		const b64 = src.split(",")[1];
		//	replace img src with new name and path
		$(img).attr("src", `./assets/sccp-${id}/${name}`);
		images.push({ name, b64 });
	}
	return { images, updatedFile: $.html() };
};

// upload b64 of image to github
const uploadImage = async ({
	imageB64,
	id,
	imgName,
	username,
	repo,
	branchName,
	access_token,
}) => {
	const imageFilePath = `content/sccp/assets/sccp-${id}/${imgName}`;
	const imageEndpoint = `https://api.github.com/repos/${username}/${repo}/contents/${imageFilePath}`;
	const imageRes = await axios({
		method: "put",
		url: imageEndpoint,
		headers: {
			Authorization: "token " + access_token,
			Accept: "application/vnd.github+json",
		},
		data: {
			content: imageB64,
			message: `upload image for SIP-${id}`,
			branch: branchName,
		},
	});
	return imageRes.data;
};

export default async function handler(req, res) {
	// PROD
	const repo = process.env.NEXT_PUBLIC_PROD_GITHUB_REPO_NAME;
	const owner = process.env.NEXT_PUBLIC_PROD_GITHUB_ACCOUNT_NAME;
	const baseBranch = process.env.NEXT_PUBLIC_PROD_GITHUB_BASE_BRANCH_NAME;

	// DEV
	// const repo = process.env.NEXT_PUBLIC_DEV_GITHUB_REPO_NAME;
	// const owner = process.env.NEXT_PUBLIC_DEV_GITHUB_ACCOUNT_NAME;
	// const baseBranch = process.env.NEXT_PUBLIC_DEV_GITHUB_BASE_BRANCH_NAME;

	if (req.method === "POST") {
		try {
			const {
				username,
				sccp,
				title,
				network,
				author,
				SCCPNumbers,
				createdDate,
				simpleSummary,
				abstract,
				motivation,
				copyright,
			} = req.body;
			if (title == null || username == null) {
				throw new Error("Invaid Fields");
			}

			const authorStr =
				typeof author === "string" ? author : author?.join(", ");
			const requires =
				typeof SCCPNumbers === "string" ? SCCPNumbers : SCCPNumbers?.join(", ");

			const header = `---
sccp: ${sccp}
network: ${network}
title: ${title}
author: ${authorStr ?? ""}
status: Draft
created: ${createdDate.split(" ")[0]}
type: Governance
requires: ${requires ?? "-"}
---
`;

			const PRtitle = `Create SCCP-${sccp}.md`;
			const branchName = PRtitle.replaceAll(" ", "-");
			const filePath = `content/sccp/sccp-${sccp}.md`;

			const body = `
When opening a pull request to submit a new SCCP, please use the suggested template: https://github.com/Synthetixio/SIPs/blob/master/content/sccp/sccp-1.md

We have a GitHub bot that automatically merges some PRs. It will merge yours immediately if certain criteria are met:

The PR edits only existing Draft PRs.
The build passes.
Your Github username or email address is listed in the 'author' header of all affected PRs, inside .
If matching on email address, the email address is the one publicly listed on your GitHub profile.
`;

			const file = `
# Simple Summary

${simpleSummary}

# Abstract

${abstract}

# Motivation

${motivation}

# Copyright

${copyright}

`;

			//?	fork the repo
			await axios({
				method: "post",
				url: `https://api.github.com/repos/${owner}/${repo}/forks`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					"Content-Type": "application/json",
					Accept: "application/vnd.github+json",
				},
			});

			//?	creata a branch in forked repo

			const newBranchAlready = await axios({
				method: "get",
				url: `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${branchName}`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					"Content-Type": "application/json",
					Accept: "application/vnd.github+json",
				},
				validateStatus: () => true,
			});

			//	check if branch already exists.
			if (newBranchAlready?.status !== 200) {
				//	get main branch "sha" hash
				const branchRes = await axios({
					method: "get",
					url: `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${baseBranch}`,
					headers: {
						Authorization:
							"token " + (req.headers?.authorization ?? req.query.access_token),
						"Content-Type": "application/json",
						Accept: "application/vnd.github+json",
					},
				});

				const baseBranchHash = branchRes.data.object.sha;
				//	create new branch
				const newBranchRes = await axios({
					method: "post",
					url: `https://api.github.com/repos/${username}/${repo}/git/refs`,
					headers: {
						Authorization:
							"token " + (req.headers?.authorization ?? req.query.access_token),
						Accept: "application/vnd.github+json",
					},
					data: {
						ref: `refs/heads/${branchName}`,
						sha: baseBranchHash,
					},
				});
				console.log(newBranchRes.data);
				newBranchData = newBranchRes.data;
			} else {
				console.log("branch already exists");
				newBranchData = newBranchAlready.data;
			}

			//? 		UPLOAD ALL IMAGES TO GITHUB AND REPLACE WITH URLS

			const { images, updatedFile } = await getImages({ file, id: sccp });

			//	upload imgs to github
			await Promise.all(
				images.map((img) =>
					uploadImage({
						imageB64: img.b64,
						imgName: img.name,
						id: sccp,
						username,
						repo,
						branchName: branchName,
						access_token: req.query.access_token,
					})
				)
			);

			// get content of body tag from updatedFile
			const bodyContent = updatedFile
				.split("<body>")[1]
				.split("</body>")[0]
				.trim();

			const fullFile = `${header}\n\n${bodyContent}`;

			//? create a file in that branch
			await axios({
				method: "put",
				url: `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					Accept: "application/vnd.github+json",
				},
				data: {
					message: "adding appropriate file",
					content: Buffer.from(fullFile).toString("base64"),
					branch: branchName,
				},
			});

			//?	open PR for this change
			const ghRes = await axios({
				method: "post",
				url: `https://api.github.com/repos/${owner}/${repo}/pulls`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					"Content-Type": "application/json",
				},
				data: {
					title: PRtitle,
					body,
					head: `${username + ":" + branchName}`,
					base: baseBranch,
				},
			});

			res.json({ message: "success", data: ghRes.data });
		} catch (error) {
			console.log(error?.response.data ?? error);
			res.status(400).send(error?.response.data ?? error);
		}
	} else {
		res.status(404).send();
	}
}
