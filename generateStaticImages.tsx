// import fs from "fs-extra";
// import opengraphImage, {
//   generateStaticParams,
// } from "./src/app/articles/[slug]/opengraph-image";

// generateStaticParams().then((allParams) =>
//   Promise.all(
//     allParams.map((params) =>
//       opengraphImage({ params })
//         .then((res) => res.arrayBuffer())
//         .then((buffer) =>
//           fs.outputFile(
//             `./public/articles/${params.slug}/opengraph-image.png`,
//             Buffer.from(buffer),
//           ),
//         ),
//     ),
//   ),
// );
