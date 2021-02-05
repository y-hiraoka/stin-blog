const fs = require("fs").promises;
const path = require("path");

!(async () => {
  const slug = process.argv[2];

  const newFileName = `${slug}.md`;

  const postsDirectory = path.join(process.cwd(), "contents");

  if (!slug) throw new Error("slug must be specified.");

  const fileNames = await fs.readdir(postsDirectory);

  if (fileNames.includes(newFileName)) {
    throw new Error("the slug is already used.");
  }

  const content = `---
title: "Input Title"
createdAt: "${new Date().toISOString()}"
tags: []
---

# Contents Here.
`;

  const filePath = path.join(postsDirectory, newFileName);
  await fs.writeFile(filePath, content);

  console.info("new article was successfully created!");
})();
