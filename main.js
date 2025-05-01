import { join } from "path";
import { app, BrowserWindow, ipcMain } from "electron";
const storage = require(join(__dirname, 'storage.js'));

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        icon: join(__dirname, "assets", "icon", "logo.ico"), //aqui está o ícone
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