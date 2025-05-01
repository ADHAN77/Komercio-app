const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const storage = require("./storage");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        icon: path.join(__dirname, "assets", "icon", "logo.ico"), //aqui está o ícone
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        frame: false
    });

    mainWindow.loadFile("index.html");

    mainWindow.webContents.once("did-finish-load", () => {
        mainWindow.webContents.send("load-products", storage.getProducts());
    });
});

ipcMain.on("add-product", (_, product) => {
    storage.addProduct(product);
    mainWindow.webContents.send("load-products", storage.getProducts());
});

ipcMain.on("get-products", () => {
    mainWindow.webContents.send("load-products", storage.getProducts());
});

ipcMain.on("fechar-app", () => {
    app.quit();
});