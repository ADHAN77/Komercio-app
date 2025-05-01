const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "data", "products.json");

console.log("Tentando escrever no arquivo:", filePath);
fs.writeFileSync(filePath, JSON.stringify([{ id: 1, name: "Produto Teste" }], null, 2));

console.log("Arquivo atualizado com sucesso!");