const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const userDataPath = app.getPath("userData"); // diretório seguro para escrita
const dataDir = path.join(userDataPath, "data");
const filePath = path.join(dataDir, "products.json");

// Garante que o diretório "data" existe
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Garante que o arquivo existe e contém um array válido
if (!fs.existsSync(filePath) || fs.readFileSync(filePath, "utf-8").trim() === "") {
    fs.writeFileSync(filePath, JSON.stringify([]));
}

// Obtém os produtos do JSON
function getProducts() {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data || "[]");
    } catch (error) {
        console.error("Erro ao ler JSON:", error);
        return [];
    }
}

// Adiciona um novo produto
function addProduct(product) {
    const products = getProducts();
    products.push(product);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}

// Limpa todos os produtos
function clearProducts() {
    fs.writeFileSync(filePath, JSON.stringify([]));
}

module.exports = { getProducts, addProduct, clearProducts };
