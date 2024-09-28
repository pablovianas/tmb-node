// puppeteer-extra is a drop-in replacement for puppeteer, 
// it augments the installed puppeteer with plugin functionality 

const express = require('express');

const puppeteer = require('puppeteer-extra')


require('dotenv').config();


// add stealth plugin and use defaults (all evasion techniques) 
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const sleep = ms => new Promise(res => setTimeout(res, ms));


const app = express();


app.get('/tmb', async (req, res) => {
  let browser;
  // Inicia o browser
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    // Navega até a página de login
    await page.goto('https://produtor.tmbeducacao.com.br/', { waitUntil: 'networkidle2' });

    await sleep(3000);

    // Preenche o formulário de login
    await page.type('#login', process.env.TMB_USER);

    sleep(5000);

    await page.type('#senha', process.env.TMB_PASS);

    //Submete o formulário
    await Promise.all([
      page.click("body > main > section > div.lg\\:w-1\\/2.w-full.bg-tmb-preto.shadow-lg.shadow-inherit.px-0.z-0.h-auto.overflow-hidden > div > div.flex.flex-col.justify-evenly.flex-1 > div:nth-child(2) > div > div:nth-child(2) > form > div.pb-2.pt-10.md\\:pt-20.flex.flex-col > button > div > div"),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);



    // Navega até a página de transações
    await page.goto('https://produtor.tmbeducacao.com.br/dashboard/transacoes', { waitUntil: 'networkidle2' });

    await sleep(30000);
    await page.screenshot({ path: 'tmb3.png', fullPage: true })



    const quantidadeTotalVendas = await page.$eval('body > main > div.h-screen.flex.flex-col > div > main > div.md\\:mt-auto.flex.flex-col.gap-2.pb-4.md\\:pt-0 > div.flex.flex-col.gap-2.justify-between.lg\\:flex-row > div:nth-child(1) > div > div > div.flex.flex-col.ml-1.w-full.h-full.justify-between > div.flex.flex-col.ml-3 > div.font-light.text-tmb-secundaria.line-clamp-5.max-w-full > h2', el => el.innerText);

    const valorTotalVendas = await page.$eval(
      "body > main > div.h-screen.flex.flex-col > div > main > div.md\\:mt-auto.flex.flex-col.gap-2.pb-4.md\\:pt-0 > div.flex.flex-col.gap-2.justify-between.lg\\:flex-row > div:nth-child(2) > div > div > div.flex.flex-col.ml-1.w-full.h-full.justify-between > div.flex.flex-col.ml-3 > div.font-light.text-tmb-terciaria.line-clamp-5.max-w-full > h2",
      el => el.innerText
    );

    await sleep(10000);

    // Fecha o browser
    await browser.close();

    // Retorna os dados em formato JSON
    res.status(200).json({
      quantidadeTotalVendas,
      valorTotalVendas
    });

  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
});

app.get('/obter-token', async (req, res) => {

  let browser;
  // Inicia o browser
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    // Navega até a página de login
    await page.goto('https://produtor.tmbeducacao.com.br/', { waitUntil: 'networkidle2' });

    await sleep(5000);

    // Preenche o formulário de login
    await page.type('#login', process.env.TMB_USER);

    sleep(5000);
    await page.type('#senha', process.env.TMB_PASS);

    //Submete o formulário
    await Promise.all([
      page.click("body > main > section > div.lg\\:w-1\\/2.w-full.bg-tmb-preto.shadow-lg.shadow-inherit.px-0.z-0.h-auto.overflow-hidden > div > div.flex.flex-col.justify-evenly.flex-1 > div:nth-child(2) > div > div:nth-child(2) > form > div.pb-2.pt-10.md\\:pt-20.flex.flex-col > button > div > div"),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    const cookies = await page.cookies();

    cookies.filter(cookie => cookie.name === 'tmb.token').map(cookie => {
      res.status(200).json({ token: cookie.value });
    });

  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  finally {
    if (browser) await browser.close();
  }
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});