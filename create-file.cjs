const fs = require("node:fs")
const fileName = "file-[round].txt"

async function create () {
  const MAX_ROUND = 512
  let round = 0
  let fileSize = 1024 //Start with 1kb
  while (round < MAX_ROUND) {
    const destination = `${__dirname}/public/speedtest/${fileName.replace("[round]", round)}`
    const data = generateFile(fileSize)
    fs.writeFileSync(destination, data)
    fileSize = fileSize*1.024
    round++
  }
}
function generateFile (size) {
  const content = "0".repeat(size)
  return content
}

create().then(() => {
  console.log(`Finished!`)
})
