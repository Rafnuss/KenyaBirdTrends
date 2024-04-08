import fs from "fs";
import path from "path";

const folderPath = "public/species_map"; // Replace with your actual folder path

fs.readdirSync(folderPath).forEach((file) => {
  const oldFilePath = path.join(folderPath, file);
  const newFileName = file.split("_")[0] + ".png"; // Modify the extension as needed
  const newFilePath = path.join(folderPath, newFileName);

  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) {
      console.error(`Error renaming ${file}: ${err.message}`);
    } else {
      console.log(`Renamed ${file} to ${newFileName}`);
    }
  });
});
