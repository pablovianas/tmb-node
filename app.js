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
  try {
    // Inicia o browser
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Navega até a página de login
    await page.goto('https://produtor.tmbeducacao.com.br/', { waitUntil: 'networkidle2' });

    sleep(5000);

    await page.screenshot({ path: 'tmb.png', fullPage: true })


    // Preenche o formulário de login
    await page.type('#login', process.env.TMB_USER);

    sleep(5000);
    await page.screenshot({ path: 'tmb2.png', fullPage: true })
    await page.type('#senha', process.env.TMB_PASS);
    

    //Submete o formulário
    await Promise.all([
      page.click("body > main > section > div.lg\\:w-1\\/2.w-full.bg-tmb-preto.shadow-lg.shadow-inherit.px-0.z-0.h-auto.overflow-hidden > div > div.flex.flex-col.justify-evenly.flex-1 > div:nth-child(2) > div > div:nth-child(2) > form > div.pb-2.pt-10.md\\:pt-20.flex.flex-col > button > div > div"),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    
    
    // Navega até a página de transações
    await page.goto('https://produtor.tmbeducacao.com.br/dashboard/transacoes', { waitUntil: 'networkidle2' });
    
    await sleep(50000);
    await page.screenshot({ path: 'tmb3.png', fullPage: true })



    const quantidadeTotalVendas = await page.$eval('body > main > div.h-screen.flex.flex-col > div > main > div.md\\:mt-auto.flex.flex-col.gap-2.pb-4.md\\:pt-0 > div.flex.flex-col.gap-2.justify-between.lg\\:flex-row > div:nth-child(1) > div > div > div.flex.flex-col.ml-1.w-full.h-full.justify-between > div.flex.flex-col.ml-3 > div.font-light.text-tmb-secundaria.line-clamp-5.max-w-full > h2', el => el.innerText);

    const valorTotalVendas = await page.$eval(
      "body > main > div.h-screen.flex.flex-col > div > main > div.md\\:mt-auto.flex.flex-col.gap-2.pb-4.md\\:pt-0 > div.flex.flex-col.gap-2.justify-between.lg\\:flex-row > div:nth-child(2) > div > div > div.flex.flex-col.ml-1.w-full.h-full.justify-between > div.flex.flex-col.ml-3 > div.font-light.text-tmb-terciaria.line-clamp-5.max-w-full > h2",
      el => el.innerText
    );

    await sleep(20000);
    await page.screenshot({ path: 'tmb4.png', fullPage: true })


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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});