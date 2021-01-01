const fs = require("fs").promises;
const path = require("path");

async function calculateSalesTotal(salesFiles) {
  let salesTotal = 0;

  for (file of salesFiles) {
    const data = JSON.parse(await fs.readFile(file));
    salesTotal += data.total;
  }

  return salesTotal;
}

async function findSalesFiles(folderName) {
  let salesFiles = [];
  async function findFiles(folderName) {
    // read all the items i the current folder
    const items = await fs.readdir(folderName, { withFileTypes: true});
    //iterate over each found item
    for (item of items) {
      if (item.isDirectory()) {
        // FIND SALES FILES IN THE FOLDER
        await findFiles(path.join(folderName,item.name));
      } else {
        //FIND SALES FILES
        if (path.extname(item.name) === ".json") {
          salesFiles.push(path.join(folderName,item.name));
        }
      }
    }
  }
  await findFiles(folderName);
  return salesFiles;
}

async function main() {
  const salesDir = path.join(__dirname, "stores");
  const salesTotalDir = path.join(__dirname, "salesTotals");

  // create the salesTotal dir if it doesn't exist
  try {
    await fs.mkdir(salesTotalDir);
  } catch {
    console.log(`${salesTotalDir} already exists.`);
  }
  
  const salesFiles = await findSalesFiles(salesDir);
  const salesTotal = await calculateSalesTotal(salesFiles);
  await fs.writeFile(
    path.join(salesTotalDir, "totals.txt"), 
    `${salesTotal}\r\n`,
    { flag: "a" }
  );
  
}

main();